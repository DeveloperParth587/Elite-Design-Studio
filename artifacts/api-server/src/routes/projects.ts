import { Router } from "express";
import { supabase, type ProjectRow } from "@workspace/db";
import {
  CreateProjectBody,
  UpdateProjectBody,
  ListProjectsQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/projects/featured", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("featured", true)
      .limit(6);
    if (error) throw error;
    res.json((data ?? []).map(r => mapProjectRow(r as ProjectRow)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch featured projects" });
  }
});

router.get("/projects", async (req, res) => {
  try {
    const parsed = ListProjectsQueryParams.safeParse(req.query);
    const params = parsed.success ? parsed.data : {};

    let query = supabase.from("projects").select("*");
    if (params.category) query = query.eq("category", params.category);
    if (params.featured !== undefined) query = query.eq("featured", params.featured);
    if (params.search) query = query.ilike("title", `%${params.search}%`);

    const { data, error } = await query;
    if (error) throw error;
    res.json((data ?? []).map(r => mapProjectRow(r as ProjectRow)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const parsed = CreateProjectBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const d = parsed.data;
    const { data, error } = await supabase
      .from("projects")
      .insert({
        title: d.title,
        description: d.description,
        category: d.category,
        image_url: d.imageUrl,
        featured: d.featured ?? false,
        budget: d.budget ?? null,
        location: d.location ?? null,
        completed_at: d.completedAt ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(mapProjectRow(data as ProjectRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return res.status(404).json({ error: "Not found" });
    res.json(mapProjectRow(data as ProjectRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.put("/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = UpdateProjectBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const d = parsed.data;
    const patch: Record<string, unknown> = {};
    if (d.title !== undefined) patch.title = d.title;
    if (d.description !== undefined) patch.description = d.description;
    if (d.category !== undefined) patch.category = d.category;
    if (d.imageUrl !== undefined) patch.image_url = d.imageUrl;
    if (d.featured !== undefined) patch.featured = d.featured;
    if (d.budget !== undefined) patch.budget = d.budget;
    if (d.location !== undefined) patch.location = d.location;
    if (d.completedAt !== undefined) patch.completed_at = d.completedAt;

    const { data, error } = await supabase
      .from("projects")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error || !data) return res.status(404).json({ error: "Not found" });
    res.json(mapProjectRow(data as ProjectRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

function mapProjectRow(p: ProjectRow) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    imageUrl: p.image_url,
    featured: p.featured,
    budget: p.budget ?? undefined,
    location: p.location ?? undefined,
    completedAt: p.completed_at ?? undefined,
    createdAt: p.created_at,
  };
}

export default router;
