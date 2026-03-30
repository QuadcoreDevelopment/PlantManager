class settingsDao {
    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    /**
     * Loads a setting by key
     * @param {string} key The setting key
     * @returns {string|null} value for the key, or null if not found
     */
    load(key) {
        const stmt = this._conn.prepare('SELECT value FROM settings WHERE key=?');
        const row = stmt.get(key);
        return row ? row.value : null;
    }

    /**
     * Sets a setting value by key
     * The setting is created if it does not exist
     * @param {string} key The setting key
     * @param {string} value The setting value
     * @returns {Object} The result of the insert operation
     */
    save(key, value) {
        const insert = this._conn.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)');
        const result = insert.run(key, value);
        return result;
    }

    /**
     * Loads all settings as key-value pairs
     * @returns {Object} All settings as key-value pairs
     */
    loadAll() {
        const stmt = this._conn.prepare('SELECT key, value FROM settings');
        const rows = stmt.all();
        return rows.reduce((acc, r) => (acc[r.key] = r.value, acc), {});
    }
}

module.exports = settingsDao;