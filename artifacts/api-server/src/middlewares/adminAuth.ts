import { getAuth, clerkClient } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const adminEmails = getAdminEmails();

  // No restriction configured — allow all authenticated users
  if (adminEmails.length === 0) {
    next();
    return;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses
      .find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress?.toLowerCase();

    if (!email || !adminEmails.includes(email)) {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    next();
  } catch (err) {
    req.log.error(err, "Admin auth check failed");
    res.status(500).json({ error: "Authorization check failed" });
  }
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return true;

  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses
      .find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress?.toLowerCase();
    return !!email && adminEmails.includes(email);
  } catch {
    return false;
  }
}
