// load helpers
const helper = require('../helper.js');
const daoHelper = require('./daoHelper.js');

// TODO Add JSDoc comments to all methods
// TODO Make date handling consistent (either use strings or DateTime objects throughout the DAO)
// Post uses DateTime objects, Put uses strings
// Strings is probably better because the validation middleware uses strings
// TODO change var to const/let

// TODO #70 Update this file according to new DB schema

/**
 * Data Access Object for plants
 */
class plantsDao {

    /**
	* @param {import('better-sqlite3').Database} dbConnection - The database connection
	*/
	constructor(dbConnection) {
		this._conn = dbConnection;
	}

	loadById(plant_id) {
		var sql = 'SELECT * FROM plants WHERE plant_id=?';
		var statement = this._conn.prepare(sql);
		var result = statement.get(plant_id);
		
		if (helper.isUndefined(result)){
			throw new Error('No record found by plant_id=' + plant_id);
		}

		return result;
	}

	/**
	 * Loads all plants from the DB
	 * By default, composted plants are excluded
	 * @param {boolean} includeComposted whether to include composted plants
	 * @returns {json[]}
	 */
	loadAll(includeComposted = false) {
		let sql = 'SELECT * FROM plants ';
		if (!includeComposted) {
			sql += 'WHERE composted IS NULL ';
		}
		sql += 'ORDER BY name';
		let statement = this._conn.prepare(sql);
		let result = statement.all();
		let arrayResult = daoHelper.guaranteeArray(result);
		return arrayResult;
	}

	/**
	 * Loads all composted plants from the DB
	 * @returns {json[]}
	 */
	loadAllComposted() {
		let sql = 'SELECT * FROM plants WHERE composted IS NOT NULL ORDER BY name';
		let statement = this._conn.prepare(sql);
		let result = statement.all();
		let arrayResult = daoHelper.guaranteeArray(result);
		return arrayResult;
	}

	exists(id) {
		var sql = 'SELECT COUNT(plant_id) AS cnt FROM plants WHERE plant_id=?';
		var statement = this._conn.prepare(sql);
		var result = statement.get(id);

		if (result.cnt == 1){
			return true;
		}

		return false;
	}

	create(name, species_name, image, added, watering_interval, watering_interval_offset) {
		var formatted_date = helper.formatToSQLDate(added);
		var sql = 'INSERT INTO plants (name, species_name, image, added, watering_interval, watering_interval_offset) VALUES (?,?,?,?,?,?)';
		var statement = this._conn.prepare(sql);
		var params = [name, species_name, image, formatted_date, watering_interval, watering_interval_offset];
		var result = statement.run(params);

		if (result.changes != 1){
			throw new Error('Could not insert new record. Data: ' + params);
		}

		return this.loadById(result.lastInsertRowid);
	}

	update(plant_id, name, species_name, image, watering_interval, watering_interval_offset, composted) {
		var sql = 'UPDATE plants SET name=?, species_name=?, image=?, watering_interval=?, watering_interval_offset=?, composted=? WHERE plant_id=?';
		var statement = this._conn.prepare(sql);
		var params = [name, species_name, image, watering_interval, watering_interval_offset, composted, plant_id];
		var result = statement.run(params);

		if (result.changes != 1){
			throw new Error('Could not update existing record. Data: ' + params);
		}

		return this.loadById(plant_id);
	}

	delete(plant_id) {
		try{
			var sql = 'DELETE FROM plants WHERE plant_id=?';
			var statement = this._conn.prepare(sql);
			var result = statement.run(plant_id);

			if (result.changes != 1){
				throw new Error('Could not delete record by plant_id=' + plant_id);
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

module.exports = plantsDao;