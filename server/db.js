// i keep my database setup here

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;

// i use a connection string so this works local and on render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// i export a helper so i can call db query in other files
export async function query(text, params) {
  return pool.query(text, params);
}
