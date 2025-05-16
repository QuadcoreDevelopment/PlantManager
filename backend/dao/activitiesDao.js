// load helpers
const helper = require('../helper.js');
const daoHelper = require('./daoHelper.js');

class activitiesDao {

	constructor(dbConnection) {
		this._conn = dbConnection;
	}

	getConnection() {
		return this._conn;
	}

	loadById(id) {
		var sql = 'SELECT * FROM  activities WHERE id=? ORDER BY date DESC';
		var statement = this._conn.prepare(sql);
		var result = statement.get(id);

		if (helper.isUndefined(result)){
			throw new Error('No record found by id=' + id);
		}

		return result;
	}

	loadByPlantId(plant_id)
	{
		var sql = 'SELECT * FROM activities WHERE plant_id=? ORDER BY date DESC';
		var statement = this._conn.prepare(sql);
		var result = statement.all(plant_id);
		var arrayResult = daoHelper.guaranteeArray(result);
		return arrayResult;
	}

	loadByPlantIdAndType(plant_id, type)
	{
		var sql = 'SELECT * FROM activities WHERE plant_id=? AND type=? ORDER BY date DESC';
		var statement = this._conn.prepare(sql);
		var params = [plant_id, type];
		var result = statement.get(params);
		var arrayResult = daoHelper.guaranteeArray(result);
		return arrayResult;
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

	create(plant_id, type, date) {
		if (typeof(plant_id) != "number"){
			throw new Error('Could not insert new record. Invalid plant id of type ' + typeof(plant_id));
		}
		if (typeof(type) != "number"){
			throw new Error('Could not insert new record. Invalid activity type of type ' + typeof(type));
		}
		var formatted_date = helper.formatToSQLDate(date);
		var sql = 'INSERT INTO activities (plant_id, type, date) VALUES (?,?,?)';
		var statement = this._conn.prepare(sql);
		var params = [plant_id, type, formatted_date];
		var result = statement.run(params);

		if (result.changes != 1){
			throw new Error('Could not insert new record. Data: ' + params);
		}

		return this.loadById(result.lastInsertRowid);
	}

	update(id, plant_id, type, date) {
		if (typeof(plant_id) != "number"){
			throw new Error('Could not update existing record. Invalid plant id of type ' + typeof(plant_id));
		}
		if (typeof(type) != "number"){
			throw new Error('Could not update existing record. Invalid activity type of type ' + typeof(type));
		}
		var formatted_date = helper.formatToSQLDate(date);
		var sql = 'UPDATE activities SET plant_id=?, type=?, date=? WHERE id=?';
		var statement = this._conn.prepare(sql);
		var params = [plant_id, type, formatted_date, id];
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
			throw new Error(ex.message);
		}
	}

	toString() {
		console.log('templateDao [_conn=' + this._conn + ']');
	}
}

module.exports = activitiesDao;