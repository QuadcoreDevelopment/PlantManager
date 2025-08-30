/**
 * Checks if the DB is from an earlier version and needs to be upgraded 
 * @param {*} dbConnection the connection to the DB
 * @returns {boolean} false if the DB is fine and true if it needs to be migrated
 */
module.exports.dbNeedsMigration = function(dbConnection) {
    // TODO implement this when necessary
    return false;
}

/**
 * Migrates the DB to the current schema
 * @param {*} dbConnection the connection to the DB
 */
module.exports.migrateDB = function(dbConnection) {
    // TODO implement this when necessary
}