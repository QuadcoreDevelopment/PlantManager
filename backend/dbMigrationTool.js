const settingsDao = require('./dao/settingsDao.js');
const plantsDao = require('./dao/plantsDao.js');

/**
 * Checks if the DB is from an earlier version and needs to be upgraded 
 * @param {import('better-sqlite3').Database} dbConnection the connection to the DB
 * @returns {boolean} false if the DB is fine and true if it needs to be migrated
 */
module.exports.dbNeedsMigration = function(dbConnection) {
    // ============== Check requirement for v1.1.0 ==============
    const columnExists = dbConnection.prepare(`
        PRAGMA table_info(plants)
    `).all().some(col => col.name === 'composted');

    if(!columnExists)
    {
        return true;
    }

    // ============== Check requirement for v1.2.0 ==============
    const settingsTableExists = dbConnection.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='settings'
    `).get();
    if (!settingsTableExists) {
        return true;
    }

    // ============== Check requirement for v.. ==============
    // ...

    // All good
    return false;
}

/**
 * Migrates the DB to the current schema
 * @param {import('better-sqlite3').Database} dbConnection the connection to the DB
 */
module.exports.migrateDB = function(dbConnection) {
    console.log('========================== Migration started ==========================');

    console.log('-------------------- Upgrade from v1.0.0 to v1.1.0 --------------------');
    // Add 'composted' column to 'plants' table if it does not exist
    const columnExists = dbConnection.prepare(`
        PRAGMA table_info(plants)
    `).all().some(col => col.name === 'composted');

    if (!columnExists) {
        dbConnection.prepare(`
            ALTER TABLE plants ADD COLUMN composted DATE DEFAULT NULL
        `).run();
        console.log("Column 'composted' added to 'plants' table.");
    } else {
        console.log("Column 'composted' already exists in 'plants' table.");
    }
    console.log('-----------------------------------------------------------------------');

    console.log('-------------------- Upgrade from v1.1.0 to v1.2.0 --------------------');
    const settingsTableExists = dbConnection.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='settings'
    `).get();

    if (!settingsTableExists) {
        // create settings table
        dbConnection.prepare(`
            CREATE TABLE settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        `).run();
        console.log("Table 'settings' created.");
        
        // add default setting 'watering_profile' = 'normal'
        let settingsDaoInstance = new settingsDao(dbConnection);
        settingsDaoInstance.save('watering_profile', 'normal');
        console.log("Default setting 'watering_profile' added with value 'normal'.");

        // update plants table: add two new intervals
        dbConnection.prepare(`
            ALTER TABLE plants ADD COLUMN watering_interval_warm INTEGER NOT NULL DEFAULT 7
        `).run();
        dbConnection.prepare(`
            ALTER TABLE plants ADD COLUMN watering_interval_cold INTEGER NOT NULL DEFAULT 7
        `).run();
        console.log("Columns 'watering_interval_warm' and 'watering_interval_cold' added to 'plants' table.");

        // update plants table: add offset to watering interval
        let plantsDaoInstance = new plantsDao(dbConnection);
        let allPlants = plantsDaoInstance.loadAll(true);
        for(const plant of allPlants) {
            let watering_interval = plant.watering_interval + plant.watering_interval_offset;
            let sql = 'UPDATE plants SET watering_interval=?, watering_interval_warm=?, watering_interval_cold=? WHERE plant_id=?';
		    let statement = dbConnection.prepare(sql);
            let params = [watering_interval, watering_interval, watering_interval, plant.plant_id];
		    statement.run(params);
        }
        console.log("Plants' watering intervals updated with their offsets.");

        // update plants table: remove column watering_interval_offset
        dbConnection.prepare(`
            ALTER TABLE plants DROP COLUMN watering_interval_offset
        `).run();
        console.log("Column 'watering_interval_offset' removed from 'plants' table.");

    } else {
        console.log("Table 'settings' already exists.");
    }

    console.log('-----------------------------------------------------------------------');
    

    // ============== Upgrade from v.. to v.. ==============
    // ...

    console.log('========================== Migration completed ==========================');
}