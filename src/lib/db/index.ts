import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// For edge runtime compatibility
if (typeof globalThis.WebSocket === "undefined") {
  // Only import ws in Node.js environment
  neonConfig.webSocketConstructor = require("ws");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

export * from "./schema";
