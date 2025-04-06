import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

// Create database client
const sql = neon(process.env.DATABASE_URL!);
// @ts-ignore - Type mismatch in drizzle-orm
export const db = drizzle(sql, { schema });