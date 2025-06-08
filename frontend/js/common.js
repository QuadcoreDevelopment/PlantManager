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
	$("MAIN").prepend($('<div  id="alertsConatiner">'));
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

	$("#alertsConatiner").append(alert);
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
	div.prop("class", "text-center justify-content-center w-100 position-absolute top-50 start-0 translate-middle-y");
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
 * Redicts the user to the plants details page.
 * The plant that should be displayed will be passed to the page via the url.
 * 
 * @param {int} plantId an int that will be passed to the details page
 */
function showPlantDetailsPage(plantId) 
{
	console.log("Show details for plant with ID: " + plantId);
	// Redirect to the plant detail page with the plant ID as a query parameter
	window.location.href = 'detailseite_pflanze.html?id=' + plantId;
}

/**
 * Redicts the user to the plant edit page.
 * The plant that should be displayed will be passed to the page via the url.
 * 
 * @param {int} plantId a int that will be passed to the edit page
 */
function showPlantEditPage(plantId) 
{
	console.log("Show edit page for plant with ID: " + plantId);
	window.location.href = 'pflanze_bearbeiten.html?id=' + plantId;
}

/**
 * async function to create a new watering activity on the backend.
 * Communicates with the REST API.
 * Requires a initialized alerts display.
 * 
 * @param {JSON} plant JSON Obj describing a plant that should be watered
 * @returns {bool} true if it was successful, otherwise returns false
 */
async function waterPlant(plant)
{
	console.log("Watering Plant", plant);
	// create new activity
	const activity = {
		"plant_id": plant.plant_id,
		"type": 0, // 0=Gießen
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
		if(res.status !== 200) {
			displayError("Konnte die Pflanze " + plant.name + " nicht bewässern (Error: " + res.status + ")");
			console.log("Unable to create activity, response was: ", res);
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
		displayError("Konnte die Pflanze " + plant.name + " nicht bewässern");
		console.log("Unable to create activity, exception was: ", exception);
		return false;
	}

	return false;
}

/**
 * async function to fetch all plants from the backend.
 * Communicates with the REST API.
 * Requires an initialized alerts display.
 * 
 * @returns {Array} an array containing the plants as jsons or null on error.
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
* Communicates with the REST API.
* Requires an initialized alerts display.
* 
* @returns {json} containing the plant or null on error.
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
 * async function to upload an image to the backend and set it as the default image for the plant
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