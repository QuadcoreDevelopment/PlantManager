import { backendUrl_plantImages } from "../mjs/config.mjs";
import * as navigation from "../mjs/navigation.mjs";
import * as alerts from "../mjs/alerts.mjs";
import * as backend from "../mjs/backend_api.mjs";
import * as error_handler from "../mjs/error_handler.mjs";
import * as utils from "../mjs/utils.mjs";

function showPlantDetails(plant) {
    const plantName = plant.name;
    document.getElementById('plant-name').textContent = plantName;
    const speciesName = plant.species_name;
    document.getElementById('species-name').textContent = speciesName;
    const addedDate = utils.convertSqlDateToGermanFormat(plant.added);
    document.getElementById('added-date').innerText = addedDate;
    const repottedDate = utils.convertSqlDateToGermanFormat(plant.repotted);
    document.getElementById('repotted-date').innerText = repottedDate;
    const watering_interval_offset = plant.watering_interval_offset;
    const location = utils.wateringIntervalToLocation(watering_interval_offset);
    document.getElementById('location').innerText = location;
    const wateringFrequency = plant.watering_interval;
    document.getElementById('watering-frequency').innerText = wateringFrequency;

    // disable compost button if it has been composted
    let compostButton = document.getElementById('compost-button');
    compostButton.disabled = (plant.composted != null);
    
    const plantImage = plant.image;
    const imgElement = document.getElementById('plant-image');

    // Set the src attribute based on the plantImage
    if (plantImage) {
        imgElement.src = backendUrl_plantImages + "/" + plantImage;
    } else {
        imgElement.src = "./images/placeholder.svg";
    }
}

async function updatePlantDetails(plantId) {
    try {
        const plant = await backend.fetchPlant(plantId);
        showPlantDetails(plant);
    } catch (error) {
        error_handler.handleError(error);
    }
}

async function reloadActivities(plantId) {

    let activities = [];
    try {
        activities = await backend.fetchActivities(plantId);
    } catch (error) {
        error_handler.handleError(error);
    }

    // Clear all current activities form the DOM
    let activitiesContainer = $('#activityContainer')
    activitiesContainer.empty();

    // Display fetched activities to the user
    for (const activity of activities) {
        let createdActivityCard = await createActivityCard(activity.type, activity.date, activity.days_since);
        activitiesContainer.append(createdActivityCard);
    }
}

function createActivityCard(type, date, days_since) {
    let col = $('<div class="col mb-2" activity-card>');
    let card = $('<div class="card">');
    col.append(card);

    let cardBody = $('<div class="card-body d-flex align-items-center">');
    card.append(cardBody);
    
    if (type == 0) {
        let iconContainer = $('<span class="border d-flex justify-content-center align-items-center rounded-2 bg-water" style="width: 100px; height: 100px;">');
        let icon = $('<i class="bi bi-droplet-fill" style="font-size: 3rem; color: white;"></i>');
        iconContainer.append(icon);
        cardBody.append(iconContainer);
    } else if (type == 1) {
        let iconContainer = $('<span class="border d-flex justify-content-center align-items-center rounded-2 bg-repot" style="width: 100px; height: 100px;">');
        let icon = $('<i class="bi bi-trash2-fill" style="font-size: 3rem; color: white;"></i>');
        iconContainer.append(icon);
        cardBody.append(iconContainer);
    }

    let textContainer = $('<div class="ms-3">');
    cardBody.append(textContainer);
    
    if(type == 0) {
        let title = $('<p class="card border-0 text-water mb-2 fs-3">Gegossen</p>');
        textContainer.append(title);
    } else if(type == 1) {
        let title = $('<p class="card border-0 text-repot mb-2 fs-3">Umgetopft</p>');
        textContainer.append(title);
    }
    
    let dateText = `${utils.convertSqlDateToGermanFormat(date)} - vor ${days_since} Tagen`;
    let subtitle = $('<p class="card border-0 card-subtitle mb-2 text-muted">' + dateText + '</p>');
    textContainer.append(subtitle);

    return col;
}

async function onButtonWaterPlantClick(plant) {
    // call Backend
    try{
        await backend.waterPlant(plant.plant_id);
    }
    catch(e)
    {
        error_handler.handleError(e);
        return;
    }
    // reload activities
    reloadActivities(plant.plant_id);
}

async function onButtonRePotPlantClick(plant) {
    // call Backend
    try{
        await backend.repotPlant(plant.plant_id);
    }
    catch(e)
    {
        error_handler.handleError(e);
        return;
    }
    // reload activities and plant
    reloadActivities(plant.plant_id);
    updatePlantDetails(plant.plant_id);
}

async function onButtonDeletePlantClick(plant) {
    if(!confirm("Willst du die Pflanze wirklich kompostieren?"))
    {
        return;
    }
    
    try {
        await backend.compostPlant(plant.plant_id);
    } catch (error) {
        error_handler.handleError(error);
        return;
    }

    // Weiterleiten auf meine Pflanzen Seite
    navigation.showPlantOverviewPage()
}

function onPlantImageClick(plant) {
    if(plant.image){
        navigation.showPlantImage(plant.image);
    }
}

function registerEventHandlers(plant){
    // Event listener for edit-button using jQuery
    $('#edit-button').on('click', function() {
        navigation.showPlantEditPage(plant.plant_id);
    });

    $('#water-button').on('click', function() {
        onButtonWaterPlantClick(plant);
    });

    $('#repot-button').on('click', function() {
        onButtonRePotPlantClick(plant);
    });

    $('#compost-button').on('click', function() {
        onButtonDeletePlantClick(plant);
    });

    $('#plant-image').on('click', function() {
        onPlantImageClick(plant);
    });
}

function showCompostInfo(date){
    const mainText = "Pflanze wurde kompostiert";
    const dateFormatted = utils.convertSqlDateToGermanFormat(date);
    const secondaryText = "Die Pflanze wurde am " + dateFormatted + " kompostiert";
    alerts.displayAlert(mainText, "warning", secondaryText, "bi-recycle");
}

async function init() {
    alerts.initializeAlertDisplay();
    const plantId = utils.getArgumentFromURL("id");

    try {
        const plant = await backend.fetchPlant(plantId);
        registerEventHandlers(plant);
        showPlantDetails(plant);
        if(plant.composted != null)
        {
            showCompostInfo(plant.composted);
        }
        await reloadActivities(plantId);
    } catch (error) {
        document.getElementById('plant-name').textContent = "Fehler beim Laden";
        error_handler.handleError(error);
    }
}

// Call the init function, when site is done loading
$(document).ready(function() {
    init();
});