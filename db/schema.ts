import { pgTable, text, integer, timestamp, varchar, boolean, enum as pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const members = pgTable("members", {
  id: text("id").primaryKey().default(sql`substr(md5(random()::text), 1, 9)`),
  name: varchar("name", { length: 255 }).notNull(),
  tag: varchar("tag", { length: 255 }),
  notes: text("notes"),
  added_by: text("added_by"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const resources = pgTable("resources", {
  id: text("id").primaryKey().default(sql`substr(md5(random()::text), 1, 9)`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  unit: varchar("unit", { length: 50 }).default("pcs"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const inventory = pgTable("inventory", {
  id: text("id").primaryKey().default(sql`substr(md5(random()::text), 1, 9)`),
  resource_id: text("resource_id").notNull(),
  quantity: integer("quantity").default(0),
  updated_by: text("updated_by"),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey().default(sql`substr(md5(random()::text), 1, 9)`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  resource_id: text("resource_id"),
  required_amount: integer("required_amount").default(0),
  assigned_member_id: text("assigned_member_id"),
  recurrence: pgEnum("recurrence", ["daily", "once", "custom"]).default("daily"),
  created_by: text("created_by"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const taskCompletions = pgTable("task_completions", {
  id: text("id").primaryKey().default(sql`substr(md5(random()::text), 1, 9)`),
  task_id: text("task_id").notNull(),
  member_id: text("member_id"),
  date: varchar("date", { length: 10 }).notNull(),
  amount_collected: integer("amount_collected").default(0),
  completed: boolean("completed").default(false),
  noted_by: text("noted_by"),
  noted_at: timestamp("noted_at").defaultNow().notNull(),
});

export const strikes = pgTable("strikes", {
  id: text("id").primaryKey().default(sql`substr(md5(random()::text), 1, 9)`),
  member_id: text("member_id").notNull(),
  issued_by: text("issued_by"),
  reason: text("reason"),
  points: integer("points").default(1),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const craftedItems = pgTable("crafted_items", {
  id: text("id").primaryKey().default(sql`substr(md5(random()::text), 1, 9)`),
  item_name: varchar("item_name", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  crafted_by: text("crafted_by"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey().default(sql`substr(md5(random()::text), 1, 9)`),
  reference_id: varchar("reference_id", { length: 255 }).notNull(),
  items: text("items").notNull(),
  quantity: integer("quantity").notNull(),
  customer_name: varchar("customer_name", { length: 255 }).notNull(),
  customer_contact: varchar("customer_contact", { length: 255 }),
  notes: text("notes"),
  status: pgEnum("order_status", ["pending", "in_progress", "completed"]).default("pending"),
  assigned_member_id: text("assigned_member_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
