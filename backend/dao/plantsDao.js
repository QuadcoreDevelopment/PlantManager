// load helper
const helper = require('../helper.js');


class plantsDao {

	constructor(dbConnection) {
		this._conn = dbConnection;
	}

	getConnection() {
		return this._conn;
	}

	loadById(id) {
		var sql = 'SELECT * FROM plants WHERE id=?';
		var statement = this._conn.prepare(sql);
		var result = statement.get(id);
		
		if (helper.isUndefined(result)){
			throw new Error('No record found by id=' + id);
		}

		return result;
	}

	loadAll() {
		var sql = 'SELECT * from plants';
		var statement = this._conn.prepare(sql);
		var result = statement.all();

		if (helper.isArrayEmpty(result)){
			return [];
		}

		return result;
	}

	exists(id) {
		var sql = 'SELECT COUNT(id) AS cnt FROM plants WHERE id=?';
		var statement = this._conn.prepare(sql);
		var result = statement.get(id);

		if (result.cnt == 1){
			return true;
		}

		return false;
	}

	create(name='', species_name='', image='', added='', watering_interval='', watering_interval_offset='') {
		var sql = 'INSERT INTO plants (name, species_name, image, added, watering_interval, watering_interval_offset) VALUES (?,?,?,?,?,?)';
		var statement = this._conn.prepare(sql);
		var addedParsed = helper.formatToSQLDate(added);
		var params = [name, species_name, image, addedParsed, watering_interval, watering_interval_offset];
		var result = statement.run(params);

		if (result.changes != 1){
			throw new Error('Could not insert new record. Data: ' + params);
		}

		return this.loadById(result.lastInsertRowid);
	}

	update(id, name='', species_name='', image='', added='', watering_interval='', watering_interval_offset='') {
		var sql = 'UPDATE plants SET name=?, species_name=?, image=?, added=?, watering_interval=?, watering_interval_offset=? WHERE id=?';
		var statement = this._conn.prepare(sql);
		var params = [name, species_name, image, added, watering_interval, watering_interval_offset, id];
		var result = statement.run(params);

		if (result.changes != 1){
			throw new Error('Could not update existing record. Data: ' + params);
		}

		return this.loadById(id);
	}

	delete(id) {
		try{
			var sql = 'DELETE FROM plants WHERE plant_id=?';
			var statement = this._conn.prepare(sql);
			var result = statement.run(id);

			if (result.changes != 1){
				throw new Error('Could not delete record by id=' + id);
			}

			return true;
		}
		catch (ex){
			throw new Error('Could not delete record by id=' + id + '. Reason:' + ex.message);
		}
	}

	toString() {
		console.log('templateDao [_conn=' + this._conn + ']');
	}
}

module.exports = plantsDao;