const backendUrl = 'http://localhost:8000';
const backendUrl_api = backendUrl + '/api';
const backendUrl_plantImages = backendUrl + '/images/plants';

/**
 * Prepares the DOM to display Bootstrap alerts.
 * Must be called before the first time displayAlert().
 * Best called right after the document finished loading.
 */
function initializeAlertDisplay()
{
	console.log("Initializing Alerts Container");
	$("MAIN").prepend($('<div  id="alertsContainer">'));
}

/**
 * Displays a Bootstrap alert in the DOM.
 * Must be called after initializeAlertDisplay().
 * 
 * @param {string} message a string that will be displayed to the user 
 * @param {string} type a string to change the apperance based on Bootsrap (e.g. danger) 
 */
function displayAlert(message, type) {
	
	let alert = $('<div class="alert alert-' + type + ' alert-dismissible" role="alert">');
	alert.append($('<div>'+ message + '</div>'));
	alert.append($('<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'));

	$("#alertsContainer").append(alert);
}

/**
 * Displays the message as in red to the user.
 * Must be called after initializeAlertDisplay().
 * 
 * @param {string} message a string that will be displayed to the user 
 */
function displayError(message) {
	displayAlert(message, "danger");
}

/**
 * Creates a div that will center it self in the center of its parent.
 * The created div will not be attached to the DOM.
 * It will center in both x and y
 * 
 * @returns {*} the created div
 */
function createCenteredDiv()
{
	let div = $("<div>");
	div.prop("class", "text-center justify-content-center w-100 position-relative top-50 start-0 translate-middle-y");
	div.prop("style","margin-top:40vh; margin-bottom:-30vh;");
	return div;
}

/**
 * Creates a Bootstrap loading spinner with a message displayed under it.
 * The created spinner gets appended to the parentDiv.
 * @param {*} parentDiv The parent to which the spinner will be appended.
 * @param {*} message will be displayed under the spinner.
 */
function createSpinner(parentDiv, message)
{
	let spinner = $('<div class="spinner-border text-primary" role="status">');
	let text = $('<p>');
	text.text(message);
	parentDiv.append(spinner);
	parentDiv.append(text);
}

/**
 * Creates a large Bootstrap icon with a small text that will be attached to the supplied parent.
 * @param {*} parent the parent to which it will be attached.
 * @param {string} bsicon the Bootstrap icon string like "bi-leaf".
 * @param {string} text the message that will be displayed under the icon
 */
function createCenteredIconAndText(parent, bsicon, text)
{
	let centeredDiv = createCenteredDiv();
	parent.html(centeredDiv);
	let icon = $("<i>");
	icon.prop("class","bi text-primary " + bsicon);
	icon.prop("style","font-size: 5rem;")
	centeredDiv.append(icon);
	let p = $("<p>");
	p.text(text);
	centeredDiv.append(p);
}

/**
 * Redirects the user to the plants details page.
 * The plant that should be displayed will be passed to the page via the url.
 * 
 * @param {int} plant_id an int that will be passed to the details page
 */
function showPlantDetailsPage(plant_id) 
{
	console.log("Show details for plant with ID: " + plant_id);
	// Redirect to the plant detail page with the plant ID as a query parameter
	window.location.href = 'detailseite_pflanze.html?id=' + plant_id;
}

/**
 * Redirects the user to the plant edit page.
 * The plant that should be displayed will be passed to the page via the url.
 * 
 * @param {int} plant_id a int that will be passed to the edit page
 */
function showPlantEditPage(plant_id) 
{
	console.log("Show edit page for plant with Plant_ID: " + plant_id);
	window.location.href = 'pflanze_bearbeiten.html?plant_id=' + plant_id;
}

/**
 * async function to create a new activity on the backend.
 * Requires a initialized alerts display.
 * 
 * @param {JSON} plant JSON Obj describing a plant that the activity will be created for
 * @param {int} type int that specifies the type of activity
 * @returns {bool} true if it was successful, otherwise returns false
 */
async function createActivity(plant, type)
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
		console.log("Unable to create activity, response was: ", errorResponse);
		if(activity.type == 0) {
			displayError("Konnte die Pflanze " + plant.name + " nicht bewässern");
		} else if(activity.type == 1) {
			displayError("Konnte die Pflanze " + plant.name + " nicht umtopfen");
		} else {
			displayError("Unbekannter Fehler: Konnte keine Activity anlegen");
		}
		return false;
	}
	return false;
}

/**
 * async function to create a new watering activity on the backend.
 * Requires a initialized alerts display.
 * 
 * @param {JSON} plant JSON Obj describing a plant that should be watered
 * @returns {bool} true if it was successful, otherwise returns false
 */
async function waterPlant(plant)
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
async function repotPlant(plant)
{
	return await createActivity(plant, 1);
}

/**
 * async function to fetch all plants from the backend.
 * Requires an initialized alerts display.
 * 
 * @returns {Array|null} an array containing the plants as jsons or null on error.
 */
async function fetchPlants() {
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
async function fetchPlant(plant_id) {
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
async function fetchActivities(plant_id) {
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
async function uploadImageForPlant(formData) {
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
async function deletePlant(plant_id) {
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

/**
* Returns the fitting value from the URL for the argument presented
* @param {string} argument a string which will function as key for the value in the URL parameters
* @returns value associated with presented key and null if unsuccessful
*/
function getArgumentFromURL(argument){
	let urlParams = new URLSearchParams(window.location.search);
	let argValue = urlParams.get(argument);
	if (argValue == null || argValue == undefined){
		console.log("Gesuchtes Argument nicht in URL vorhanden")
		return null;
	}
	else{
		return argValue;
	}	
}

/**
 * Returns the translated location to the given number. If number invalid, returns "not specified"
 * @param {int} watering_interval_offset key, that is then translated
 * @returns string with the desired location
 */

function wateringIntervalToLocation(watering_interval_offset) {
	if (watering_interval_offset == -3) {
		plantLocation = "extrem sonnig"
	} else if (watering_interval_offset == -2) {
		plantLocation = "sehr sonnig";
	} else if (watering_interval_offset == -1) {
		plantLocation = "sonnig";
	} else if (watering_interval_offset == 0) {
		plantLocation = "normal";
	} else if (watering_interval_offset == 1) {
		plantLocation = "schattig"
	} else if (watering_interval_offset == 2) {
		plantLocation = "sehr schattig";
	} else if (watering_interval_offset == 3) {
		plantLocation = "extrem schattig";
	} else {
		plantLocation = "not specified";
	}
	return plantLocation;
}

/**
 * Converts a Date String from the format YYYY-MM-DD to DD.MM.YYYY
 * @param {string} sqlDate in Format YYYY-MM-DD
 * @returns string in German Date Format DD.MM.YYYY
 */
function convertSqlDateToGermanFormat(sqlDate) {
    const dateParts = sqlDate.split('-');
    const germanDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
    
    return germanDate;
}