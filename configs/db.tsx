import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.NEXT_PUBLIC_NEON_DB_CONNECTION_STRING!);
const db = drizzle(sql);

export { db };