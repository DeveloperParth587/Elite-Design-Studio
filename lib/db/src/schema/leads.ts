import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  budget: numeric("budget", { precision: 12, scale: 2 }).notNull(),
  timeline: integer("timeline").notNull(),
  propertyType: text("property_type").notNull(),
  message: text("message"),
  classification: text("classification").notNull().default("COLD"),
  generatedEmail: text("generated_email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({ id: true, createdAt: true, classification: true, generatedEmail: true });
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;
