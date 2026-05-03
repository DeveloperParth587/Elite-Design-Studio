import { Router } from "express";
import { db, projectsTable } from "@workspace/db";
import { eq, ilike, and, type SQL } from "drizzle-orm";
import {
  CreateProjectBody,
  UpdateProjectBody,
  ListProjectsQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/projects/featured", async (req, res) => {
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.featured, true))
      .limit(6);
    res.json(projects.map(mapProject));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch featured projects" });
  }
});

router.get("/projects", async (req, res) => {
  try {
    const parsed = ListProjectsQueryParams.safeParse(req.query);
    const params = parsed.success ? parsed.data : {};

    const conditions: SQL[] = [];
    if (params.category) conditions.push(eq(projectsTable.category, params.category));
    if (params.featured !== undefined) conditions.push(eq(projectsTable.featured, params.featured));
    if (params.search) conditions.push(ilike(projectsTable.title, `%${params.search}%`));

    const projects = await db
      .select()
      .from(projectsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json(projects.map(mapProject));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const parsed = CreateProjectBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const [project] = await db.insert(projectsTable).values(parsed.data).returning();
    res.status(201).json(mapProject(project));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(mapProject(project));
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

    const [project] = await db
      .update(projectsTable)
      .set(parsed.data)
      .where(eq(projectsTable.id, id))
      .returning();
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(mapProject(project));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

function mapProject(p: typeof projectsTable.$inferSelect) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    imageUrl: p.imageUrl,
    featured: p.featured,
    budget: p.budget ?? undefined,
    location: p.location ?? undefined,
    completedAt: p.completedAt ?? undefined,
    createdAt: p.createdAt.toISOString(),
  };
}

export default router;
