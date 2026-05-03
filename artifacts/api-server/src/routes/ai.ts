import { Router } from "express";
import { ai, generateImage as geminiGenerateImage } from "@workspace/integrations-gemini-ai";
import { EnhancePromptBody, GenerateImageBody, GenerateEmailBody } from "@workspace/api-zod";

const router = Router();

const GEMINI_MODEL = "gemini-2.5-flash";

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

    // Optionally enhance with Gemini text first
    if (enhance) {
      try {
        const enhResponse = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: [{
            role: "user",
            parts: [{ text: `Convert to detailed interior design image prompt (max 80 words, photorealistic, professional photography, luxury): "${prompt}"` }]
          }],
          config: { maxOutputTokens: 200 }
        });
        enhancedPrompt = enhResponse.text?.trim() ?? prompt;
      } catch { /* fall back to original prompt */ }
    }

    // Use Gemini image generation (routes through Replit AI Integration proxy — always works)
    const imageResult = await geminiGenerateImage(
      `Interior design concept: ${enhancedPrompt}. Photorealistic, architectural photography style, professional lighting, high resolution.`
    );

    res.json({
      imageBase64: imageResult.b64_json,
      mimeType: imageResult.mimeType,
      enhancedPrompt,
    });
  } catch (err) {
    req.log.error(err);
    const msg = err instanceof Error ? err.message : "Image generation failed";
    res.status(502).json({ error: `Generation failed: ${msg}. Please retry.` });
  }
});

router.post("/ai/generate-slideshow", async (req, res) => {
  try {
    const { prompt } = req.body as { prompt?: string };
    if (!prompt?.trim()) return res.status(400).json({ error: "Prompt is required" });

    const base = prompt.trim();

    const perspectives = [
      {
        label: "Overview",
        suffix: "Wide-angle full room overview, architectural photography, natural and ambient lighting, ultra-realistic, 8K.",
      },
      {
        label: "Detail",
        suffix: "Close-up detail shot focusing on premium materials, textures, and finishes. Shallow depth of field, luxury magazine style.",
      },
      {
        label: "Mood",
        suffix: "Atmospheric dusk or evening mood lighting, warm golden tones, cinematic, evocative and emotive interior photography.",
      },
    ];

    const slides = await Promise.all(
      perspectives.map(async ({ label, suffix }) => {
        const fullPrompt = `${base}. ${suffix}`;
        const result = await geminiGenerateImage(fullPrompt);
        return { label, b64_json: result.b64_json, mimeType: result.mimeType };
      })
    );

    res.json({ slides });
  } catch (err) {
    req.log.error(err);
    const msg = err instanceof Error ? err.message : "Slideshow generation failed";
    res.status(502).json({ error: `Generation failed: ${msg}. Please retry.` });
  }
});

router.post("/ai/generate-walkthrough", async (req, res) => {
  try {
    const { prompt } = req.body as { prompt?: string };
    if (!prompt?.trim()) return res.status(400).json({ error: "Prompt is required" });

    const base = prompt.trim();

    const rooms = [
      {
        room: "Entrance Foyer",
        suffix: "Grand entrance foyer, eye-level straight-on view, premium flooring, statement lighting fixture, architectural details, welcoming atmosphere.",
      },
      {
        room: "Living Room",
        suffix: "Spacious living room, wide-angle shot from corner, sofa arrangement, coffee table, feature wall, ambient and accent lighting.",
      },
      {
        room: "Kitchen & Dining",
        suffix: "Open-plan kitchen and dining area, island or breakfast bar, pendant lights, high-end appliances, natural light from windows.",
      },
      {
        room: "Master Bedroom",
        suffix: "Master bedroom, centred on the bed, statement headboard, bedside tables, soft warm lighting, luxurious textiles and finishes.",
      },
      {
        room: "Bathroom",
        suffix: "Luxury en-suite bathroom, freestanding or built-in bath, rainfall shower, marble or stone finishes, spa-like tranquil atmosphere.",
      },
    ];

    const frames = await Promise.all(
      rooms.map(async ({ room, suffix }) => {
        const fullPrompt = `${base}. Room: ${room}. ${suffix} Photorealistic interior photography, professional lighting, architectural digest quality, ultra-realistic, 8K.`;
        const result = await geminiGenerateImage(fullPrompt);
        return { room, b64_json: result.b64_json, mimeType: result.mimeType };
      })
    );

    res.json({ frames });
  } catch (err) {
    req.log.error(err);
    const msg = err instanceof Error ? err.message : "Walkthrough generation failed";
    res.status(502).json({ error: `Generation failed: ${msg}. Please retry.` });
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
