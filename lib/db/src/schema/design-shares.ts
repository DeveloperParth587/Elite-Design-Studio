import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const designSharesTable = pgTable("design_shares", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  type: text("type").notNull(), // "walkthrough" | "slideshow"
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  frames: text("frames").notNull(), // JSON: Array<{ room|label, b64_json, mimeType }>
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DesignShare = typeof designSharesTable.$inferSelect;
