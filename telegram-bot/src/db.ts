import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { config } from './config.js';
import * as schema from '../../shared/schema.js';

// Create the Neon HTTP client
const sql = neon(config.database.url);

// Create Drizzle instance
export const db = drizzle(sql, { schema });

export type Database = typeof db;
