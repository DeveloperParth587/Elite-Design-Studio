import { Router } from "express";
import { db, projectsTable, leadsTable, testimonialsTable } from "@workspace/db";

const router = Router();

function classifyLead(budget: number, timeline: number, propertyType: string): "HOT" | "COLD" {
  const isHotBudget = budget >= 500000;
  const isHotTimeline = timeline <= 30;
  const isHotType = ["full_home", "commercial"].includes((propertyType ?? "").toLowerCase().replace(/\s+/g, "_"));
  return isHotBudget && (isHotTimeline || isHotType) ? "HOT" : "COLD";
}

router.post("/import/projects", async (req, res) => {
  try {
    const { fileBase64 } = req.body as { fileBase64?: string };
    if (!fileBase64) return res.status(400).json({ error: "fileBase64 is required" });

    const { default: ExcelJS } = await import("exceljs");
    const wb = new ExcelJS.Workbook();
    const buffer = Buffer.from(fileBase64, "base64");
    await wb.xlsx.load(buffer);

    const ws = wb.worksheets[0];
    if (!ws) return res.status(400).json({ error: "Workbook has no sheets" });

    const rows: typeof projectsTable.$inferInsert[] = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const title = String(row.getCell(1).value ?? "").trim();
      const description = String(row.getCell(2).value ?? "").trim();
      const category = String(row.getCell(3).value ?? "Residential").trim();
      const imageUrl = String(row.getCell(4).value ?? "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80").trim();
      const featured = String(row.getCell(5).value ?? "false").toLowerCase() === "true";
      const budget = row.getCell(6).value ? String(row.getCell(6).value) : null;
      const location = row.getCell(7).value ? String(row.getCell(7).value).trim() : null;
      if (title && description) {
        rows.push({ title, description, category, imageUrl, featured, budget, location });
      }
    });

    if (rows.length === 0) return res.status(400).json({ error: "No valid rows found. Check header row: Title, Description, Category, ImageURL, Featured (true/false), Budget, Location" });

    const inserted = await db.insert(projectsTable).values(rows).returning();
    res.json({ inserted: inserted.length, message: `Successfully imported ${inserted.length} projects` });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Import failed. Ensure file format is correct." });
  }
});

router.post("/import/leads", async (req, res) => {
  try {
    const { fileBase64 } = req.body as { fileBase64?: string };
    if (!fileBase64) return res.status(400).json({ error: "fileBase64 is required" });

    const { default: ExcelJS } = await import("exceljs");
    const wb = new ExcelJS.Workbook();
    const buffer = Buffer.from(fileBase64, "base64");
    await wb.xlsx.load(buffer);

    const ws = wb.worksheets[0];
    if (!ws) return res.status(400).json({ error: "Workbook has no sheets" });

    const rows: typeof leadsTable.$inferInsert[] = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const name = String(row.getCell(1).value ?? "").trim();
      const email = String(row.getCell(2).value ?? "").trim();
      const phone = row.getCell(3).value ? String(row.getCell(3).value).trim() : null;
      const budget = Number(row.getCell(4).value ?? 0);
      const timeline = Number(row.getCell(5).value ?? 90);
      const propertyType = String(row.getCell(6).value ?? "Full Home").trim();
      const message = row.getCell(7).value ? String(row.getCell(7).value).trim() : null;
      if (name && email && budget > 0) {
        const classification = classifyLead(budget, timeline, propertyType);
        rows.push({ name, email, phone, budget: String(budget), timeline, propertyType, message, classification });
      }
    });

    if (rows.length === 0) return res.status(400).json({ error: "No valid rows found. Check header row: Name, Email, Phone, Budget, Timeline(days), PropertyType, Message" });

    const inserted = await db.insert(leadsTable).values(rows).returning();
    res.json({ inserted: inserted.length, message: `Successfully imported ${inserted.length} leads` });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Import failed. Ensure file format is correct." });
  }
});

router.delete("/admin/clear-data", async (req, res) => {
  try {
    await db.delete(leadsTable);
    await db.delete(projectsTable);
    await db.delete(testimonialsTable);
    res.json({ message: "All data cleared successfully" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to clear data" });
  }
});

export default router;
