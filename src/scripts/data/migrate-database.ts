import { OptimizedDatabaseV1 } from "./data-hive-v1";
import { OptimizedDatabase } from "./data-hive";

/**
 * Migrates all entries from a legacy OptimizedDatabaseV1 into a new OptimizedDatabase. Legacy data is then deleted once migrated. 
 * @param from - The old V1 database.
 * @param to - The new V2 database.
 */
function migrateDb(from: OptimizedDatabaseV1, to: OptimizedDatabase): void {
    const entries = from.entries();
    let migrated = 0;
  
    for (const [key, value] of entries) {
      if (to.get(key) === undefined) {
        to.set(key, value);
        from.delete(key); 
        migrated++;
      } else {
        console.warn(`[${to.name}] Skipping existing key: ${key}`);
      }
    }
  
    console.log(`[${to.name}] Migration complete. ${migrated} entries migrated and deleted from old database.`);
  }

/**
 * Runs migration for all ReplayCraft databases from v1 to the new optimized format.
 */
export function migrateDatabase(): void {
  const migrations = [
    ["replayCraftDatabase", "replayCraftDatabase"],
    ["replayCraftPlayerPosDatabase", "replayCraftPlayerPosDatabase"],
    ["replayCraftPlayerRotDatabase", "replayCraftPlayerRotDatabase"],
    ["replayCraftPlayerActionsDatabase", "replayCraftPlayerActionsDatabase"],
    ["replayCraftBlockInteractionsDatabase", "replayCraftBlockInteractionsDatabase"],
    ["replayCraftBeforeBlockInteractionsDatabase", "replayCraftBeforeBlockInteractionsDatabase"],
    ["replayCraftPlaybackEntityDatabase", "replayCraftPlaybackEntityDatabase"],
    ["replayCraftPlayerArmorWeaponsDatabase", "replayCraftPlayerArmorWeaponsDatabase"],
    ["replayCraftSkinDatabase", "replayCraftSkinDatabase"],
    ["replayCraftSettingsDatabase", "replayCraftSettingsDatabase"]
  ];

  for (const [oldName, newName] of migrations) {
    const oldDb = new OptimizedDatabaseV1(oldName);
    const newDb = new OptimizedDatabase(newName);
    migrateDb(oldDb, newDb);
  }

  console.log("✅ All database migrations complete.");
}
