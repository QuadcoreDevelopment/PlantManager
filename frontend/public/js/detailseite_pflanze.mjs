function showPlantDetails(plant) {
    if (plant) {
        const plantName = plant.name;
        document.getElementById('plant-name').textContent = plantName;
        const speciesName = plant.species_name;
        document.getElementById('species-name').textContent = speciesName;
        const addedDate = convertSqlDateToGermanFormat(plant.added);
        document.getElementById('added-date').innerText = addedDate;
        const repottedDate = convertSqlDateToGermanFormat(plant.repotted);
        document.getElementById('repotted-date').innerText = repottedDate;
        const watering_interval_offset = plant.watering_interval_offset;
        const location = wateringIntervalToLocation(watering_interval_offset);
        document.getElementById('location').innerText = location;
        const wateringFrequency = plant.watering_interval;
        document.getElementById('watering-frequency').innerText = wateringFrequency;
        
        const plantImage = plant.image;
        const imgElement = document.getElementById('plant-image');

        // Set the src attribute based on the plantImage
        if (plantImage) {
            imgElement.src = backendUrl_plantImages + "/" + plantImage;
        } else {
            imgElement.src = "./images/placeholder.svg";
        }
    }
}

async function updatePlantDetails(plantId) {
    const plant = await fetchPlant(plantId);
    showPlantDetails(plant);
}


async function reloadActivities(plantId) {
    // Clear all current activities for reloading the site
    let activitiesContainer = $('#activityContainer')
    activitiesContainer.empty();

    const activities = await fetchActivities(plantId);
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
    
    let dateText = `${convertSqlDateToGermanFormat(date)} - vor ${days_since} Tagen`;
    let subtitle = $('<p class="card border-0 card-subtitle mb-2 text-muted">' + dateText + '</p>');
    textContainer.append(subtitle);

    return col;
}

async function onButtonClickWaterPlant(plant) {
    
    // call Backend
    let success = await waterPlant(plant);
    if (!success) {
        return;
    }
    // reload activities
    reloadActivities(plant.plant_id);
}

async function onButtonClickRepotPlant(plant) {
    
    // call Backend
    let success = await repotPlant(plant);
    if (!success) {
        return;
    }
    // reload activities and plant
    reloadActivities(plant.plant_id);
    updatePlantDetails(plant.plant_id);
}

async function onButtonClickDeletePlant(plant_id) {
    isPlantDeletionSuccessful = await deletePlant(plant_id);
    if(isPlantDeletionSuccessful) {
        // Weiterleiten auf meine Pflanzen Seite
        showPlantOverviewPage()
    }
}

function registerEventHandlers(plant){
    // Event listener for edit-button using jQuery
    $('#edit-button').on('click', function() {
        showPlantEditPage(plant.plant_id);
    });

    $('#water-button').on('click', function() {
        onButtonClickWaterPlant(plant);
    });

    $('#repot-button').on('click', function() {
        onButtonClickRepotPlant(plant);
    });

    $('#delete-button').on('click', function() {
        onButtonClickDeletePlant(plant.plant_id);
    });
}

async function initialize() {
    initializeAlertDisplay();
    const plantId = getArgumentFromURL("id");

    // Fetch the plant using the fetchPlant function
    const plant = await fetchPlant(plantId);

    registerEventHandlers(plant);

    // Check if the plant was fetched successfully
    if (plant !== null && plant !== undefined) {
        await showPlantDetails(plant);
        await reloadActivities(plantId);
    } else {
        console.log("Error while fetching plant");
        document.getElementById('plant-name').textContent = "Fehler beim Laden";
    }
}

// Call the init function, when site is done loading
$(document).ready(function() {
    initialize();
});