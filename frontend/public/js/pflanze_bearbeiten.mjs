function displayImage(plant_json){
    const image_value = document.getElementById("image");
    if (plant_json["image"] == null || plant_json["image"] == undefined || plant_json["image"] == "")
    {
        image_value.src = "./images/placeholder.svg";
    }
    else{
        let imagePath = backendUrl_plantImages + '/' + plant_json["image"] +"?" + new Date().getTime();
        image_value.src = imagePath;
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
    plant_id_input.value = getArgumentFromURL("plant_id");
}

async function onUploadFormSubmit(event, form)
{
    // disable default event
    event.preventDefault();

    let button = document.getElementById("uploadButton");
    let icon = document.getElementById("uploadIcon");
    let spinner = document.getElementById("uploadSpinner");
    icon.classList.add("d-none");
    spinner.classList.remove("d-none");
    button.disabled = true;

    // convert data of form to object
    var formData = new FormData(form);

    // upload
    let success = await uploadImageForPlant(formData);
    if(success)
    {
        displayAlert("Bild wurde erfolgreich hochgeladen", "success");
    }

    // enable Button
    button.disabled = false;
    spinner.classList.add("d-none");
    icon.classList.remove("d-none");
    //await reloadPlant(getPlantId());
    let plant = await fetchPlant(getArgumentFromURL("plant_id"));
    displayImage(plant);
}

async function onUploadDetailFormSubmit(event, form){
    // disable default event
    event.preventDefault();

    let plant = {
    "plant_id": getArgumentFromURL("plant_id"),
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
        const res = await fetch(backendUrl_api + "/plants", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(plant)
        });

        // check if it was successful
        if (res.status !== 200) {
            displayError("Fehler beim Upload der Daten (Error: " + res.status + ")");
            console.log("Response:", await res.text());
        } 
        else 
        {
            displayAlert("Daten wurden erfolgreich übermittelt", "success");
            console.log("Upload erfolgreich");
        }
    } 
    catch (exception) 
    {
        displayError("Fehler beim Upload der Daten: " + exception);
        console.log("Exception:", exception);
    }

    // enable Button
    button.prop('disabled', false);
    button.prop("value", value);
    

}


async function reloadPlant(plant_id) {
    let plant = await fetchPlant(plant_id);
    console.log(plant);
    displayData(plant);
    displayImage(plant);
}

async function init() {
    initializeAlertDisplay();

    console.log('Document ready, loading data from Service');
    // Register event handler
    $('#uploadForm').submit(function(event) {
        onUploadFormSubmit(event, this);
    });
    $('#detailForm').submit(function(event) {
        onUploadDetailFormSubmit(event, this);
    });
    
    await reloadPlant(getArgumentFromURL("plant_id"));
}

$(document).ready(function() {
    init();
});