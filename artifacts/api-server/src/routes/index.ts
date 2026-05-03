import { Router, type IRouter } from "express";
import healthRouter from "./health";
import projectsRouter from "./projects";
import leadsRouter from "./leads";
import testimonialsRouter from "./testimonials";
import aiRouter from "./ai";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(projectsRouter);
router.use(leadsRouter);
router.use(testimonialsRouter);
router.use(aiRouter);
router.use(dashboardRouter);

export default router;
