// load helper
const helper = require('../helper.js');
// load other DAOs if needed
//example: const LandDao = require('./landDao.js');

class templateDao {

    /**
	* @param {import('better-sqlite3').Database} dbConnection - The database connection
	*/
    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    loadById(id) {

        // Code goes here

        return result;
    }

    loadAll() {
        // Code goes here

        return result;
    }

    exists(id) {

        // Code goes here

        //return true/false;
    }

    create(strasse = '', hausnummer = '', adresszusatz = '', plz = '', ort = '', landId = 1) {
        
        // Code goes here

        return this.loadById(result.lastInsertRowid);
    }

    update(id, strasse = '', hausnummer = '', adresszusatz = '', plz = '', ort = '', landId = 1) {

        // Code goes here

        return this.loadById(id);
    }

    delete(id) {
        // Code goes here
    }

    toString() {
        console.log('templateDao [_conn=' + this._conn + ']');
    }
}

module.exports = templateDao;