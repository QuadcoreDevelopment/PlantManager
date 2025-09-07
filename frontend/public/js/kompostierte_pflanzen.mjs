import * as ui_helper from "../mjs/ui_helpers.mjs";
import * as navigation from "../mjs/navigation.mjs";
import * as alerts from "../mjs/alerts.mjs";
import * as backend from "../mjs/backend_api.mjs";
import * as error_handler from "../mjs/error_handler.mjs";
import * as utils from "../mjs/utils.mjs";

async function init() {
	alerts.initializeAlertDisplay();
	registerEventHandlers();

	console.log('Document ready, loading data from Service');
	await reloadPlants();
}

function registerEventHandlers()
{
	let restoreButton = document.getElementById("restore-button");
	restoreButton.addEventListener("click", () => {onButtonClick(restoreButton)})
	let deleteButton = document.getElementById("delete-button");
	deleteButton.addEventListener("click", () => {onButtonClick(deleteButton)})
}

async function onButtonClick(button) {
	// disable buttons and change appearance of the clicked
	document.getElementById("restore-button").disabled = true;
	document.getElementById("delete-button").disabled = true;
	let originalHTML = button.innerHTML;
	button.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div> Einen Moment...';

	// go through all checkboxes
	var checkboxes = document.querySelectorAll("input[type='checkbox']");
	for (const checkbox of checkboxes)
	{
		if (checkbox.checked){
			let plant_id = checkbox.getAttribute("plant_id");

			try {
				if(button.id == "delete-button"){
					await backend.deletePlant(plant_id);
				} else if (button.id == "restore-button") {
					await backend.restorePlant(plant_id);
				}
				removeListItem(plant_id);
			} catch (error) {
				// enable buttons and change appearance back
				document.getElementById("restore-button").disabled = false;
				document.getElementById("delete-button").disabled = false;
				button.innerHTML = originalHTML;
				// deal with the error
				error_handler.handleError(error);
			}
		}
	}

	// If there are no more list items, create info
	let plantsContainer = document.getElementById("plants");
	if (plantsContainer.innerHTML == "")
	{
		let infoListItem = createInformationalListItem("bi-check2","Es befinden sich keine Pflanzen mehr auf dem Kompost");
		$('#plants').append(infoListItem);
	}

	// enable buttons and change appearance back
	document.getElementById("restore-button").disabled = false;
	document.getElementById("delete-button").disabled = false;
	button.innerHTML = originalHTML;
}

function removeListItem(plant_id) {
	document.getElementById("li" + plant_id).remove();
}

async function reloadPlants() {
	let plants = null;
	try{
		plants = await backend.fetchPlants(true);
	}
	catch(e)
	{
		error_handler.handleError(e);
	}
	displayPlants(plants);
}

function displayPlants(plants) {
	// Clear the existing content
	let plantsContainer = $('#plants');
	plantsContainer.empty();

	if(plants == null)
	{
		let errorListItem = createInformationalListItem("bi-exclamation-triangle-fill","Pflanzen konnten nicht geladen werden");
		plantsContainer.append(errorListItem);
		return;
	}
	if(plants.length == 0)
	{
		let errorListItem = createInformationalListItem("bi-check2","Es befinden sich noch keine Pflanzen auf dem Kompost...");
		plantsContainer.append(errorListItem);
		return;
	}

	// Loop through the plants and create cards for each
	plants.forEach(function (plant) {
		let listItem = createPlantListItem(plant);
		plantsContainer.append(listItem);
	});
}

function createPlantListItem(plant) {
	let listItem = $('<li class="list-group-item">');
	listItem.prop("id","li" + plant.plant_id);

	// Create base structure
	let row = $('<div class="row">');
	listItem.append(row);
	let startCol = $('<div class="col col-auto pe-1 my-auto">');
	let middleCol = $('<div class="col">');
	let endCol = $('<div class="col col-auto ps-0">');
	row.append(startCol);
	row.append(middleCol);
	row.append(endCol);

	// Fill startCol
	let checkbox = $('<input class="form-check-input" type="checkbox">');
	checkbox.prop("id","checkbox" + plant.plant_id);
	checkbox.attr("plant_id",plant.plant_id);
	startCol.append(checkbox);

	// Fill middleCol
	let label = $('<label class="form-check-label">');
	label.prop("for", "checkbox" + plant.plant_id);
	middleCol.append(label);
	let plantTitel = $('<div class="fw-bold">');
	plantTitel.text(plant.name);
	label.append(plantTitel);
	let dateText = $('<small>');
	dateText.text("Kompostiert am " + utils.convertSqlDateToGermanFormat(plant.composted));
	label.append(dateText);

	// Fill endCol
	let linkButton = $('<button class="btn"><i class="bi bi-box-arrow-up-right"></i></button>');
	linkButton.on("click", () => {
		navigation.showPlantDetailsPage(plant.plant_id);
	});
	endCol.append(linkButton);

	return listItem;
}

function createInformationalListItem(icon, text) {
	let listItem = $('<li class="list-group-item">');

	// Create base structure
	let row = $('<div class="row">');
	listItem.append(row);
	let startCol = $('<div class="col col-auto pe-1 my-auto">');
	let mainCol = $('<div class="col">');
	row.append(startCol);
	row.append(mainCol);

	// Fill startCol
	let iconElement = $('<i class="bi ' + icon + '">');
	startCol.append(iconElement);

	// Fill mainCol
	mainCol.text(text);

	return listItem;
}

document.addEventListener('DOMContentLoaded', init);