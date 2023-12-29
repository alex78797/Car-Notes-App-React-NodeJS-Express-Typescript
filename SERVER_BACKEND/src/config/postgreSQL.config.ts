import { Pool } from "pg";
import "dotenv/config"; // too read .env file...also need to add it here with PostgreSQL

/**
 * pg is a non-blocking PostgreSQL client for Node.js.
 * This pool connects the app to a PostgresSQL DataBase.
 */
export const pool = new Pool({
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  password: process.env.DATABASE_PASSWORD,
  user: process.env.DATABASE_USER,
  port: parseInt(process.env.DATABASE_PORT),
});
