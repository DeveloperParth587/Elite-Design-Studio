import { Router } from "express";
import { db } from "@workspace/db";
import { designSharesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";

const router = Router();

router.post("/shares", async (req, res) => {
  try {
    const { type, title, prompt, frames } = req.body as {
      type?: string;
      title?: string;
      prompt?: string;
      frames?: unknown[];
    };

    if (!type || !prompt?.trim() || !Array.isArray(frames) || frames.length === 0) {
      return res.status(400).json({ error: "type, prompt, and frames are required" });
    }

    const token = randomBytes(8).toString("hex");
    const shareTitle = title?.trim() || `${type === "walkthrough" ? "Interior Walkthrough" : "Design Concept"} — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

    await db.insert(designSharesTable).values({
      token,
      type,
      title: shareTitle,
      prompt: prompt.trim(),
      frames: JSON.stringify(frames),
    });

    res.json({ token, title: shareTitle });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create share" });
  }
});

router.get("/shares/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const [share] = await db
      .select()
      .from(designSharesTable)
      .where(eq(designSharesTable.token, token))
      .limit(1);

    if (!share) return res.status(404).json({ error: "Share not found" });

    res.json({
      token: share.token,
      type: share.type,
      title: share.title,
      prompt: share.prompt,
      frames: JSON.parse(share.frames),
      createdAt: share.createdAt,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch share" });
  }
});

export default router;
