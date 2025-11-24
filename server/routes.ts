import { Express, Request, Response } from "express";
import { createServer } from "node:http";
import { createHash } from "crypto";
import { db } from "../db/client";
import { members, resources, inventory, tasks, taskCompletions, strikes, craftedItems, orders, adminUsers } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export async function registerRoutes(app: Express) {
  const server = createServer(app);

  // AUTH ROUTES
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const passwordHash = createHash('sha256').update(password).digest('hex');
      const admin = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);

      if (!admin.length || admin[0].password_hash !== passwordHash) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      res.json({ id: admin[0].id, username: admin[0].username });
    } catch (error: any) {
      console.error("Error during login:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // MEMBERS ROUTES
  app.get("/api/members", async (req: Request, res: Response) => {
    try {
      const allMembers = await db.select().from(members);
      res.json(allMembers);
    } catch (error: any) {
      console.error("Error fetching members:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/members", async (req: Request, res: Response) => {
    try {
      const { name, tag, notes } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }
      const result = await db.insert(members).values({
        name,
        tag: tag || null,
        notes: notes || null,
      }).returning();
      res.json(result);
    } catch (error: any) {
      console.error("Error creating member:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/members", async (req: Request, res: Response) => {
    try {
      const { id, name, tag, notes } = req.body;
      if (!id) return res.status(400).json({ error: "ID is required" });
      const result = await db.update(members).set({
        name: name || undefined,
        tag: tag !== undefined ? tag : undefined,
        notes: notes !== undefined ? notes : undefined,
      }).where(eq(members.id, id)).returning();
      if (!result.length) return res.status(404).json({ error: "Member not found" });
      res.json(result);
    } catch (error: any) {
      console.error("Error updating member:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/members/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(members).where(eq(members.id, id));
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting member:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // RESOURCES ROUTES
  app.get("/api/resources", async (req: Request, res: Response) => {
    try {
      const allResources = await db.select().from(resources);
      res.json(allResources);
    } catch (error: any) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/resources", async (req: Request, res: Response) => {
    try {
      const { name, description, unit } = req.body;
      if (!name) return res.status(400).json({ error: "Name is required" });
      const result = await db.insert(resources).values({
        name,
        description: description || null,
        unit: unit || "pcs",
      }).returning();
      res.json(result);
    } catch (error: any) {
      console.error("Error creating resource:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/resources", async (req: Request, res: Response) => {
    try {
      const { id, name, description, unit } = req.body;
      if (!id) return res.status(400).json({ error: "ID is required" });
      const result = await db.update(resources).set({
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        unit: unit || "pcs",
      }).where(eq(resources.id, id)).returning();
      if (!result.length) return res.status(404).json({ error: "Resource not found" });
      res.json(result);
    } catch (error: any) {
      console.error("Error updating resource:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(resources).where(eq(resources.id, id));
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting resource:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // INVENTORY ROUTES
  app.get("/api/inventory", async (req: Request, res: Response) => {
    try {
      const allInventory = await db.select().from(inventory);
      res.json(allInventory);
    } catch (error: any) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/inventory", async (req: Request, res: Response) => {
    try {
      const { resource_id, quantity } = req.body;
      if (!resource_id) return res.status(400).json({ error: "resource_id is required" });
      const result = await db.insert(inventory).values({
        resource_id,
        quantity: quantity || 0,
      }).returning();
      res.json(result);
    } catch (error: any) {
      console.error("Error creating inventory:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/inventory", async (req: Request, res: Response) => {
    try {
      const { id, quantity } = req.body;
      if (!id) return res.status(400).json({ error: "ID is required" });
      const result = await db.update(inventory).set({
        quantity: quantity || 0,
        updated_at: new Date(),
      }).where(eq(inventory.id, id)).returning();
      if (!result.length) return res.status(404).json({ error: "Inventory not found" });
      res.json(result);
    } catch (error: any) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // TASKS ROUTES
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const allTasks = await db.select().from(tasks);
      res.json(allTasks);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const { title, description, resource_id, required_amount, assigned_member_id, recurrence } = req.body;
      if (!title) return res.status(400).json({ error: "Title is required" });
      const result = await db.insert(tasks).values({
        title,
        description: description || null,
        resource_id: resource_id || null,
        required_amount: required_amount || 0,
        assigned_member_id: assigned_member_id || null,
        recurrence: recurrence || "daily",
      }).returning();
      res.json(result);
    } catch (error: any) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/tasks", async (req: Request, res: Response) => {
    try {
      const { id, title, description, resource_id, required_amount, assigned_member_id, recurrence } = req.body;
      if (!id) return res.status(400).json({ error: "ID is required" });
      const result = await db.update(tasks).set({
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        resource_id: resource_id !== undefined ? resource_id : undefined,
        required_amount: required_amount !== undefined ? required_amount : undefined,
        assigned_member_id: assigned_member_id !== undefined ? assigned_member_id : undefined,
        recurrence: recurrence || "daily",
      }).where(eq(tasks.id, id)).returning();
      if (!result.length) return res.status(404).json({ error: "Task not found" });
      res.json(result);
    } catch (error: any) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(tasks).where(eq(tasks.id, id));
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // TASK COMPLETIONS ROUTES
  app.get("/api/task-completions", async (req: Request, res: Response) => {
    try {
      const allCompletions = await db.select().from(taskCompletions).orderBy(desc(taskCompletions.noted_at));
      res.json(allCompletions);
    } catch (error: any) {
      console.error("Error fetching task completions:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/task-completions", async (req: Request, res: Response) => {
    try {
      const { task_id, member_id, date, amount_collected, completed } = req.body;
      if (!task_id) return res.status(400).json({ error: "task_id is required" });
      const result = await db.insert(taskCompletions).values({
        task_id,
        member_id: member_id || null,
        date: date || new Date().toISOString().split('T')[0],
        amount_collected: amount_collected || 0,
        completed: completed || false,
      }).returning();
      res.json(result);
    } catch (error: any) {
      console.error("Error creating task completion:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/task-completions", async (req: Request, res: Response) => {
    try {
      const { id, amount_collected, completed } = req.body;
      if (!id) return res.status(400).json({ error: "ID is required" });
      const result = await db.update(taskCompletions).set({
        amount_collected: amount_collected !== undefined ? amount_collected : undefined,
        completed: completed !== undefined ? completed : undefined,
      }).where(eq(taskCompletions.id, id)).returning();
      if (!result.length) return res.status(404).json({ error: "Task completion not found" });
      res.json(result);
    } catch (error: any) {
      console.error("Error updating task completion:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // STRIKES ROUTES
  app.get("/api/strikes", async (req: Request, res: Response) => {
    try {
      const allStrikes = await db.select().from(strikes).orderBy(desc(strikes.created_at));
      res.json(allStrikes);
    } catch (error: any) {
      console.error("Error fetching strikes:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/strikes", async (req: Request, res: Response) => {
    try {
      const { member_id, reason, points } = req.body;
      if (!member_id) return res.status(400).json({ error: "member_id is required" });
      const result = await db.insert(strikes).values({
        member_id,
        reason: reason || null,
        points: points || 1,
      }).returning();
      res.json(result);
    } catch (error: any) {
      console.error("Error creating strike:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/strikes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(strikes).where(eq(strikes.id, id));
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting strike:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // CRAFTED ITEMS ROUTES
  app.get("/api/crafted-items", async (req: Request, res: Response) => {
    try {
      const items = await db.select().from(craftedItems).orderBy(desc(craftedItems.created_at));
      res.json(items);
    } catch (error: any) {
      console.error("Error fetching crafted items:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/crafted-items", async (req: Request, res: Response) => {
    try {
      const { item_name, quantity, crafted_by } = req.body;
      if (!item_name || !quantity || quantity < 1) {
        return res.status(400).json({ error: "Item name and quantity (>=1) required" });
      }
      const result = await db.insert(craftedItems).values({
        item_name,
        quantity,
        crafted_by: crafted_by || null,
      }).returning();
      res.json(result);
    } catch (error: any) {
      console.error("Error creating crafted item:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/crafted-items", async (req: Request, res: Response) => {
    try {
      const { id, item_name, quantity } = req.body;
      if (!id) return res.status(400).json({ error: "ID is required" });
      const result = await db.update(craftedItems).set({
        item_name: item_name || undefined,
        quantity: quantity !== undefined ? quantity : undefined,
        updated_at: new Date(),
      }).where(eq(craftedItems.id, id)).returning();
      if (!result.length) return res.status(404).json({ error: "Item not found" });
      res.json(result);
    } catch (error: any) {
      console.error("Error updating crafted item:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/crafted-items/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(craftedItems).where(eq(craftedItems.id, id));
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting crafted item:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ORDERS ROUTES
  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      const allOrders = await db.select().from(orders).orderBy(desc(orders.created_at));
      res.json(allOrders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const { reference_id, items, quantity, customer_name, customer_contact, notes, status, assigned_member_id } = req.body;
      if (!reference_id || !items || !quantity || !customer_name) {
        return res.status(400).json({ error: "Required fields missing" });
      }
      const result = await db.insert(orders).values({
        reference_id,
        items,
        quantity,
        customer_name,
        customer_contact: customer_contact || null,
        notes: notes || null,
        status: status || "pending",
        assigned_member_id: assigned_member_id || null,
      }).returning();
      res.json(result);
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/orders", async (req: Request, res: Response) => {
    try {
      const { id, reference_id, items, quantity, customer_name, customer_contact, notes, status, assigned_member_id } = req.body;
      if (!id) return res.status(400).json({ error: "ID is required" });
      const result = await db.update(orders).set({
        reference_id: reference_id || undefined,
        items: items || undefined,
        quantity: quantity !== undefined ? quantity : undefined,
        customer_name: customer_name || undefined,
        customer_contact: customer_contact !== undefined ? customer_contact : undefined,
        notes: notes !== undefined ? notes : undefined,
        status: status || "pending",
        assigned_member_id: assigned_member_id !== undefined ? assigned_member_id : undefined,
        updated_at: new Date(),
      }).where(eq(orders.id, id)).returning();
      if (!result.length) return res.status(404).json({ error: "Order not found" });
      res.json(result);
    } catch (error: any) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(orders).where(eq(orders.id, id));
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return server;
}
