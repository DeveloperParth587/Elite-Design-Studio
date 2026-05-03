import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { requireAdmin } from "../middlewares/adminAuth";
import healthRouter from "./health";
import projectsRouter from "./projects";
import leadsRouter from "./leads";
import testimonialsRouter from "./testimonials";
import aiRouter from "./ai";
import dashboardRouter from "./dashboard";
import importRouter from "./import";
import sharesRouter from "./shares";
import authRouter from "./auth";
import type { Request, Response, NextFunction } from "express";

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

const router: IRouter = Router();

// ── Always public ────────────────────────────────────────────────────────────
router.use(healthRouter);
router.use(sharesRouter);
router.use(authRouter);

// ── Public read-only: portfolio & lead submission ────────────────────────────
router.get("/projects/featured", projectsRouter);
router.get("/testimonials", testimonialsRouter);
router.post("/leads", leadsRouter);

// ── Admin-only: everything else requires auth + admin email ──────────────────
router.use(requireAuth);
router.use(requireAdmin);
router.use(projectsRouter);
router.use(leadsRouter);
router.use(testimonialsRouter);
router.use(aiRouter);
router.use(dashboardRouter);
router.use(importRouter);

export default router;
