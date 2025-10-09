import * as worldDBs from "../../classes/subscriptions/world-initialize";
import { OptimizedDatabase } from "../../data/data-hive";

/**
 * Fetches a replay database by its string ID.
 * Throws an error if the ID is invalid or not yet initialized.
 */
export function fetchDatabase(id: string): OptimizedDatabase {
    const db = (worldDBs as any)[id] as OptimizedDatabase;
    if (!db) {
        throw new Error(`[fetchDatabase] Unknown or uninitialized database ID: ${id}`);
    }
    return db;
}

/**
 * Returns all known database IDs that have been initialized.
 */
export function getAllDatabaseIds(): string[] {
    return Object.keys(worldDBs).filter((key) => (worldDBs as any)[key] instanceof OptimizedDatabase);
}
