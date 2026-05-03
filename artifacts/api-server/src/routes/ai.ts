import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { EnhancePromptBody, GenerateImageBody, GenerateEmailBody } from "@workspace/api-zod";
import pRetry, { AbortError } from "p-retry";

const router = Router();

const GEMINI_MODEL = "gemini-2.0-flash";

async function callHuggingFace(url: string, body: object, hfToken: string): Promise<Response> {
  return pRetry(
    async () => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120_000),
      });

      if (res.status === 503) {
        throw new AbortError("Model still loading after wait timeout");
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HF API ${res.status}: ${text.slice(0, 200)}`);
      }

      return res;
    },
    {
      retries: 3,
      minTimeout: 8000,
      maxTimeout: 20000,
      onFailedAttempt: (error) => {
        if (error instanceof AbortError) throw error;
      },
    }
  );
}

router.post("/ai/enhance-prompt", async (req, res) => {
  try {
    const parsed = EnhancePromptBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const { prompt } = parsed.data;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{
        role: "user",
        parts: [{
          text: `You are an expert interior design prompt engineer for AI image generation. Transform this simple interior design prompt into a highly detailed, photorealistic image generation prompt.

Simple prompt: "${prompt}"

Rules:
- Add specific style (modern, luxury, minimalist, Japandi, etc.)
- Add lighting details (warm ambient, golden hour, soft diffused, dramatic)
- Add materials and textures (marble flooring, walnut wood panels, brushed gold fixtures, linen upholstery)
- Add mood and atmosphere
- Add "ultra realistic, professional interior photography, 8K resolution, hyperrealistic, architectural digest" at the end
- Keep it under 100 words
- Output ONLY the enhanced prompt text, nothing else, no labels or explanation`
        }]
      }],
      config: { maxOutputTokens: 300 }
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
          model: GEMINI_MODEL,
          contents: [{
            role: "user",
            parts: [{ text: `Convert to detailed interior design image prompt (max 80 words, ultra realistic, professional photography): "${prompt}"` }]
          }],
          config: { maxOutputTokens: 200 }
        });
        enhancedPrompt = enhResponse.text?.trim() ?? prompt;
      } catch { /* use original */ }
    }

    const hfToken = process.env.HUGGING_FACE_API_TOKEN;
    if (!hfToken) return res.status(500).json({ error: "Hugging Face API token not configured" });

    const hfRes = await callHuggingFace(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      { inputs: enhancedPrompt },
      hfToken
    );

    const imageBuffer = await hfRes.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    res.json({ imageBase64, enhancedPrompt });
  } catch (err) {
    req.log.error(err);
    const msg = err instanceof Error ? err.message : "Image generation failed";
    res.status(502).json({ error: `Generation failed: ${msg}. Please retry.` });
  }
});

router.post("/ai/generate-video", async (req, res) => {
  try {
    const { prompt } = req.body as { prompt?: string };
    if (!prompt?.trim()) return res.status(400).json({ error: "Prompt is required" });

    const hfToken = process.env.HUGGING_FACE_API_TOKEN;
    if (!hfToken) return res.status(500).json({ error: "Hugging Face API token not configured" });

    const enhancedPrompt = `${prompt.trim()}, luxury interior design, cinematic, photorealistic, 4K, smooth camera movement`;

    const hfRes = await callHuggingFace(
      "https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b",
      { inputs: enhancedPrompt },
      hfToken
    );

    const videoBuffer = await hfRes.arrayBuffer();
    const videoBase64 = Buffer.from(videoBuffer).toString("base64");
    const contentType = hfRes.headers.get("content-type") ?? "video/mp4";

    res.json({ videoBase64, contentType: contentType.split(";")[0].trim(), prompt: enhancedPrompt });
  } catch (err) {
    req.log.error(err);
    const msg = err instanceof Error ? err.message : "Video generation failed";
    res.status(502).json({ error: `Video generation failed: ${msg}. Please retry.` });
  }
});

router.post("/ai/generate-email", async (req, res) => {
  try {
    const parsed = GenerateEmailBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const { name, budget, projectType } = parsed.data;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
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
      config: { maxOutputTokens: 1000 }
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
