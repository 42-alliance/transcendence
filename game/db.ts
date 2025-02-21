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
            username TEXT NOT NULL UNIQUE,
            scoreRecap INTEGER DEFAULT 0,
            Victory INTEGER DEFAULT 0,
            Defeat INTEGER DEFAULT 0,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
	
    return db;
}