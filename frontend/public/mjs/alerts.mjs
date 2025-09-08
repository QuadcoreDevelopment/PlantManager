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
 * @param {string} mainMessage a string that will be displayed to the user 
 * @param {string} type a string to change the appearance based on Bootsrap (e.g. danger)
 * @param {string} secondaryMessage (optional) additional information that will be displayed to the user 
 * @param {string} icon (optional) a Bootstrap icon string (e.g. bi-exclamation-triangle-fill)
 */
export function displayAlert(mainMessage, type, secondaryMessage, icon=null) {
	
	let alert = $('<div role="alert">');
	alert.prop('class', 'alert alert-' + type + ' alert-dismissible');
    
	// Create base structure
	let row = $('<div class="row">');
	alert.append(row);
	let startCol = $('<div class="col col-auto pe-1 ">');
	let mainCol = $('<div class="col">');
	row.append(startCol);
	row.append(mainCol);

	// Create Icon
	if (icon)
	{
		let iconElement = $('<i class="bi ' + icon + '">');
		startCol.append(iconElement);
	}
	
	// Create Content
	let div = $('<div>');
	mainCol.append(div);
	let strong = $('<strong>');
	strong.text(mainMessage);
	div.append(strong);
    if(secondaryMessage != null)
    {
		let secondDiv = $('<div>');
		div.append(secondDiv);
		secondDiv.text(secondaryMessage);
    }

	alert.append($('<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'));
	$("#alertsContainer").append(alert);
}

/**
 * Displays the message as in red to the user.
 * Must be called after initializeAlertDisplay().
 * 
 * @param {string} mainMessage a string that will be displayed to the user 
 * @param {string} secondaryMessage (optional) additional information that will be displayed to the user 
 */
export function displayError(mainMessage, secondaryMessage) {
	
	displayAlert(mainMessage, "danger", secondaryMessage, "bi-x-circle");
}