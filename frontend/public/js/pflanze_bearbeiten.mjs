import { backendUrl_plantImages } from "../mjs/config.mjs";
import * as alerts from "../mjs/alerts.mjs";
import * as backend from "../mjs/backend_api.mjs";
import * as error_handler from "../mjs/error_handler.mjs";
import * as utils from "../mjs/utils.mjs";

function displayImage(plant_json){
    const image_element = document.getElementById("image");
    if (plant_json.image == null || plant_json.image == undefined || plant_json.image == "")
    {
        image_element.src = "./images/placeholder.svg";
    }
    else{
        let imagePath = backendUrl_plantImages + '/' + plant_json["image"] +"?" + new Date().getTime();
        image_element.src = imagePath;
    }
}

function displayData(plant_json) {
    const name_input = document.getElementById("name");
    name_input.value = plant_json["name"];

    const species_input = document.getElementById("inputSpecies");
    species_input.value = plant_json["species_name"];

    const location_input = document.getElementById("location");
    const wa_offset = plant_json["watering_interval_offset"];
    if(wa_offset > 3 || wa_offset < -3)
    {
        console.log("offset nicht gültig");
    }
    else{
        location_input.value = wa_offset;
    }
    location_input.value = wa_offset;

    const watering_input = document.getElementById("interval");
    watering_input.value = plant_json["watering_interval"];

    const plant_id_input = document.getElementById("plant_id");
    plant_id_input.value = utils.getArgumentFromURL("plant_id");
}

async function onImageUploadFormSubmit(event, form)
{
    // disable default event
    event.preventDefault();

    // diable button and change appearance
    let button = document.getElementById("uploadButton");
    let icon = document.getElementById("uploadIcon");
    let spinner = document.getElementById("uploadSpinner");
    icon.classList.add("d-none");
    spinner.classList.remove("d-none");
    button.disabled = true;

    // convert data of form to object
    var formData = new FormData(form);

    // upload
    try{
        await backend.uploadImageForPlant(formData);
    }
    catch(e)
    {
        error_handler.handleError(e);
        // enable Button and change appearance
        button.disabled = false;
        spinner.classList.add("d-none");
        icon.classList.remove("d-none");
        return;
    }

    alerts.displayAlert("Bild aktualisiert", "success", "Das Bild wurde erfolgreich hochgeladen");

    // enable Button and change appearance
    button.disabled = false;
    spinner.classList.add("d-none");
    icon.classList.remove("d-none");

    let plant_id = utils.getArgumentFromURL("plant_id");
    reloadImage(plant_id);    
}

async function onUploadDetailFormSubmit(event, form){
    // disable default event
    event.preventDefault();

    let plant = {
    "plant_id": utils.getArgumentFromURL("plant_id"),
    "name": document.getElementById('name').value.trim(),
    "species_name": document.getElementById('inputSpecies').value.trim(),
    "watering_interval": parseInt(document.getElementById('interval').value),
    "watering_interval_offset": document.getElementById('location').value,
    };

    // disable Button
    let button = $("#detailUpload");
    button.prop('disabled', true);
    let value = button.prop("value");
    button.prop("value", 'Uploading...');

    // upload
    try{
        await backend.updatePlant(plant);
    }
    catch(e)
    {
        error_handler.handleError(e);
    }

    // enable Button
    button.prop('disabled', false);
    button.prop("value", value);
    
    // IDEA Speichern Button kurz deaktivieren und in einen Hacken ändern und dann wieder zurück

}

async function reloadPlant(plant_id) {
    let plant = null;
    try{
        plant = await backend.fetchPlant(plant_id);
    }
    catch(e)
    {
        error_handler.handleError(e);
        return;
    }
    displayData(plant);
    displayImage(plant);
}

async function reloadImage(plant_id){
    let plant = null;
    try{
        plant = await backend.fetchPlant(plant_id);
    }
    catch(e)
    {
        error_handler.handleError(e);
    }
    displayImage(plant);
}

async function init() {
    alerts.initializeAlertDisplay();

    console.log('Document ready, loading data from Backend');
    // Register event handler
    $('#uploadForm').submit(function(event) {
        onImageUploadFormSubmit(event, this);
    });
    $('#detailForm').submit(function(event) {
        onUploadDetailFormSubmit(event, this);
    });
    
    let plant_id = utils.getArgumentFromURL("plant_id");
    await reloadPlant(plant_id);
}

$(document).ready(function() {
    init();
});