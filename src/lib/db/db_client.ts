import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

const localDBName = "database.db";
const targetDBName = localDBName;
const targetDBPath = path.join(app.getPath('userData'), targetDBName);
const localDBPath = process.env.NODE_ENV === 'development'
    ? localDBName
    : path.join(process.resourcesPath, localDBName);

// copy the local db over to the app directory
// if it doesn't already exist
const sqlite = new Database(localDBPath);
export const db = drizzle(sqlite);