import { Router, type IRouter } from "express";
import { requireAuth } from "@clerk/express";
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

const router: IRouter = Router();

// ── Public routes ──────────────────────────────────────────────────
router.use(healthRouter);   // GET /healthz
router.use(sharesRouter);   // GET /shares/:token (public share page)
router.use(authRouter);     // GET /me/is-admin

// Public read routes (portfolio & consultation form)
router.get("/projects/featured", (req, res, next) => projectsRouter.handle(req, res, next));
router.get("/testimonials", (req, res, next) => testimonialsRouter.handle(req, res, next));
router.post("/leads", (req, res, next) => leadsRouter.handle(req, res, next));
router.post("/leads/consultation", (req, res, next) => leadsRouter.handle(req, res, next));

// ── Admin-only routes (require auth + admin email) ─────────────────
router.use(requireAuth());
router.use(requireAdmin);

router.use(projectsRouter);
router.use(leadsRouter);
router.use(testimonialsRouter);
router.use(aiRouter);
router.use(dashboardRouter);
router.use(importRouter);

export default router;
