import { Router } from "express";
import { db, testimonialsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateTestimonialBody } from "@workspace/api-zod";

const router = Router();

router.get("/testimonials", async (req, res) => {
  try {
    const testimonials = await db.select().from(testimonialsTable).orderBy(testimonialsTable.createdAt);
    res.json(testimonials.map(mapTestimonial));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

router.post("/testimonials", async (req, res) => {
  try {
    const parsed = CreateTestimonialBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const [t] = await db.insert(testimonialsTable).values(parsed.data).returning();
    res.status(201).json(mapTestimonial(t));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create testimonial" });
  }
});

router.delete("/testimonials/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
});

function mapTestimonial(t: typeof testimonialsTable.$inferSelect) {
  return {
    id: t.id,
    clientName: t.clientName,
    role: t.role,
    content: t.content,
    rating: t.rating,
    avatarUrl: t.avatarUrl ?? undefined,
    createdAt: t.createdAt.toISOString(),
  };
}

export default router;
