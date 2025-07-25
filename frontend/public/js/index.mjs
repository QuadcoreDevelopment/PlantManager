import { backendUrl_plantImages } from "../mjs/config.mjs";
import * as ui_helper from "../mjs/ui_helpers.mjs";
import * as navigation from "../mjs/navigation.mjs";
import * as alerts from "../mjs/alerts.mjs";
import * as backend from "../mjs/backend_api.mjs";
import * as error_handler from "../mjs/error_handler.mjs";

async function init() {
    alerts.initializeAlertDisplay();

    let centeredDiv = ui_helper.createCenteredDiv();
    ui_helper.createSpinner(centeredDiv, "Lade Pflanzen");
    $("#plants").html(centeredDiv);

    console.log('Document ready, loading data from Service');
    await reloadPlants();
}

function displayPlants(plants) {
    // Clear the existing content
    let plantsContainer = $('#plants')
    plantsContainer.empty();
    if(plants == null)
    {
        ui_helper.createCenteredIconAndText(plantsContainer, "bi-exclamation-triangle", "Es ist ein Fehler aufgetreten")
        return;
    }
    if(plants.length == 0)
    {
        ui_helper.createCenteredIconAndText(plantsContainer, "bi-leaf", "Du hast noch keine Pflanzen")
        return;
    }

    // Remove plants that have been watered today
    plants = plants.filter((plant) => plant.days_since_watering > 0);
    // IDEA Gegossene Pflanzen unter nem Trennstrich anzeigen
    
    if(plants.length == 0)
    {
        ui_helper.createCenteredIconAndText(plantsContainer, "bi-check2-circle", "Nichts mehr zu tun für heute")
        return;
    }

    // Sort plants by days until watering
    plants.sort((plantA, plantB) => {
        if (plantA.days_until_watering < plantB.days_until_watering)
        { return -1	}
        else
        { return 1 }
    });

    // Loop through the plants and create cards for each
    plants.forEach(function (plant) {
        let plantCard = createPlantCard(plant);
        plantsContainer.append(plantCard);
    });
}

async function reloadPlants() {
    let plants = null;
    try{
        plants = await backend.fetchPlants();
    }
    catch(e)
    {
        error_handler.handleError(e);
    }
    displayPlants(plants);
}

function createPlantCard(plant) {
    // This function should return a HTML Object that represents the plant card
    // See dynHtmlObj.html

    let wateringOverdue = false;
    if(plant.days_until_watering < 0)
    {
        wateringOverdue = true;
    }

    // Create col containing card
    let col = $('<div class="col">');
    let card = $('<div class="card">');
    col.append(card);
    
    // Create card structure
    let row = $('<div class="row g-0">');
    card.append(row);
    let imageContainer = $('<div class="col-5 col-sm-4 col-md-3 col-lg-5 col-xl-4">');
    let bodyContainer = $('<div class="col-7 col-sm-8 col-md-9 col-lg-7 col-xl-8">');
    row.append(imageContainer);
    row.append(bodyContainer);
    let cardFooter = $('<div class="card-footer">');
    card.append(cardFooter);

    // Fill image container
    let image = $('<div>');
    image.prop('alt','Bild von ' + plant.name);
    image.prop('class','img-fluid rounded-start rounded-bottom-0 h-100 bg-center-cover bg-secondary');
    if (plant.image == null || plant.image == undefined || plant.image == "")
    {
        image.prop('style', 'background-image: url("./images/placeholder.svg");');
    }
    else{
        let imagePath = backendUrl_plantImages + '/' + plant.image;
        image.prop('style', 'background-image: url("' + imagePath + '");');
    }
    imageContainer.append(image);
    image.on("click", () => {
        navigation.showPlantDetailsPage(plant.plant_id);
    });

    // Fill body container
    let cardBody = $('<div class="card-body">');
    cardBody.prop("style", "min-height:13rem;");
    bodyContainer.append(cardBody);

    cardBody.append($('<h5 class="card-title">' + plant.name + '</h5>'));
    let cardText = $('<p class="card-text">');
    cardBody.append(cardText);
    if(wateringOverdue)
    {
        cardText.text('Gießen überfällig seit ' + -plant.days_until_watering + ' Tagen');
    }
    else
    {
        cardText.text('Nächstes Gießen in ' + plant.days_until_watering + ' Tagen');
    }
    cardText.append('<br/>');
    cardText.append($('<small class="text-body-secondary">Zuletzt gegossen vor ' + plant.days_since_watering + ' Tagen</small>'));
    let buttonWater = $('<button type="button" class="btn btn-water"><i class="bi bi-droplet-fill"></i> Gießen</button>');
    cardBody.append(buttonWater);
    buttonWater.on("click", () => {
        // needed to be wraped in this anonymus function
        buttonWaterClick(plant);
    });

    // Fill card footer
    let progressbarContainer = $('<div class="progress" role="progressbar">');
    cardFooter.append(progressbarContainer);
    let progressbarFill = $('<div class="progress-bar">');
    if(wateringOverdue)
    {
        progressbarFill.prop("class", progressbarFill.prop("class") + " bg-danger");
        progressbarFill.prop('style','width:100%;');
    }
    else{
        progressbarFill.prop("class", progressbarFill.prop("class") + " bg-water");
        let percent = Math.round((plant.days_until_watering / plant.watering_interval_calculated) * 100);
        progressbarFill.prop('style','width:' + percent + '%;');
    }
    progressbarContainer.append(progressbarFill);

    // Add red border if watering is overdue
    if(wateringOverdue)
    {
        card.prop("class", card.prop("class") + " border-danger");
    }

    // Return the completed card
    return col;
}

async function buttonWaterClick(plant)
{
    // call Backend
    try{
        await backend.waterPlant(plant);
    }
    catch(e)
    {
        error_handler.handleError(e);
        return;
    }
    
    // reload plants
    await reloadPlants();
}

$(document).ready(function() {
    init();
});