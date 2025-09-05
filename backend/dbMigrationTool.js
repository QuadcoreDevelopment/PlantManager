/**
 * Checks if the DB is from an earlier version and needs to be upgraded 
 * @param {*} dbConnection the connection to the DB
 * @returns {boolean} false if the DB is fine and true if it needs to be migrated
 */
module.exports.dbNeedsMigration = function(dbConnection) {
    // ============== Check requirement for v1.0.1 ==============
    const columnExists = dbConnection.prepare(`
        PRAGMA table_info(plants)
    `).all().some(col => col.name === 'composted');

    if(!columnExists)
    {
        return true;
    }

    // ============== Check requirement for v.. ==============
    // ...

    // All good
    return false;
}

/**
 * Migrates the DB to the current schema
 * @param {*} dbConnection the connection to the DB
 */
module.exports.migrateDB = function(dbConnection) {
    // ============== Upgrade from v1.0.0 to v1.1.0 ==============
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

    // ============== Upgrade from v1.0.0 to v.. ==============
    // ...
}