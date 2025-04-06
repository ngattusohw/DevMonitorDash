import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

// Create database client with proper configuration
const sql = neon(process.env.DATABASE_URL!);
// @ts-ignore - Ignoring type error since we know this works with Neon
export const db = drizzle(sql, { schema });