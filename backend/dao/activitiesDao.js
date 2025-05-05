// load helper
const helper = require('../helper.js');


class activitiesDao {
	//siehe templateDao.js
	constructor(dbConnection) {
		this._conn = dbConnection;
	}

	getConnection() {
		return this._conn;
	}

	loadById(id) {
		var sql = 'SELECT * FROM  activities where id=?';
		var statement = this._conn.prepare(sql);
		var result = statement.get(id);

		if (helper.isUndefined(result)){
			throw new Error('No record found by id=' + id);
		}

		return result;
	}

	loadAll() {
		var sql = 'SELECT * from activities';
		var statement = this._conn.prepare(sql);
		var result = statement.all();

		if (helper.isArrayEmpty(result)){
			return [];
		}

		return result;
	}

	exists(id) {
		var sql = 'SELECT COUNT(id) AS cnt FROM activities WHERE id=?';
		var statement= this._conn.prepare(sql);
		var result = statement.get(id);
		
		if (result.cnt == 1){
			return true;
		}

		return false;
	}

	create(plant_id = '', type = '', date = '') {
		var sql = 'INSERT INTO activities (plant_id, type, date) VALUES (?,?,?)';
		var statement = this._conn.prepare(sql);
		var params = [plant_id, type, date];
		var result = statement.run(params);

		if (result.changes != 1){
			throw new Error('Could not insert new record. Data: ' + params);
		}

		return this.loadById(result.lastInsertRowid);
	}

	update(id, plant_id = '', type = '', date = '') {
		var sql = 'UPDATE activities SET plant_id=?, type=?, date=? WHERE id=?';
		var statement = this._conn.prepare(sql);
		var params = [plant_id, type, date, id];
		var result = statement.run(params);

		if (result.changes != 1){
			throw new Error('Could not update existing record. Data: ' + params);
		}

		return this.loadById(id);
	}

	delete(id) {
		try{
			var sql = 'DELETE FROM activities WHERE id=?';
			var statement = this._conn.prepare(sql);
			var result = statement.run(id);

			if (result.changes != 1){
				throw new Error('Could not delete record by id=' + id);
			}

			return true;
		}
		catch (ex){
			throw new Error('Could not delete record by id=' + id + '. Reason: ' + ex.message);
		}
	}

	toString() {
		console.log('templateDao [_conn=' + this._conn + ']');
	}
}

module.exports = activitiesDao;