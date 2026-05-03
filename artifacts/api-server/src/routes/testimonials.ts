import { Router } from "express";
import { supabase, type TestimonialRow } from "@workspace/db";
import { CreateTestimonialBody } from "@workspace/api-zod";

const router = Router();

router.get("/testimonials", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at");
    if (error) throw error;
    res.json((data ?? []).map(r => mapTestimonialRow(r as TestimonialRow)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

router.post("/testimonials", async (req, res) => {
  try {
    const parsed = CreateTestimonialBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const d = parsed.data;
    const { data, error } = await supabase
      .from("testimonials")
      .insert({
        client_name: d.clientName,
        role: d.role,
        content: d.content,
        rating: d.rating ?? 5,
        avatar_url: d.avatarUrl ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(mapTestimonialRow(data as TestimonialRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create testimonial" });
  }
});

router.delete("/testimonials/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
});

function mapTestimonialRow(t: TestimonialRow) {
  return {
    id: t.id,
    clientName: t.client_name,
    role: t.role,
    content: t.content,
    rating: t.rating,
    avatarUrl: t.avatar_url ?? undefined,
    createdAt: t.created_at,
  };
}

export default router;
