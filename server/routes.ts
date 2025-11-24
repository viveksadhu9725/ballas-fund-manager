import { Express, Request, Response } from "express";
import { createServer } from "node:http";

// In-memory storage
const storage = {
  members: new Map(),
  resources: new Map(),
  inventory: new Map(),
  tasks: new Map(),
  taskCompletions: new Map(),
  strikes: new Map(),
  craftedItems: new Map(),
  orders: new Map(),
};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export async function registerRoutes(app: Express) {
  const server = createServer(app);

  // GET /api/members
  app.get("/api/members", async (req: Request, res: Response) => {
    try {
      const members = Array.from(storage.members.values());
      res.json(members);
    } catch (error: any) {
      console.error("Error fetching members:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/members
  app.post("/api/members", async (req: Request, res: Response) => {
    try {
      const { name, tag, notes } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }
      const id = generateId();
      const member = {
        id,
        name,
        tag: tag || null,
        notes: notes || null,
        added_by: null,
        created_at: new Date().toISOString()
      };
      storage.members.set(id, member);
      res.json([member]);
    } catch (error: any) {
      console.error("Error creating member:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/members
  app.patch("/api/members", async (req: Request, res: Response) => {
    try {
      const { id, name, tag, notes } = req.body;
      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }
      const member = storage.members.get(id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      const updated = { ...member, name, tag: tag || null, notes: notes || null };
      storage.members.set(id, updated);
      res.json([updated]);
    } catch (error: any) {
      console.error("Error updating member:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/members/:id
  app.delete("/api/members/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      storage.members.delete(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting member:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/resources
  app.get("/api/resources", async (req: Request, res: Response) => {
    try {
      const resources = Array.from(storage.resources.values());
      res.json(resources);
    } catch (error: any) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/resources
  app.post("/api/resources", async (req: Request, res: Response) => {
    try {
      const { name, description, unit } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }
      const id = generateId();
      const resource = {
        id,
        name,
        description: description || null,
        unit: unit || "pcs",
        created_at: new Date().toISOString()
      };
      storage.resources.set(id, resource);
      res.json([resource]);
    } catch (error: any) {
      console.error("Error creating resource:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/resources
  app.patch("/api/resources", async (req: Request, res: Response) => {
    try {
      const { id, name, description, unit } = req.body;
      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }
      const resource = storage.resources.get(id);
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }
      const updated = { ...resource, name, description: description || null, unit: unit || "pcs" };
      storage.resources.set(id, updated);
      res.json([updated]);
    } catch (error: any) {
      console.error("Error updating resource:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/resources/:id
  app.delete("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      storage.resources.delete(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting resource:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/inventory
  app.get("/api/inventory", async (req: Request, res: Response) => {
    try {
      const inventory = Array.from(storage.inventory.values());
      res.json(inventory);
    } catch (error: any) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/inventory
  app.post("/api/inventory", async (req: Request, res: Response) => {
    try {
      const { resource_id, quantity } = req.body;
      if (!resource_id) {
        return res.status(400).json({ error: "resource_id is required" });
      }
      const id = generateId();
      const inv = {
        id,
        resource_id,
        quantity: quantity || 0,
        updated_at: new Date().toISOString()
      };
      storage.inventory.set(id, inv);
      res.json([inv]);
    } catch (error: any) {
      console.error("Error creating inventory:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/inventory
  app.patch("/api/inventory", async (req: Request, res: Response) => {
    try {
      const { id, quantity } = req.body;
      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }
      const inv = storage.inventory.get(id);
      if (!inv) {
        return res.status(404).json({ error: "Inventory not found" });
      }
      const updated = { ...inv, quantity, updated_at: new Date().toISOString() };
      storage.inventory.set(id, updated);
      res.json([updated]);
    } catch (error: any) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/tasks
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const tasks = Array.from(storage.tasks.values());
      res.json(tasks);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/tasks
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const { title, description, resource_id, required_amount, assigned_member_id, recurrence } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }
      const id = generateId();
      const task = {
        id,
        title,
        description: description || null,
        resource_id: resource_id || null,
        required_amount: required_amount || 0,
        assigned_member_id: assigned_member_id || null,
        recurrence: recurrence || "daily",
        created_at: new Date().toISOString()
      };
      storage.tasks.set(id, task);
      res.json([task]);
    } catch (error: any) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/tasks
  app.patch("/api/tasks", async (req: Request, res: Response) => {
    try {
      const { id, title, description, resource_id, required_amount, assigned_member_id, recurrence } = req.body;
      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }
      const task = storage.tasks.get(id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      const updated = { ...task, title, description, resource_id, required_amount, assigned_member_id, recurrence };
      storage.tasks.set(id, updated);
      res.json([updated]);
    } catch (error: any) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/tasks/:id
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      storage.tasks.delete(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/task-completions
  app.get("/api/task-completions", async (req: Request, res: Response) => {
    try {
      const completions = Array.from(storage.taskCompletions.values()).slice(-100);
      res.json(completions);
    } catch (error: any) {
      console.error("Error fetching task completions:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/task-completions
  app.post("/api/task-completions", async (req: Request, res: Response) => {
    try {
      const { task_id, member_id, date, amount_collected, completed } = req.body;
      if (!task_id) {
        return res.status(400).json({ error: "task_id is required" });
      }
      const id = generateId();
      const completion = {
        id,
        task_id,
        member_id: member_id || null,
        date: date || new Date().toISOString().split('T')[0],
        amount_collected: amount_collected || 0,
        completed: completed || false,
        noted_at: new Date().toISOString()
      };
      storage.taskCompletions.set(id, completion);
      res.json([completion]);
    } catch (error: any) {
      console.error("Error creating task completion:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/task-completions
  app.patch("/api/task-completions", async (req: Request, res: Response) => {
    try {
      const { id, amount_collected, completed } = req.body;
      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }
      const completion = storage.taskCompletions.get(id);
      if (!completion) {
        return res.status(404).json({ error: "Completion not found" });
      }
      const updated = { ...completion, amount_collected, completed, noted_at: new Date().toISOString() };
      storage.taskCompletions.set(id, updated);
      res.json([updated]);
    } catch (error: any) {
      console.error("Error updating task completion:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/task-completions/:id
  app.delete("/api/task-completions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      storage.taskCompletions.delete(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting task completion:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/strikes
  app.get("/api/strikes", async (req: Request, res: Response) => {
    try {
      const strikes = Array.from(storage.strikes.values());
      res.json(strikes);
    } catch (error: any) {
      console.error("Error fetching strikes:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/strikes
  app.post("/api/strikes", async (req: Request, res: Response) => {
    try {
      const { member_id, reason, points } = req.body;
      if (!member_id) {
        return res.status(400).json({ error: "member_id is required" });
      }
      const id = generateId();
      const strike = {
        id,
        member_id,
        reason: reason || null,
        points: points || 1,
        issued_by: null,
        created_at: new Date().toISOString()
      };
      storage.strikes.set(id, strike);
      res.json([strike]);
    } catch (error: any) {
      console.error("Error creating strike:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/strikes/:id
  app.delete("/api/strikes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      storage.strikes.delete(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting strike:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/crafted-items
  app.get("/api/crafted-items", async (req: Request, res: Response) => {
    try {
      const items = Array.from(storage.craftedItems.values()).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      res.json(items);
    } catch (error: any) {
      console.error("Error fetching crafted items:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/crafted-items
  app.post("/api/crafted-items", async (req: Request, res: Response) => {
    try {
      const { item_name, quantity, crafted_by } = req.body;
      if (!item_name) {
        return res.status(400).json({ error: "Item name is required" });
      }
      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Quantity must be at least 1" });
      }
      const id = generateId();
      const now = new Date().toISOString();
      const item = {
        id,
        item_name,
        quantity,
        crafted_by: crafted_by || null,
        created_at: now,
        updated_at: now
      };
      storage.craftedItems.set(id, item);
      res.json([item]);
    } catch (error: any) {
      console.error("Error creating crafted item:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/crafted-items
  app.patch("/api/crafted-items", async (req: Request, res: Response) => {
    try {
      const { id, item_name, quantity } = req.body;
      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }
      const item = storage.craftedItems.get(id);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      const updated = {
        ...item,
        item_name: item_name || item.item_name,
        quantity: quantity !== undefined ? quantity : item.quantity,
        updated_at: new Date().toISOString()
      };
      storage.craftedItems.set(id, updated);
      res.json([updated]);
    } catch (error: any) {
      console.error("Error updating crafted item:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/crafted-items/:id
  app.delete("/api/crafted-items/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      storage.craftedItems.delete(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting crafted item:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/orders
  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      const orders = Array.from(storage.orders.values()).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      res.json(orders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/orders
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const { reference_id, items, quantity, customer_name, customer_contact, notes, status, assigned_member_id } = req.body;
      if (!reference_id || !items || !quantity || !customer_name) {
        return res.status(400).json({ error: "Required fields missing" });
      }
      const id = generateId();
      const now = new Date().toISOString();
      const order = {
        id,
        reference_id,
        items,
        quantity,
        customer_name,
        customer_contact: customer_contact || null,
        notes: notes || null,
        status: status || 'pending',
        assigned_member_id: assigned_member_id || null,
        created_at: now,
        updated_at: now
      };
      storage.orders.set(id, order);
      res.json([order]);
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/orders
  app.patch("/api/orders", async (req: Request, res: Response) => {
    try {
      const { id, reference_id, items, quantity, customer_name, customer_contact, notes, status, assigned_member_id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }
      const order = storage.orders.get(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const updated = {
        ...order,
        reference_id: reference_id || order.reference_id,
        items: items || order.items,
        quantity: quantity !== undefined ? quantity : order.quantity,
        customer_name: customer_name || order.customer_name,
        customer_contact: customer_contact !== undefined ? customer_contact : order.customer_contact,
        notes: notes !== undefined ? notes : order.notes,
        status: status || order.status,
        assigned_member_id: assigned_member_id !== undefined ? assigned_member_id : order.assigned_member_id,
        updated_at: new Date().toISOString()
      };
      storage.orders.set(id, updated);
      res.json([updated]);
    } catch (error: any) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/orders/:id
  app.delete("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      storage.orders.delete(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return server;
}
