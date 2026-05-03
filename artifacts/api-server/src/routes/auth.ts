import { Router } from "express";
import { getAuth } from "@clerk/express";
import { isAdminUser } from "../middlewares/adminAuth";

const router = Router();

router.get("/me/is-admin", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.json({ isAdmin: false });
    return;
  }
  const isAdmin = await isAdminUser(userId);
  res.json({ isAdmin });
});

export default router;
