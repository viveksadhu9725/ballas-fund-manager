import { createHash } from "crypto";
import { db } from "./client";
import { adminUsers, members, resources, inventory, tasks, taskCompletions, strikes, craftedItems, orders } from "../shared/schema";
import { eq } from "drizzle-orm";

export async function initializeDatabase() {
  try {
    console.log("Initializing database...");
    
    // Check if admin_users table exists by trying to query it
    try {
      const existingAdmin = await db.select().from(adminUsers).limit(1);
      console.log("Database tables already exist");
    } catch (error) {
      console.log("Tables don't exist yet, skipping initialization");
      return;
    }

    // Seed admin user if it doesn't exist
    const adminExists = await db.select().from(adminUsers).where(eq(adminUsers.username, "Ballas")).limit(1);
    
    if (!adminExists.length) {
      console.log("Seeding admin user...");
      const passwordHash = createHash('sha256').update("Webleedpurple").digest('hex');
      await db.insert(adminUsers).values({
        username: "Ballas",
        password_hash: passwordHash,
      });
      console.log("Admin user seeded successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error: any) {
    console.error("Database initialization warning (non-fatal):", error.message);
    // Don't throw - let the app continue even if init fails
  }
}
