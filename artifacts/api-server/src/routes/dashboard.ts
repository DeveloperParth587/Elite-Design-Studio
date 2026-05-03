import { Router } from "express";
import { supabase, type LeadRow } from "@workspace/db";

const router = Router();

router.get("/dashboard/stats", async (req, res) => {
  try {
    const [
      { count: totalLeads },
      { count: hotLeads },
      { count: coldLeads },
      { count: totalProjects },
    ] = await Promise.all([
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("classification", "HOT"),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("classification", "COLD"),
      supabase.from("projects").select("*", { count: "exact", head: true }),
    ]);

    const hot = Number(hotLeads ?? 0);
    const cold = Number(coldLeads ?? 0);
    const estimatedRevenue = hot * 2500000 + cold * 500000;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count: newLeadsThisMonth } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth);

    res.json({
      totalLeads: Number(totalLeads ?? 0),
      hotLeads: hot,
      coldLeads: cold,
      totalProjects: Number(totalProjects ?? 0),
      estimatedRevenue,
      newLeadsThisMonth: Number(newLeadsThisMonth ?? 0),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

router.get("/dashboard/lead-chart", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("created_at, classification")
      .order("created_at");
    if (error) throw error;

    const leads = (data ?? []) as Pick<LeadRow, "created_at" | "classification">[];

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthMap = new Map<string, { month: string; hot: number; cold: number }>();

    for (const lead of leads) {
      const d = new Date(lead.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, { month: monthNames[d.getMonth()], hot: 0, cold: 0 });
      }
      const entry = monthMap.get(key)!;
      if (lead.classification === "HOT") entry.hot++;
      else entry.cold++;
    }

    const chart = Array.from(monthMap.values());

    if (chart.length === 0) {
      const now = new Date();
      return res.json(
        Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
          return { month: monthNames[d.getMonth()], hot: 0, cold: 0 };
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
