// load helpers
const helper = require('../helper.js');
const daoHelper = require('./daoHelper.js');
const activitiesDao = require('../dao/activitiesDao.js');
const settingsDao = require('../dao/settingsDao.js');

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

	/**
	 * Extends the plant object with calculated fields
	 * This method modifies the input object directly
	 * It is not intended to be called from outside the DAO
	 * @param {object} plant The plant object to extend
	 */
	#extendPlantObject(plant) {
		const activitiesDaoInstance = new activitiesDao(this._conn);
		const settingsDaoInstance = new settingsDao(this._conn);

		// Datum letztes Bewässern ermitteln 
		let arrWat = activitiesDaoInstance.loadByPlantIdAndType(plant.plant_id,0);
		let last_watered = null;
		if (helper.isArrayEmpty(arrWat))
		{
			// No elements = empty array
			last_watered = new Date(plant.added);
		}
		else
		{
			last_watered = new Date(arrWat[0].date);
		}

		// Berechnung days_since_watering
		let days_since_watering = helper.calculateDaysBetween(last_watered, new Date());

		// get interval based on settings
		let interval = plant.watering_interval;
		switch (settingsDaoInstance.load("watering_profile")) {
			case 'warm':
				interval = plant.watering_interval_warm;
				break;
			case 'cold':
				interval = plant.watering_interval_cold;
				break;
		}
		// Berechnung days_until_watering
		let watering_due = new Date();
		watering_due.setDate(last_watered.getDate() + interval);
		const days_until_watering = helper.calculateDaysBetween(new Date(), watering_due);

		//Bestimmung repotted
		let arrPot = activitiesDaoInstance.loadByPlantIdAndType(plant.plant_id,1);
		let repotted = null;
		if (!helper.isArrayEmpty(arrPot))
		{
			repotted = arrPot[0].date;
		}

		//plant erweitern
		plant.days_since_watering = days_since_watering;
		plant.days_until_watering = days_until_watering;
		plant.repotted = repotted;
	}

	/**
	 * Extends an array of plant objects with calculated fields
	 * This method modifies the input objects directly
	 * It is not intended to be called from outside the DAO
	 * @param {object[]} plants The array of plant objects to extend
	 */
	#extendPlantObjects(plants) {
		for (let plant of plants) {
			this.#extendPlantObject(plant);
		}
	}

	/**
	 * Loads a plant by its plant_id
	 * @param {number} plant_id The plant's id
	 * @returns {object} the plant object
	 */
	loadById(plant_id) {
		let sql = 'SELECT * FROM plants WHERE plant_id=?';
		let statement = this._conn.prepare(sql);
		let result = statement.get(plant_id);
		
		if (helper.isUndefined(result)){
			throw new Error('No record found by plant_id=' + plant_id);
		}

		this.#extendPlantObject(result);
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
		this.#extendPlantObjects(arrayResult);
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
		this.#extendPlantObjects(arrayResult)
		return arrayResult;
	}

	/**
	 * Checks whether a plant with the given plant_id exists
	 * @param {number} plant_id The plant's id
	 * @returns {boolean} true if the plant exists, false otherwise
	 */
	exists(plant_id) {
		let sql = 'SELECT COUNT(plant_id) AS cnt FROM plants WHERE plant_id=?';
		let statement = this._conn.prepare(sql);
		let result = statement.get(plant_id);

		if (result.cnt == 1){
			return true;
		}

		return false;
	}

	/**
	 * Creates a new plant record
	 * @param {string} name The plant's name
	 * @param {string} species_name The plant's species name
	 * @param {string|null} image The plant's image filename or null if no image
	 * @param {string} added The date the plant was added (YYYY-MM-DD)
	 * @param {number} watering_interval The plant's watering interval
	 * @param {number} watering_interval_warm The plant's watering interval for warm profile
	 * @param {number} watering_interval_cold The plant's watering interval for cold profile
	 * @returns {object} the created plant object
	 */
	create(name, species_name, image, added, watering_interval, watering_interval_warm, watering_interval_cold) {
		let sql = 'INSERT INTO plants (name, species_name, image, added, watering_interval, watering_interval_warm, watering_interval_cold) VALUES (?,?,?,?,?,?,?)';
		let statement = this._conn.prepare(sql);
		let params = [name, species_name, image, added, watering_interval, watering_interval_warm, watering_interval_cold];
		let result = statement.run(params);

		if (result.changes != 1){
			throw new Error('Could not insert new record. Data: ' + params);
		}

		let createdPlant = this.loadById(result.lastInsertRowid)
		this.#extendPlantObject(createdPlant)
		return createdPlant;
	}

	/**
	 * Updates an existing plant record
	 * @param {number} plant_id The plant's id
	 * @param {string} name The plant's name
	 * @param {string} species_name The plant's species name
	 * @param {string|null} image The plant's image filename or null if no image
	 * @param {number} watering_interval The plant's watering interval
	 * @param {number} watering_interval_warm The plant's watering interval for warm profile
	 * @param {number} watering_interval_cold The plant's watering interval for cold profile
	 * @param {string|null} composted The date the plant was composted (YYYY-MM-DD) or null if not composted
	 * @returns {object} the updated plant object
	 */
	update(plant_id, name, species_name, image, watering_interval, watering_interval_warm, watering_interval_cold, composted) {
		let sql = 'UPDATE plants SET name=?, species_name=?, image=?, watering_interval=?, watering_interval_offset=?, composted=? WHERE plant_id=?';
		let statement = this._conn.prepare(sql);
		let params = [name, species_name, image, watering_interval, watering_interval_warm, watering_interval_cold, composted, plant_id];
		let result = statement.run(params);

		if (result.changes != 1){
			throw new Error('Could not update existing record. Data: ' + params);
		}

		let updatedPlant = this.loadById(plant_id);
		this.#extendPlantObject(updatedPlant)
		return updatedPlant;
	}

	/**
	 * Deletes a plant by its plant_id
	 * @param {number} plant_id The plant's id
	 * @returns {boolean} true if the plant was deleted, false otherwise
	 */
	delete(plant_id) {
		try{
			let sql = 'DELETE FROM plants WHERE plant_id=?';
			let statement = this._conn.prepare(sql);
			let result = statement.run(plant_id);

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
		console.log('plantsDao [_conn=' + this._conn + ']');
	}
}

module.exports = plantsDao;