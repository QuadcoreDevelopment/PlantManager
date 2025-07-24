/**
 * Prepares the DOM to display Bootstrap alerts.
 * Must be called before the first time displayAlert().
 * Best called right after the document finished loading.
 */
export function initializeAlertDisplay()
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
export function displayAlert(message, type) {
	
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
export function displayError(message) {
	displayAlert(message, "danger");
}