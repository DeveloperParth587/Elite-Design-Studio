import { Router } from "express";
import { supabase, type LeadRow } from "@workspace/db";
import { CreateLeadBody, ListLeadsQueryParams, ExportLeadsQueryParams } from "@workspace/api-zod";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

function classifyLead(budget: number, timeline: number, propertyType: string): "HOT" | "COLD" {
  const isHotBudget = budget >= 500000;
  const isHotTimeline = timeline <= 30;
  const isHotType = ["full_home", "commercial"].includes(propertyType.toLowerCase().replace(/\s+/g, "_"));
  return isHotBudget && (isHotTimeline || isHotType) ? "HOT" : "COLD";
}

async function generateEmailForLead(name: string, budget: number, propertyType: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{
          text: `Write a personalized, professional interior design consultation follow-up email.
Client Name: ${name}
Budget: ₹${budget.toLocaleString()}
Project Type: ${propertyType}

Write a warm, premium email from Elite Design Studio. Include subject line. Keep it under 200 words. Be specific to their budget and project type.`
        }]
      }],
      config: { maxOutputTokens: 8192 }
    });
    return response.text ?? "";
  } catch {
    return `Dear ${name},\n\nThank you for reaching out to Elite Design Studio. We're excited to discuss your ${propertyType} project. Our team will be in touch shortly.\n\nWarm regards,\nElite Design Studio`;
  }
}

router.get("/leads/export", async (req, res) => {
  try {
    const parsed = ExportLeadsQueryParams.safeParse(req.query);
    const format = parsed.success ? parsed.data.format : "xlsx";

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at");
    if (error) throw error;
    const leads = (data ?? []) as LeadRow[];

    if (format === "xlsx") {
      const { default: ExcelJS } = await import("exceljs");
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Leads");
      ws.columns = [
        { header: "ID", key: "id", width: 6 },
        { header: "Name", key: "name", width: 20 },
        { header: "Email", key: "email", width: 25 },
        { header: "Phone", key: "phone", width: 16 },
        { header: "Budget (₹)", key: "budget", width: 15 },
        { header: "Timeline (days)", key: "timeline", width: 16 },
        { header: "Property Type", key: "propertyType", width: 18 },
        { header: "Classification", key: "classification", width: 14 },
        { header: "Message", key: "message", width: 30 },
        { header: "Created At", key: "createdAt", width: 20 },
      ];
      leads.forEach(l => ws.addRow({
        id: l.id, name: l.name, email: l.email, phone: l.phone ?? "",
        budget: l.budget, timeline: l.timeline, propertyType: l.property_type,
        classification: l.classification, message: l.message ?? "",
        createdAt: l.created_at,
      }));
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=leads.xlsx");
      const buffer = await wb.xlsx.writeBuffer();
      return res.send(buffer);
    }

    const lines = [
      "Elite Design Studio - Leads Export",
      "=".repeat(40),
      ...leads.map(l => `${l.name} | ${l.email} | ₹${l.budget} | ${l.classification}`),
    ].join("\n");
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", "attachment; filename=leads.txt");
    return res.send(lines);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Export failed" });
  }
});

router.get("/leads", async (req, res) => {
  try {
    const parsed = ListLeadsQueryParams.safeParse(req.query);
    const params = parsed.success ? parsed.data : {};

    let query = supabase.from("leads").select("*").order("created_at");
    if (params.classification) query = query.eq("classification", params.classification);
    if (params.search) query = query.ilike("name", `%${params.search}%`);

    const { data, error } = await query;
    if (error) throw error;

    res.json((data ?? []).map(r => mapLeadRow(r as LeadRow)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

router.post("/leads", async (req, res) => {
  try {
    const parsed = CreateLeadBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });

    const { name, email, phone, budget, timeline, propertyType, message } = parsed.data;
    const classification = classifyLead(Number(budget), timeline, propertyType);
    const generatedEmail = await generateEmailForLead(name, Number(budget), propertyType);

    const { data, error } = await supabase
      .from("leads")
      .insert({
        name, email, phone: phone ?? null,
        budget: Number(budget),
        timeline, property_type: propertyType,
        message: message ?? null,
        classification, generated_email: generatedEmail,
      })
      .select()
      .single();
    if (error) throw error;

    res.status(201).json(mapLeadRow(data as LeadRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to create lead" });
  }
});

router.get("/leads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return res.status(404).json({ error: "Not found" });
    res.json(mapLeadRow(data as LeadRow));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch lead" });
  }
});

router.delete("/leads/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to delete lead" });
  }
});

function mapLeadRow(l: LeadRow) {
  return {
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone ?? undefined,
    budget: Number(l.budget),
    timeline: l.timeline,
    propertyType: l.property_type,
    message: l.message ?? undefined,
    classification: l.classification as "HOT" | "COLD",
    generatedEmail: l.generated_email ?? undefined,
    createdAt: l.created_at,
  };
}

export default router;
