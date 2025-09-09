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
        let createdActivityCard = await createActivityCard(activity);
        activitiesContainer.append(createdActivityCard);
    }
}

function createActivityCard(activity) {
    let col = $('<div class="col mb-2">');
    let card = $('<div class="card">');
    col.append(card);

    let cardBody = $('<div class="d-flex align-items-center">');
    card.append(cardBody);
    
    if (activity.type == 0) {
        let iconContainer = $('<span class="d-flex justify-content-center align-items-center rounded-start bg-water" style="width: 100px; height: 100px;">');
        let icon = $('<i class="bi bi-droplet-fill text-white" style="font-size: 3rem;"></i>');
        iconContainer.append(icon);
        cardBody.append(iconContainer);
    } else if (activity.type == 1) {
        let iconContainer = $('<span class="d-flex justify-content-center align-items-center rounded-start bg-repot" style="width: 100px; height: 100px;">');
        let icon = $('<i class="bi bi-trash2-fill text-white" style="font-size: 3rem;"></i>');
        iconContainer.append(icon);
        cardBody.append(iconContainer);
    }

    let textContainer = $('<div class="ms-3">');
    cardBody.append(textContainer);
    
    if(activity.type == 0) {
        let title = $('<h3 class="text-water mb-2">Gegossen</h3>');
        textContainer.append(title);
    } else if(activity.type == 1) {
        let title = $('<h3 class="text-repot">Umgetopft</h3>');
        textContainer.append(title);
    }
    
    let dateText = `${utils.convertSqlDateToGermanFormat(activity.date)} - vor ${activity.days_since} Tagen`;
    let subtitle = $('<p class="card-subtitle mb-2 text-muted">' + dateText + '</p>');
    textContainer.append(subtitle);

    let activityDeleteButton = $("<button>");
    activityDeleteButton.prop("class", "btn text-red-hover position-absolute end-0 top-0 p-2 m-2");
    activityDeleteButton.append($('<i class="bi bi-x-lg">'));
    textContainer.append(activityDeleteButton);

    activityDeleteButton.on("click", () => {
        onButtonDeleteActivityClick(activity, col)
    });

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

async function onButtonRepotPlantClick(plant) {
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

async function onButtonCompostPlantClick(plant) {
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

async function onButtonDeleteActivityClick(activity, domElement) {
    // Confirm action
    // TODO

    // Delete activity
    // TODO

    // Remove card
    domElement.remove();

    // Reload Plant Details
    updatePlantDetails(activity.plant_id);

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
        onButtonRepotPlantClick(plant);
    });

    $('#compost-button').on('click', function() {
        onButtonCompostPlantClick(plant);
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