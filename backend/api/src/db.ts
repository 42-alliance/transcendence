import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { FastifyInstance } from 'fastify';

export async function initializeDatabase(): Promise<Database> {
    console.error(process.env.DATABASE_PATH);
    const db = await open({
        filename: process.env.DATABASE_PATH || '/app/data/database.sqlite',
        driver: sqlite3.Database
    });

    console.error("yes1");
    await db.exec(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    return db;
}