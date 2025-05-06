const backendUrl = 'http://localhost:8000/api';

function initializeAlertDisplay()
{
    console.log("Initializing Alerts Container");
    $("MAIN").prepend($('<div  id="alertsConatiner">'));
}

function displayAlert (message, type) {
    
    let alert = $('<div class="alert alert-' + type + ' alert-dismissible" role="alert">');
    alert.append($('<div>'+ message + '</div>'));
    alert.append($('<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'));

    $("#alertsConatiner").append(alert);
}

function displayError(message) {
    displayAlert(message, "danger");
}

function showPlantDetailsPage(plantId) 
{
    console.log("Show details for plant with ID: " + plantId);
    // Redirect to the plant detail page with the plant ID as a query parameter
    window.location.href = 'detailseite_pflanze.html?id=' + plantId;
}

async function waterPlant(plant)
{
    console.log("Watering Plant", plant);
    // create new activity
    const activity = {
        "plant_id": plant.id,
        "type": 0, // 0=Gießen
    };

    // send activity to server
    try{
        const res = await fetch(backendUrl + "/activities", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(activity)
        });
    }
    catch(exception)
    {
        displayError("Konnte die Pflanze " + plant.name + " nicht bewässern");
        console.log("Unable to create activity, exception was: ", exception)
        return false;
    }

    // check if it was successful
    if(res.status !== 200) {
        displayError("Konnte die Pflanze " + plant.name + " nicht bewässern (Error: " + res.status + ")");
        console.log("Unable to create activity, response was: ", res)
        return false;
    }

    return true;

}