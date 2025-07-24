/**
 * Redirects the user to the plants details page.
 * The plant that should be displayed will be passed to the page via the url.
 * 
 * @param {int} plant_id an int that will be passed to the details page
 */
export function showPlantDetailsPage(plant_id) 
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
export function showPlantEditPage(plant_id) 
{
	console.log("Show edit page for plant with Plant_ID: " + plant_id);
	window.location.href = 'pflanze_bearbeiten.html?plant_id=' + plant_id;
}

/**
 * Redirects the user to the plant overview page.
 */
export function showPlantOverviewPage()
{
	window.location.href = 'meine_pflanzen.html';
}