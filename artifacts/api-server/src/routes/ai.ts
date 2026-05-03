import { Router } from "express";
import { ai, generateImage as geminiGenerateImage } from "@workspace/integrations-gemini-ai";
import { EnhancePromptBody, GenerateImageBody, GenerateEmailBody } from "@workspace/api-zod";
import https from "node:https";

const router = Router();

const GEMINI_MODEL = "gemini-2.5-flash";

// Use node:https directly to bypass any Replit fetch proxy interception
function httpsPost(
  url: string,
  body: object,
  headers: Record<string, string>
): Promise<{ status: number; buffer: Buffer; contentType: string }> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const options: https.RequestOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk: Buffer) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          status: res.statusCode ?? 0,
          buffer: Buffer.concat(chunks),
          contentType: (res.headers["content-type"] ?? "application/octet-stream") as string,
        });
      });
    });
    req.on("error", reject);
    req.setTimeout(120_000, () => {
      req.destroy(new Error("Request timed out after 120s"));
    });
    req.write(data);
    req.end();
  });
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

router.post("/ai/generate-video", async (req, res) => {
  try {
    const { prompt } = req.body as { prompt?: string };
    if (!prompt?.trim()) return res.status(400).json({ error: "Prompt is required" });

    const hfToken = process.env.HUGGING_FACE_API_TOKEN;
    if (!hfToken) return res.status(500).json({ error: "Hugging Face API token not configured" });

    const enhancedPrompt = `${prompt.trim()}, luxury interior design, cinematic, photorealistic, 4K, smooth camera movement`;

    // Use node:https directly to bypass Replit fetch proxy
    const result = await httpsPost(
      "https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b",
      { inputs: enhancedPrompt },
      {
        Authorization: `Bearer ${hfToken}`,
        "x-wait-for-model": "true",
      }
    );

    if (result.status >= 400) {
      const errText = result.buffer.toString("utf8").slice(0, 300);
      throw new Error(`HF ${result.status}: ${errText}`);
    }

    const videoBase64 = result.buffer.toString("base64");
    const contentType = result.contentType.split(";")[0].trim() || "video/mp4";

    res.json({ videoBase64, contentType, prompt: enhancedPrompt });
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
