import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { FastifyInstance } from 'fastify';

export async function initializeDatabase(): Promise<Database> {
    const db = await open({
        filename: process.env.DATABASE_PATH || '/app/data/database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
			intra_picture TEXT NOT NULL,
			upload_picture TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    return db;
}