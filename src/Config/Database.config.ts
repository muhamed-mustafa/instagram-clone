import { Pool } from 'pg';
import { config } from 'dotenv';
config();

export const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT as unknown as number,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
});
