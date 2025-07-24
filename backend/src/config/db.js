import {neon} from '@neondatabase/serverless';
import "dotenv/config";

export const sql = neon(process.env.DATABASE_URL);


export async function initDB() {
  try {
    // First, drop the existing table if it exists (for development)
    await sql`DROP TABLE IF EXISTS transactions`;
    
    // Create the new table with the updated schema
    await sql`CREATE TABLE transactions(
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      category VARCHAR(255) NOT NULL,
      type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
      date DATE NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    
    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initializing db:", error);
    process.exit(1);
  }
}