import { createHash } from "crypto";
import { db } from "./client";
import { adminUsers } from "../shared/schema";
import { eq } from "drizzle-orm";
import pg from "pg";

const { Pool } = pg;

export async function initializeDatabase() {
  try {
    console.log("Initializing database...");
    
    // Create a direct connection to run raw SQL for table creation
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

    try {
      // Create all tables using raw SQL
      await pool.query(`
        CREATE TABLE IF NOT EXISTS members (
          id text PRIMARY KEY DEFAULT substr(md5(random()::text), 1, 9),
          name varchar(255) NOT NULL,
          tag varchar(255),
          notes text,
          added_by text,
          created_at timestamp DEFAULT NOW() NOT NULL
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS resources (
          id text PRIMARY KEY DEFAULT substr(md5(random()::text), 1, 9),
          name varchar(255) NOT NULL,
          description text,
          unit varchar(50) DEFAULT 'pcs',
          created_at timestamp DEFAULT NOW() NOT NULL
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS inventory (
          id text PRIMARY KEY DEFAULT substr(md5(random()::text), 1, 9),
          resource_id text NOT NULL,
          quantity integer DEFAULT 0,
          updated_by text,
          updated_at timestamp DEFAULT NOW() NOT NULL
        );
      `);

      await pool.query(`
        CREATE TYPE recurrence AS ENUM ('daily', 'once', 'custom');
      `).catch(() => {}); // Ignore if type already exists

      await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id text PRIMARY KEY DEFAULT substr(md5(random()::text), 1, 9),
          title varchar(255) NOT NULL,
          description text,
          resource_id text,
          required_amount integer DEFAULT 0,
          assigned_member_id text,
          recurrence recurrence DEFAULT 'daily',
          created_by text,
          created_at timestamp DEFAULT NOW() NOT NULL
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS task_completions (
          id text PRIMARY KEY DEFAULT substr(md5(random()::text), 1, 9),
          task_id text NOT NULL,
          member_id text,
          date varchar(10) NOT NULL,
          amount_collected integer DEFAULT 0,
          completed boolean DEFAULT false,
          noted_by text,
          noted_at timestamp DEFAULT NOW() NOT NULL
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS strikes (
          id text PRIMARY KEY DEFAULT substr(md5(random()::text), 1, 9),
          member_id text NOT NULL,
          issued_by text,
          reason text,
          points integer DEFAULT 1,
          created_at timestamp DEFAULT NOW() NOT NULL
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS crafted_items (
          id text PRIMARY KEY DEFAULT substr(md5(random()::text), 1, 9),
          item_name varchar(255) NOT NULL,
          quantity integer NOT NULL,
          crafted_by text,
          created_at timestamp DEFAULT NOW() NOT NULL,
          updated_at timestamp DEFAULT NOW() NOT NULL
        );
      `);

      await pool.query(`
        CREATE TYPE order_status AS ENUM ('pending', 'in_progress', 'completed');
      `).catch(() => {}); // Ignore if type already exists

      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id text PRIMARY KEY DEFAULT substr(md5(random()::text), 1, 9),
          reference_id varchar(255) NOT NULL,
          items text NOT NULL,
          quantity integer NOT NULL,
          customer_name varchar(255) NOT NULL,
          customer_contact varchar(255),
          notes text,
          status order_status DEFAULT 'pending',
          assigned_member_id text,
          created_at timestamp DEFAULT NOW() NOT NULL,
          updated_at timestamp DEFAULT NOW() NOT NULL
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id text PRIMARY KEY DEFAULT substr(md5(random()::text), 1, 9),
          username varchar(255) NOT NULL UNIQUE,
          password_hash varchar(255) NOT NULL,
          created_at timestamp DEFAULT NOW() NOT NULL
        );
      `);

      console.log("Database tables created successfully");
    } finally {
      await pool.end();
    }

    // Now seed the admin user if it doesn't exist
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
    console.error("Database initialization error:", error.message);
    // Don't throw - let the app continue
  }
}
