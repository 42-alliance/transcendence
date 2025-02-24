import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

export async function initializeDatabase(): Promise<Database> {
    const db = await open({
        filename: process.env.USER_DATABASE_PATH!,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id BIGINT UNIQUE,
            name TEXT NOT NULL,
			picture TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

		CREATE TABLE IF NOT EXISTS friends (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id1 BIGINT NOT NULL,
            user_id2 BIGINT NOT NULL,
            status TEXT DEFAULT 'pending',  -- 'pending', 'accepted', 'rejected', 'blocked'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id1) REFERENCES users(id),
            FOREIGN KEY (user_id2) REFERENCES users(id),
            UNIQUE (user_id1, user_id2)  -- Empêche les doublons
        );
    `);
	
    return db;
}