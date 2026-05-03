import { Router } from "express";
import { supabase, type DesignShareRow } from "@workspace/db";
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

    const { error } = await supabase.from("design_shares").insert({
      token,
      type,
      title: shareTitle,
      prompt: prompt.trim(),
      frames: JSON.stringify(frames),
    });
    if (error) throw error;

    res.json({ token, title: shareTitle });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create share" });
  }
});

router.get("/shares/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { data, error } = await supabase
      .from("design_shares")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !data) return res.status(404).json({ error: "Share not found" });

    const share = data as DesignShareRow;
    res.json({
      token: share.token,
      type: share.type,
      title: share.title,
      prompt: share.prompt,
      frames: JSON.parse(share.frames),
      createdAt: share.created_at,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch share" });
  }
});

export default router;
