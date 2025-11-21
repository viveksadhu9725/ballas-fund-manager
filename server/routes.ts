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

  return server;
}
