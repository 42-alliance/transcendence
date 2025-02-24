import { FastifyInstance } from 'fastify';
import { Database } from 'sqlite';
import { Database as SQLite3Database } from 'sqlite3';

declare module 'fastify' {
    interface FastifyInstance {
        db: Database<SQLite3Database>;
    }
}
