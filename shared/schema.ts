import { z } from "zod";
import { pgTable, text, integer, timestamp, varchar, boolean, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Database Tables
export const recurrenceEnum = pgEnum("recurrence", ["daily", "once", "custom"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "in_progress", "completed"]);

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
  recurrence: recurrenceEnum("recurrence").default("daily"),
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
  status: orderStatusEnum("status").default("pending"),
  assigned_member_id: text("assigned_member_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: text("id").primaryKey().default(sql`substr(md5(random()::text), 1, 9)`),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// App Users (store additional app info)
export interface AppUser {
  id: string;
  supabase_user_id: string | null;
  email: string;
  display_name: string | null;
  role: 'admin' | 'member';
  created_at: string;
}

export const insertAppUserSchema = z.object({
  supabase_user_id: z.string().uuid().nullable(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  role: z.enum(['admin', 'member']).default('member'),
});

export type InsertAppUser = z.infer<typeof insertAppUserSchema>;

// Members (gang members you manage)
export interface Member {
  id: string;
  name: string;
  tag: string | null;
  notes: string | null;
  added_by: string | null;
  created_at: string;
}

export const insertMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tag: z.string().nullable(),
  notes: z.string().nullable(),
});

export type InsertMember = z.infer<typeof insertMemberSchema>;

// Resources (types of resources, e.g., autoparts)
export interface Resource {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  created_at: string;
}

export const insertResourceSchema = z.object({
  name: z.string().min(1, "Resource name is required"),
  description: z.string().nullable(),
  unit: z.string().default('pcs'),
});

export type InsertResource = z.infer<typeof insertResourceSchema>;

// Inventory (current counts per resource)
export interface Inventory {
  id: string;
  resource_id: string;
  quantity: number;
  updated_by: string | null;
  updated_at: string;
}

export const updateInventorySchema = z.object({
  resource_id: z.string().uuid(),
  quantity: z.number().int().min(0, "Quantity must be non-negative"),
});

export type UpdateInventory = z.infer<typeof updateInventorySchema>;

// Tasks (task definition)
export interface Task {
  id: string;
  title: string;
  description: string | null;
  resource_id: string | null;
  required_amount: number;
  assigned_member_id: string | null;
  recurrence: 'daily' | 'once' | 'custom';
  created_by: string | null;
  created_at: string;
}

export const insertTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().nullable(),
  resource_id: z.string().uuid().nullable(),
  required_amount: z.number().int().min(0).default(0),
  assigned_member_id: z.string().uuid().nullable(),
  recurrence: z.enum(['daily', 'once', 'custom']).default('daily'),
});

export type InsertTask = z.infer<typeof insertTaskSchema>;

// Task Completions (daily history)
export interface TaskCompletion {
  id: string;
  task_id: string;
  member_id: string | null;
  date: string;
  amount_collected: number;
  completed: boolean;
  noted_by: string | null;
  noted_at: string;
}

export const insertTaskCompletionSchema = z.object({
  task_id: z.string().uuid(),
  member_id: z.string().uuid().nullable(),
  date: z.string(), // ISO date string
  amount_collected: z.number().int().min(0).default(0),
  completed: z.boolean().default(false),
});

export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;

// Strikes (disciplinary)
export interface Strike {
  id: string;
  member_id: string;
  issued_by: string | null;
  reason: string | null;
  points: number;
  created_at: string;
}

export const insertStrikeSchema = z.object({
  member_id: z.string().uuid(),
  reason: z.string().min(1, "Reason is required"),
  points: z.number().int().min(1).default(1),
});

export type InsertStrike = z.infer<typeof insertStrikeSchema>;

// Audit Logs (optional)
export interface AuditLog {
  id: string;
  actor: string | null;
  action: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export const insertAuditLogSchema = z.object({
  action: z.string(),
  meta: z.record(z.unknown()).nullable(),
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Extended types with relations for UI
export interface MemberWithStrikes extends Member {
  strike_count?: number;
  total_strike_points?: number;
}

export interface TaskWithRelations extends Task {
  resource?: Resource;
  assigned_member?: Member;
}

export interface TaskCompletionWithRelations extends TaskCompletion {
  task?: Task;
  member?: Member;
}

export interface StrikeWithRelations extends Strike {
  member?: Member;
  issuer?: AppUser;
}

// Crafted Items (gang operations crafting management)
export interface CraftedItem {
  id: string;
  item_name: string;
  quantity: number;
  crafted_by: string | null;
  created_at: string;
  updated_at: string;
}

export const insertCraftedItemSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  crafted_by: z.string().nullable().optional(),
});

export type InsertCraftedItem = z.infer<typeof insertCraftedItemSchema>;

export interface CraftedItemWithRelations extends CraftedItem {
  crafter?: Member;
}

// Orders (gang RP orders management)
export interface Order {
  id: string;
  reference_id: string;
  items: string;
  quantity: number;
  customer_name: string;
  customer_contact: string | null;
  notes: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_member_id: string | null;
  created_at: string;
  updated_at: string;
}

export const insertOrderSchema = z.object({
  reference_id: z.string().min(1, "Reference ID is required"),
  items: z.string().min(1, "Items is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  customer_name: z.string().min(1, "Customer name is required"),
  customer_contact: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  assigned_member_id: z.string().nullable().optional(),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;

export interface OrderWithRelations extends Order {
  assigned_member?: Member;
}

// Admin Users (authentication)
export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export const insertAdminUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password_hash: z.string().min(1, "Password hash is required"),
});

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
