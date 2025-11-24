import { z } from "zod";

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
