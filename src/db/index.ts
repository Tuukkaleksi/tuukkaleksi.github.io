import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!isDatabaseConfigured()) {
    return null;
  }
  if (!dbInstance) {
    const sql = neon(process.env.DATABASE_URL!);
    dbInstance = drizzle(sql, { schema });
  }
  return dbInstance;
}
