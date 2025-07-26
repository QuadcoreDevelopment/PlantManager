import { backendUrl_plantImages } from "../mjs/config.mjs";
import * as ui_helper from "../mjs/ui_helpers.mjs";
import * as navigation from "../mjs/navigation.mjs";
import * as alerts from "../mjs/alerts.mjs";
import * as backend from "../mjs/backend_api.mjs";
import * as error_handler from "../mjs/error_handler.mjs";

function displayAddButton(){
    let buttonContainer = $('#button');
    buttonContainer.empty();
    let buttonContent = '<div class="w-100 mt-2 mb-2"><a href="#" class="btn btn-primary w-100"><i class="bi bi-plus-lg"></i> Pflanze hinzufügen</a></div>';
    buttonContainer.append(buttonContent);

    buttonContainer.on("click", async () => {
        let createdId = null;
        try {
            createdId = await backend.createPlant();
        } catch (error) {
            error_handler.handleError(error);
            return;
        }
        navigation.showPlantEditPage(createdId);
    });
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

    displayAddButton();

    if(plants.length == 0)
    {
        ui_helper.createCenteredIconAndText(plantsContainer, "bi-leaf", "Du hast noch keine Pflanzen")
        return;
    }

    // Loop through the plants and create cards for each
    plants.forEach(function (plant) {
        let plantCard = createPlantCard(plant);
        plantsContainer.append(plantCard);
    });
}

function createPlantCard(plant) {
    let col = $('<div class="col">');
    let card = $('<div class="card h-100">');
    col.append(card);
    
    let image = $('<image alt="Bild von ' + plant.name + '">');
    if (plant.image == null || plant.image == undefined || plant.image == "")
    {
        image = $('<image class="card-img-top object-fit-cover h-100" src="./images/placeholder.svg" alt="Bild von ' + plant.name + '">');
    }
    else{
        let imagePath = backendUrl_plantImages + '/' + plant.image;
        image = $('<image class="card-img-top object-fit-cover h-100 bg-secondary" src="' + imagePath + '"alt="Bild von "' + plant.name + '">');
    }				
    card.append(image);

    image.on("click", () => {
        navigation.showPlantDetailsPage(plant.plant_id);
    });

    let cardBody = $('<div class="card-body">');
    card.append(cardBody);
    let name = $('<h5 class="card-title">' + plant.name + '</h5>');
    cardBody.append(name);
    let latName = $('<p><small>' + plant.species_name + '</small></p>');
    cardBody.append(latName);
    
    let wateringOverdue = false;
    if(plant.days_until_watering < 0){
        wateringOverdue = true;
    }
    let text = '';
    if (wateringOverdue){
        text = 'Gießen überfällig seit '+ -plant.days_until_watering +' Tagen';
    }
    else{
        text = 'Nächstes Gießen in '+ plant.days_until_watering +' Tagen';
    }
    let days = $('<p>' + text + '</br>Zuletzt gegossen vor ' + plant.days_since_watering + ' Tagen</p>');
    cardBody.append(days);
    

    let cardFooter = $('<div class=card-footer>');
    card.append(cardFooter);
    let buttonWater = $(`<button type=button class="btn btn-water w-100 mb-2"><div class="row">
                        <div class="col text-start">Gießen</div>
                        <div class="col text-end"><i class="bi-droplet-fill"></i></div></div></button>`);
    cardFooter.append(buttonWater);
    buttonWater.on("click", () => {
        // needed to be wraped in this anonymus function
        buttonWaterClick(plant);
    });
    let buttonDetails = $(`<button type=button class="btn btn-primary w-100 mb-2"><div class="row">
                        <div class="col text-start">Details</div>
                        <div class="col text-end"><i class="bi bi-info-circle-fill"></i></div></div></button>`);
    cardFooter.append(buttonDetails);
    buttonDetails.on("click", () =>{
        navigation.showPlantDetailsPage(plant.plant_id);
    });
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

async function init() {
    alerts.initializeAlertDisplay();

    let centeredDiv = ui_helper.createCenteredDiv();
    ui_helper.createSpinner(centeredDiv, "Lade Pflanzen");
    $("#plants").html(centeredDiv);

    console.log('Document ready, loading data from Service');
    await reloadPlants();
}

$(document).ready(function() {
    init();
});