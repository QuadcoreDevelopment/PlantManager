import { backendUrl_api } from "./config.mjs";

/**
 * async function to create a new plant on the backend.
 * Requires a initialized alerts display.
 * 
 * @returns {int|null} the plant_id of the new plant, null on error
 */
export async function createPlant(){
	let dateAdded = new Date().toISOString().slice(0, 10);
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
			displayError("Konnte keine neue Pflanze hinzufügen");
			console.log("Unable to create new plant, response was: ", res);
			return null;
		}
		else
		{
			console.log("added new plant");
			let createdId = JSON.parse(JSON.stringify(await res.json())).plant_id;
			return createdId
		}
	}
	catch(exception)
	{
		displayError("Konnte keine neue Pflanze hinzufügen");
		console.log("Unable to create new plant, exception was: ", exception);
		return null;
	}	
} 

/**
 * async function to create a new activity on the backend.
 * Requires a initialized alerts display.
 * 
 * @param {JSON} plant JSON Obj describing a plant that the activity will be created for
 * @param {int} type int that specifies the type of activity
 * @returns {bool} true if it was successful, otherwise returns false
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
			const errorResponse = await res.json();
			if(activity.type == 0) {
				displayError("Konnte die Pflanze " + plant.name + " nicht bewässern (Error: " + res.status + ", Message: " + errorResponse.nachricht + ")");
				console.log("Unable to create activity, response was: ", res, errorResponse);
			} else if(activity.type == 1) {
				displayError("Konnte die Pflanze " + plant.name + " nicht umtopfen (Error: " + res.status + ", Message: " + errorResponse.nachricht + ")");
				console.log("Unable to create activity, response was: ", res, errorResponse);
			} else {
				displayError("Unbekannter Fehler: Konnte keine Activity anlegen");
			}
			return false;
		}
		else
		{
			console.log("created activity");
			return true;
		}
	}
	catch(exception)
	{
		console.log("Unable to create activity, response was: ", exception);
		if(activity.type == 0) {
			displayError("Konnte die Pflanze " + plant.name + " nicht bewässern");
		} else if(activity.type == 1) {
			displayError("Konnte die Pflanze " + plant.name + " nicht umtopfen");
		} else {
			displayError("Unbekannter Fehler: Konnte keine Activity anlegen");
		}
		return false;
	}
}

/**
 * async function to create a new watering activity on the backend.
 * Requires a initialized alerts display.
 * 
 * @param {JSON} plant JSON Obj describing a plant that should be watered
 * @returns {bool} true if it was successful, otherwise returns false
 */
export async function waterPlant(plant)
{
	return await createActivity(plant, 0);
}

/**
 * async function to create a new repot activity on the backend.
 * Requires a initialized alerts display.
 * 
 * @param {JSON} plant JSON Obj describing a plant that should be repoted
 * @returns {bool} true if it was successful, otherwise returns false
 */
export async function repotPlant(plant)
{
	return await createActivity(plant, 1);
}

/**
 * async function to fetch all plants from the backend.
 * Requires an initialized alerts display.
 * 
 * @returns {Array|null} an array containing the plants as jsons or null on error.
 */
export async function fetchPlants() {
	try{
		const res = await fetch(backendUrl_api + '/plants/all');
		// check if it was successful
		if(res.status !== 200) {
			displayError("Fehler beim Abrufen der Pflanzen (Error: " + res.status + ")");
			console.log("Unable to fetch plants, response was: ", res);
			return null;
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
		displayError("Fehler beim Abrufen der Pflanzen: " + exception);
		console.log("Unable to fetch plants, exception was: ", exception);
		return null;
	}
}

/**
* async function to fetch a plant from the backend.
* Requires an initialized alerts display.
* 
* @returns {json|null} containing the plant or null on error.
*/
export async function fetchPlant(plant_id) {
	try{
		const res = await fetch(backendUrl_api + '/plants/get/' + plant_id);
		// check if it was successful
		if(res.status !== 200) {
			displayError("Fehler beim Abrufen der Pflanze (Error: " + res.status + ")");
			console.log("Unable to fetch plants, response was: ", res);
			return null;
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
		displayError("Fehler beim Abrufen der Pflanze: " + exception);
		console.log("Unable to fetch plant, exception was: ", exception);
		return null;
	}
}

/**
 * async function to fetch all activities for the specified plant from the backend.
 * Requires an initialized alerts display.
 * @param {int} plant_id 
 * @returns {Array|null} an array containing the activities as json or null on error
 */
export async function fetchActivities(plant_id) {
	try{
		const res = await fetch(backendUrl_api + '/activities/all/' + plant_id);
		// check if it was successful
		if(res.status !== 200) {
			displayError("Fehler beim Abrufen der Aktivitäten (Error: " + res.status + ")");
			console.log("Unable to fetch activities, response was: ", res);
			return null;
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
		displayError("Fehler beim Abrufen der Aktivitäten: " + exception);
		console.log("Unable to fetch activities, exception was: ", exception);
		return null;
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