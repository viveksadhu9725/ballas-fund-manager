import { Express, Request, Response } from "express";
import { createServer } from "node:http";

export async function registerRoutes(app: Express) {
  const server = createServer(app);
  const PORT = 5000;

  // Proxy requests to Supabase REST API with service role key
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "";
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

  // API proxy for all Supabase tables
  app.get("/api/:table", async (req: Request, res: Response) => {
    try {
      const { table } = req.params;
      const query = new URLSearchParams(req.query as Record<string, string>);
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?${query}`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json(data);
      }
      res.json(data);
    } catch (error: any) {
      console.error("API error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API proxy for POST requests
  app.post("/api/:table", async (req: Request, res: Response) => {
    try {
      const { table } = req.params;
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?select=*`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(req.body),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json(data);
      }
      res.json(data);
    } catch (error: any) {
      console.error("API error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API proxy for PATCH requests
  app.patch("/api/:table", async (req: Request, res: Response) => {
    try {
      const { table } = req.params;
      const { id, ...data } = req.body;
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}&select=*`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        return res.status(response.status).json(result);
      }
      res.json(result);
    } catch (error: any) {
      console.error("API error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API proxy for DELETE requests
  app.delete("/api/:table/:id", async (req: Request, res: Response) => {
    try {
      const { table, id } = req.params;
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`,
        {
          method: "DELETE",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 204) {
        return res.status(204).send();
      }

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json(data);
      }
      res.json(data);
    } catch (error: any) {
      console.error("API error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return new Promise<void>((resolve) => {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT}`);
      resolve();
    });
  });
}
