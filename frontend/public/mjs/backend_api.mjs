import { backendUrl_api } from "./config.mjs";

//TODO currently the functions in this module call displayError directly. Find a more elegant solution.

/**
 * async function to create a new plant on the backend.
 * Throws an exception on error.
 * 
 * @returns {int} the plant_id of the new plant
 */
export async function createPlant(){
	const newPlant = {
		"name": "Neue Pflanze",
		"species_name": "Nova planta",
		"image": null,
		"added": undefined,
		"watering_interval": 7,
		"watering_interval_offset": 0
	};
	try{
		const res = await fetch(backendUrl_api + "/plants", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newPlant)
		});
		
		// check if it was successful
		if(res.status !== 200) {
			const errorResponse = await res.text();
			throw new Error(`Failed to create plant - Error ${res.status}: ${errorResponse}`);
		}
		console.log("created new plant");
		let createdId = JSON.parse(JSON.stringify(await res.json())).plant_id;
		return createdId;
	}
	catch(exception)
	{
		console.error("Error creating plant:", exception);
        throw exception;
	}	
} 

/**
 * async function to create a new activity on the backend.
 * Throws an exception on error.
 * 
 * @param {JSON} plant JSON Obj describing a plant that the activity will be created for
 * @param {int} type int that specifies the type of activity
 */
export async function createActivity(plant, type)
{
	// create new activity
	const activity = {
		"plant_id": plant.plant_id,
		"type": type,
	};

	// send activity to server
	try{
		const res = await fetch(backendUrl_api + "/activities", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(activity)
		});

		// check if it was successful
		if (res.status !== 200) {
			const errorResponse = await res.text();
			throw new Error(`Failed to create activity with type ${type} - Error ${res.status}: ${errorResponse}`);
		}
		else
		{
			console.log("created activity");
		}
	}
	catch(exception)
	{
		console.error("Error creating activity:", exception);
        throw exception;
	}
}

/**
 * async function to create a new watering activity on the backend.
 * Throws an exception on error.
 * 
 * @param {JSON} plant JSON Obj describing the plant that should be watered
 */
export async function waterPlant(plant)
{
	await createActivity(plant, 0);
}

/**
 * async function to create a new repot activity on the backend.
 * Throws an exception on error.
 * 
 * @param {JSON} plant JSON Obj describing a plant that should be repoted
 */
export async function repotPlant(plant)
{
	await createActivity(plant, 1);
}

/**
 * async function to fetch all plants from the backend.
 * Throws an exception on error.
 * 
 * @returns {json[]} an array containing the plants as jsons.
 */
export async function fetchPlants() {
	try{
		const res = await fetch(backendUrl_api + '/plants/all');
		// check if it was successful
		if(res.status !== 200) {
			const errorResponse = await res.text();
			throw new Error(`Failed to fetch plants - Error ${res.status}: ${errorResponse}`);
		}
		else
		{
			const plants = await res.json();
			console.log("fetched plants");
			return plants;
		}
	}
	catch(exception)
	{
		console.error("Error fetching plants:", exception);
        throw exception; // Propagate the error
	}
}

/**
* async function to fetch a plant from the backend.
* Throws an exception on error.
* 
* @returns {json} json containing the plant.
*/
export async function fetchPlant(plant_id) {
	try{
		const res = await fetch(backendUrl_api + '/plants/get/' + plant_id);
		// check if it was successful
		if(res.status !== 200) {
			const errorResponse = await res.text();
			const prefix = "Failed to fetch plant";
			if(errorResponse.includes("No record found"))
			{
				throw new Error(prefix + ` - plant does not exist`);
			}
			throw new Error(prefix + ` - Error ${res.status}: ${errorResponse}`);
		}
		else
		{
			const plant = await res.json();
			console.log("fetched plants");
			return plant;
		}
	}
	catch(exception)
	{
		console.error("Error fetching plant:", exception);
        throw exception;
	}
}

/**
 * async function to fetch all activities for the specified plant from the backend.
 * Throws an exception on error.
 * 
 * @param {int} plant_id 
 * @returns {json[]} an array containing the activities as json
 */
export async function fetchActivities(plant_id) {
	try{
		const res = await fetch(backendUrl_api + '/activities/all/' + plant_id);
		// check if it was successful
		if(res.status !== 200) {
			const errorResponse = await res.text();
			throw new Error(`Failed to fetch activities - Error ${res.status}: ${errorResponse}`);
		}
		else
		{
			const activities = await res.json();
			console.log("fetched activities");
			return activities;
		}
	}
	catch(exception)
	{
		console.error("Error fetching activities:", exception);
        throw exception;
	}
}

/**
 * async function to upload an image to the backend and set it as the default image for the plant
 * Requires an initialized alerts display.
 * @param {FormData} formData The image and plant_id as a FormData Obj
 * @returns {bool} true on success, otherwise false
 */
export async function uploadImageForPlant(formData) {
	try{
		const res = await fetch(backendUrl_api + "/upload/image", {
			method: "PUT",
			body: formData
		});

		// check if it was successful
		if(res.status !== 200) {
			displayError("Fehler beim Upload des Bildes (Error: " + res.status + ")");
			console.log("Unable to upload image, response was: ", await res.json());
			return false;
		}
		else
		{
			console.log("uploaded image");
			return true;
		}
	}
	catch(exception)
	{
		displayError("Fehler beim Upload des Bildes: " + exception);
		console.log("Unable to upload image, exception was: ", exception);
		return false;
	}
}

/**
 * async function to delte a plant and all of its activities on the backend.
 * Requires an initialized alerts display.
 * @param {int} plant_id 
 * @returns {bool} true if deletion successful, false if not successful
 */
export async function deletePlant(plant_id) {
	try {
		// Delete plant, will also delete the plants activities
		const res = await fetch(backendUrl_api + '/plants/' + plant_id, {
			method: 'DELETE'
		});

		if (res.status !== 200) {
			displayError("Fehler beim Löschen der Pflanze (Error: " + res.status + ")");
			console.log("Unable to delete plant, response was: ", res);
			return false;
		} else {
			console.log("Plant and associated activities deleted successfully");
			return true;
		}
	} catch (exception) {
		displayError("Fehler beim Löschen der Pflanze: " + exception);
		console.log("Unable to delete plant, exception was: ", exception);
		return false;
	}
}