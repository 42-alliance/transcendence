import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { FastifyInstance } from 'fastify';

export async function initializeDatabase(): Promise<Database> {
    const db = await open({
        filename: process.env.DATABASE_PATH || 'CHEF_REGARDE_ENV_FILE',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
			intra_picture TEXT NOT NULL,
			upload_picture TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

		CREATE TABLE IF NOT EXISTS friends (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id1 INTEGER NOT NULL,
            user_id2 INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',  -- 'pending', 'accepted', 'rejected', 'blocked'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id1) REFERENCES users(id),
            FOREIGN KEY (user_id2) REFERENCES users(id),
            UNIQUE (user_id1, user_id2)  -- Empêche les doublons
        );
    `);
	
    return db;
}