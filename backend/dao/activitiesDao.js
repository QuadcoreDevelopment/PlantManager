// load helpers
const helper = require('../helper.js');
const daoHelper = require('./daoHelper.js');

class activitiesDao {

	/**
	* @param {import('better-sqlite3').Database} dbConnection - The database connection
	*/
	constructor(dbConnection) {
		this._conn = dbConnection;
	}

	/**
	 * Adds additional information to the provided activity.
	 * Note: This method modifies the activity object in place.
	 * Not intended to be called from outside the DAO.
	 * @param {object} activities The activity object to process
	 */
	#extendActivityObject(activity) {
		if (activity && activity.date) { 
			const activityDate = new Date(activity.date);
			const currentDate = new Date(); 
			const daysSince = helper.calculateDaysBetween(activityDate, currentDate);
			activity.days_since = daysSince;
		}
	}

	/**
	 * Adds additional information to each activity in the provided array.
	 * Note: This method modifies the activity objects in place.
	 * Not intended to be called from outside the DAO.
	 * @param {object[]} activities The array of activity objects to process
	 */
	#extendActivityObjects(activities) {
		activities.forEach(activity => {
			this.#extendActivityObject(activity);
		});
	}

	/**
	 * Loads an activity by its ID
	 * @param {int} id The activity ID
	 * @returns The activity object
	 */
	loadById(id) {
		let sql = 'SELECT * FROM  activities WHERE id=? ORDER BY date DESC';
		let statement = this._conn.prepare(sql);
		let result = statement.get(id);

		if (helper.isUndefined(result)){
			throw new Error('No record found by id=' + id);
		}

		this.#extendActivityObject(result);
		return result;
	}

	/**
	 * Loads all activities for a given plant ID
	 * @param {int} plant_id The plant ID
	 * @returns {object[]} An array of activity objects
	 */
	loadByPlantId(plant_id)
	{
		let sql = 'SELECT * FROM activities WHERE plant_id=? ORDER BY date DESC';
		let statement = this._conn.prepare(sql);
		let result = statement.all(plant_id);
		let arrayResult = daoHelper.guaranteeArray(result);
		this.#extendActivityObjects(arrayResult);
		return arrayResult;
	}

	/**
	 * Loads all activities for a given plant ID and activity type
	 * @param {int} plant_id The plant ID
	 * @param {int} type The activity type
	 * @returns {object[]} An array of activity objects
	 */
	loadByPlantIdAndType(plant_id, type)
	{
		let sql = 'SELECT * FROM activities WHERE plant_id=? AND type=? ORDER BY date DESC';
		let statement = this._conn.prepare(sql);
		let params = [plant_id, type];
		let result = statement.get(params);
		let arrayResult = daoHelper.guaranteeArray(result);
		this.#extendActivityObjects(arrayResult);
		return arrayResult;
	}

	/**
	 * Checks if an activity exists by its ID
	 * @param {int} id The activity ID
	 * @returns {boolean} true if the activity exists, false otherwise
	 */
	exists(id) {
		let sql = 'SELECT COUNT(id) AS cnt FROM activities WHERE id=?';
		let statement= this._conn.prepare(sql);
		let result = statement.get(id);
		
		if (result.cnt == 1){
			return true;
		}

		return false;
	}

	/**
	 * Creates a new activity record
	 * @param {number} plant_id The plant ID
	 * @param {number} type The activity type
	 * @param {String} date The activity date (YYYY-MM-DD)
	 * @returns {object} The created activity object
	 */
	create(plant_id, type, date) {
		if (typeof(plant_id) != "number"){
			throw new Error('Could not insert new record. Invalid plant id of type ' + typeof(plant_id));
		}
		if (typeof(type) != "number"){
			throw new Error('Could not insert new record. Invalid activity type of type ' + typeof(type));
		}
		let sql = 'INSERT INTO activities (plant_id, type, date) VALUES (?,?,?)';
		let statement = this._conn.prepare(sql);
		let params = [plant_id, type, date];
		let result = statement.run(params);

		if (result.changes != 1){
			throw new Error('Could not insert new record. Data: ' + params);
		}

		let createdActivity = this.loadById(result.lastInsertRowid);
		this.#extendActivityObject(createdActivity);
		return createdActivity;
	}

	/**
	 * Updates an existing activity record
	 * @param {number} id The activity ID
	 * @param {number} plant_id The plant ID
	 * @param {number} type The activity type
	 * @param {String} date The activity date (YYYY-MM-DD)
	 * @returns {object} The updated activity object
	 */
	update(id, plant_id, type, date) {
		if (typeof(plant_id) != "number"){
			throw new Error('Could not update existing record. Invalid plant id of type ' + typeof(plant_id));
		}
		if (typeof(type) != "number"){
			throw new Error('Could not update existing record. Invalid activity type of type ' + typeof(type));
		}
		let sql = 'UPDATE activities SET plant_id=?, type=?, date=? WHERE id=?';
		let statement = this._conn.prepare(sql);
		let params = [plant_id, type, date, id];
		let result = statement.run(params);

		if (result.changes != 1){
			throw new Error('Could not update existing record. Data: ' + params);
		}

		let updatedActivity = this.loadById(id);
		this.#extendActivityObject(updatedActivity);
		return updatedActivity;
	}

	/**
	 * Deletes an activity by its ID
	 * @param {number} id The activity ID
	 * @returns {boolean} true if the activity was deleted, false otherwise
	 */
	delete(id) {
		try{
			let sql = 'DELETE FROM activities WHERE id=?';
			let statement = this._conn.prepare(sql);
			let result = statement.run(id);

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