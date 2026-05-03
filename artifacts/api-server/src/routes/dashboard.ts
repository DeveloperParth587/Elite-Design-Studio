import { Router } from "express";
import { db, leadsTable, projectsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const [totalLeadsRow] = await db.select({ count: count() }).from(leadsTable);
    const [hotLeadsRow] = await db.select({ count: count() }).from(leadsTable).where(eq(leadsTable.classification, "HOT"));
    const [coldLeadsRow] = await db.select({ count: count() }).from(leadsTable).where(eq(leadsTable.classification, "COLD"));
    const [totalProjectsRow] = await db.select({ count: count() }).from(projectsTable);

    const hotLeads = hotLeadsRow?.count ?? 0;
    const coldLeads = coldLeadsRow?.count ?? 0;

    // Estimated revenue: HOT leads * avg premium project value (₹25L), COLD * ₹5L
    const estimatedRevenue = Number(hotLeads) * 2500000 + Number(coldLeads) * 500000;

    // New leads this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [newLeadsRow] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(sql`${leadsTable.createdAt} >= ${startOfMonth}`);

    res.json({
      totalLeads: Number(totalLeadsRow?.count ?? 0),
      hotLeads: Number(hotLeads),
      coldLeads: Number(coldLeads),
      totalProjects: Number(totalProjectsRow?.count ?? 0),
      estimatedRevenue,
      newLeadsThisMonth: Number(newLeadsRow?.count ?? 0),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

router.get("/dashboard/lead-chart", async (req, res) => {
  try {
    const rows = await db
      .select({
        month: sql<string>`to_char(${leadsTable.createdAt}, 'Mon')`,
        monthNum: sql<number>`extract(month from ${leadsTable.createdAt})`,
        year: sql<number>`extract(year from ${leadsTable.createdAt})`,
        classification: leadsTable.classification,
        cnt: count(),
      })
      .from(leadsTable)
      .groupBy(
        sql`to_char(${leadsTable.createdAt}, 'Mon')`,
        sql`extract(month from ${leadsTable.createdAt})`,
        sql`extract(year from ${leadsTable.createdAt})`,
        leadsTable.classification
      )
      .orderBy(
        sql`extract(year from ${leadsTable.createdAt})`,
        sql`extract(month from ${leadsTable.createdAt})`
      );

    // Group by month
    const monthMap = new Map<string, { month: string; hot: number; cold: number }>();
    for (const row of rows) {
      const key = `${row.year}-${String(row.monthNum).padStart(2, "0")}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, { month: row.month, hot: 0, cold: 0 });
      }
      const entry = monthMap.get(key)!;
      if (row.classification === "HOT") entry.hot += Number(row.cnt);
      else entry.cold += Number(row.cnt);
    }

    const chart = Array.from(monthMap.values());

    // If no data, return last 6 months with zeros
    if (chart.length === 0) {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const now = new Date();
      return res.json(
        Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
          return { month: months[d.getMonth()], hot: 0, cold: 0 };
        })
      );
    }

    res.json(chart);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
});

export default router;
