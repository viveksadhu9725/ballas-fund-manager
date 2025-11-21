import { Express, Request, Response } from "express";
import { createServer } from "node:http";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function registerRoutes(app: Express) {
  const server = createServer(app);

  // Helper to query database
  async function queryDb(text: string, params?: any[]) {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // GET /api/members
  app.get("/api/members", async (req: Request, res: Response) => {
    try {
      const result = await queryDb("SELECT * FROM members ORDER BY created_at DESC");
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching members:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/members
  app.post("/api/members", async (req: Request, res: Response) => {
    try {
      const { name, tag, notes } = req.body;
      const result = await queryDb(
        "INSERT INTO members (name, tag, notes, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
        [name, tag || null, notes || null]
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error creating member:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/members
  app.patch("/api/members", async (req: Request, res: Response) => {
    try {
      const { id, name, tag, notes } = req.body;
      const result = await queryDb(
        "UPDATE members SET name = $1, tag = $2, notes = $3 WHERE id = $4 RETURNING *",
        [name, tag || null, notes || null, id]
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error updating member:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/members/:id
  app.delete("/api/members/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await queryDb("DELETE FROM members WHERE id = $1", [id]);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting member:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/resources
  app.get("/api/resources", async (req: Request, res: Response) => {
    try {
      const result = await queryDb("SELECT * FROM resources ORDER BY name");
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/resources
  app.post("/api/resources", async (req: Request, res: Response) => {
    try {
      const { name, description, unit } = req.body;
      const result = await queryDb(
        "INSERT INTO resources (name, description, unit, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
        [name, description || null, unit || "pcs"]
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error creating resource:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/resources
  app.patch("/api/resources", async (req: Request, res: Response) => {
    try {
      const { id, name, description, unit } = req.body;
      const result = await queryDb(
        "UPDATE resources SET name = $1, description = $2, unit = $3 WHERE id = $4 RETURNING *",
        [name, description || null, unit || "pcs", id]
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error updating resource:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/resources/:id
  app.delete("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await queryDb("DELETE FROM resources WHERE id = $1", [id]);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting resource:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/inventory
  app.get("/api/inventory", async (req: Request, res: Response) => {
    try {
      const result = await queryDb("SELECT * FROM inventory");
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/inventory
  app.post("/api/inventory", async (req: Request, res: Response) => {
    try {
      const { resource_id, quantity } = req.body;
      const result = await queryDb(
        "INSERT INTO inventory (resource_id, quantity, updated_at) VALUES ($1, $2, NOW()) RETURNING *",
        [resource_id, quantity || 0]
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error creating inventory:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/inventory
  app.patch("/api/inventory", async (req: Request, res: Response) => {
    try {
      const { id, quantity } = req.body;
      const result = await queryDb(
        "UPDATE inventory SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
        [quantity, id]
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error updating inventory:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/tasks
  app.get("/api/tasks", async (req: Request, res: Response) => {
    try {
      const result = await queryDb("SELECT * FROM tasks ORDER BY created_at DESC");
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/tasks
  app.post("/api/tasks", async (req: Request, res: Response) => {
    try {
      const { title, description, resource_id, required_amount, assigned_member_id, recurrence } = req.body;
      const result = await queryDb(
        "INSERT INTO tasks (title, description, resource_id, required_amount, assigned_member_id, recurrence, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *",
        [title, description || null, resource_id || null, required_amount || 0, assigned_member_id || null, recurrence || "daily"]
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/tasks
  app.patch("/api/tasks", async (req: Request, res: Response) => {
    try {
      const { id, title, description, resource_id, required_amount, assigned_member_id, recurrence } = req.body;
      const result = await queryDb(
        "UPDATE tasks SET title = $1, description = $2, resource_id = $3, required_amount = $4, assigned_member_id = $5, recurrence = $6 WHERE id = $7 RETURNING *",
        [title, description || null, resource_id || null, required_amount || 0, assigned_member_id || null, recurrence || "daily", id]
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/tasks/:id
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await queryDb("DELETE FROM tasks WHERE id = $1", [id]);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/task-completions
  app.get("/api/task-completions", async (req: Request, res: Response) => {
    try {
      const result = await queryDb("SELECT * FROM task_completions ORDER BY noted_at DESC LIMIT 100");
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching task completions:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/task-completions
  app.post("/api/task-completions", async (req: Request, res: Response) => {
    try {
      const { task_id, member_id, date, amount_collected, completed } = req.body;
      const result = await queryDb(
        "INSERT INTO task_completions (task_id, member_id, date, amount_collected, completed, noted_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
        [task_id, member_id || null, date, amount_collected || 0, completed || false]
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error creating task completion:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/task-completions
  app.patch("/api/task-completions", async (req: Request, res: Response) => {
    try {
      const { id, amount_collected, completed } = req.body;
      const result = await queryDb(
        "UPDATE task_completions SET amount_collected = $1, completed = $2, noted_at = NOW() WHERE id = $3 RETURNING *",
        [amount_collected || 0, completed || false, id]
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error updating task completion:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/task-completions/:id
  app.delete("/api/task-completions/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await queryDb("DELETE FROM task_completions WHERE id = $1", [id]);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting task completion:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/strikes
  app.get("/api/strikes", async (req: Request, res: Response) => {
    try {
      const result = await queryDb("SELECT * FROM strikes ORDER BY created_at DESC");
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching strikes:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/strikes
  app.post("/api/strikes", async (req: Request, res: Response) => {
    try {
      const { member_id, reason, points } = req.body;
      const result = await queryDb(
        "INSERT INTO strikes (member_id, reason, points, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",
        [member_id, reason || null, points || 1]
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error creating strike:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/strikes/:id
  app.delete("/api/strikes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await queryDb("DELETE FROM strikes WHERE id = $1", [id]);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting strike:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return server;
}
