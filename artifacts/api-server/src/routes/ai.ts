import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { EnhancePromptBody, GenerateImageBody, GenerateEmailBody } from "@workspace/api-zod";

const router = Router();

router.post("/ai/enhance-prompt", async (req, res) => {
  try {
    const parsed = EnhancePromptBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const { prompt } = parsed.data;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{
          text: `You are an expert interior design prompt engineer. Convert this simple interior design prompt into a highly detailed, photorealistic image generation prompt.

Simple prompt: "${prompt}"

Rules:
- Add specific style (modern, luxury, minimalist, etc.)
- Add lighting details (ambient, natural, warm)
- Add materials and textures (marble, wood, fabric)
- Add mood and atmosphere
- End with: "ultra realistic, professional interior photography, 8K resolution, hyperrealistic"
- Keep it under 100 words
- Output ONLY the enhanced prompt, nothing else`
        }]
      }],
      config: { maxOutputTokens: 500 }
    });

    res.json({ original: prompt, enhanced: response.text?.trim() ?? prompt });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to enhance prompt" });
  }
});

router.post("/ai/generate-image", async (req, res) => {
  try {
    const parsed = GenerateImageBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    let { prompt, enhance } = parsed.data;
    let enhancedPrompt = prompt;

    if (enhance) {
      try {
        const enhResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{
            role: "user",
            parts: [{
              text: `Convert to detailed interior design image prompt (max 80 words, ultra realistic): "${prompt}"`
            }]
          }],
          config: { maxOutputTokens: 200 }
        });
        enhancedPrompt = enhResponse.text?.trim() ?? prompt;
      } catch { /* use original */ }
    }

    // Use Hugging Face Stable Diffusion
    const hfToken = process.env.HUGGING_FACE_API_TOKEN;
    if (!hfToken) {
      return res.status(500).json({ error: "Hugging Face API token not configured" });
    }

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          parameters: { guidance_scale: 7.5, num_inference_steps: 30 },
        }),
      }
    );

    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      req.log.error({ errText }, "HF API error");
      return res.status(502).json({ error: "Image generation failed. Model may be loading, please retry." });
    }

    const imageBuffer = await hfResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    res.json({ imageBase64, enhancedPrompt });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

router.post("/ai/generate-email", async (req, res) => {
  try {
    const parsed = GenerateEmailBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const { name, budget, projectType } = parsed.data;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [{
          text: `Write a professional interior design consultation email for a potential client.

Client Details:
- Name: ${name}
- Budget: ₹${budget.toLocaleString()}
- Project Type: ${projectType}

Requirements:
- From: Elite Design Studio
- Warm, premium, personalized tone
- Mention specific budget range and project type
- Include next steps (site visit, consultation call)
- Subject line on first line starting with "Subject: "
- Then a blank line, then the email body
- Under 200 words total`
        }]
      }],
      config: { maxOutputTokens: 8192 }
    });

    const text = response.text ?? "";
    const lines = text.split("\n");
    const subjectLine = lines.find(l => l.startsWith("Subject:")) ?? "Subject: Your Interior Design Consultation";
    const subject = subjectLine.replace("Subject:", "").trim();
    const body = lines.filter(l => !l.startsWith("Subject:")).join("\n").trim();

    res.json({ subject, body });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to generate email" });
  }
});

export default router;
