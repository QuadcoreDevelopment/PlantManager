const backendUrl = 'http://localhost:8000/api';

/**
 * Prepares the DOM to display Bootstrap alerts.
 * Must be called before the first time displayAlert().
 * Best called right afert the document finsihed loading.
 */
function initializeAlertDisplay()
{
    console.log("Initializing Alerts Container");
    $("MAIN").prepend($('<div  id="alertsConatiner">'));
}

/**
 * Displays a Bootsrap alert in the DOM.
 * Must be called after initializeAlertDisplay().
 * 
 * @param message a string that will be displayed to the user 
 * @param type a string to change the apperance based on Bootsrap (e.g. danger) 
 */
function displayAlert(message, type) {
    
    let alert = $('<div class="alert alert-' + type + ' alert-dismissible" role="alert">');
    alert.append($('<div>'+ message + '</div>'));
    alert.append($('<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'));

    $("#alertsConatiner").append(alert);
}

/**
 * Displays the message as in red to the user.
 * Must be called after initializeAlertDisplay().
 * 
 * @param message a string that will be displayed to the user 
 */
function displayError(message) {
    displayAlert(message, "danger");
}

/**
 * Redicts the user to the plants details page.
 * The plant that should be displayed will be passed to the page via the url.
 * 
 * @param plantId a int that will be passed to the details page
 */
function showPlantDetailsPage(plantId) 
{
    console.log("Show details for plant with ID: " + plantId);
    // Redirect to the plant detail page with the plant ID as a query parameter
    window.location.href = 'detailseite_pflanze.html?id=' + plantId;
}

/**
 * async function to creat a new watering activity on the backend.
 * Communicates with the REST API.
 * 
 * @param plant JSON Obj describing a plant that should be watered
 * @returns true if it was successful, otherwise returns false
 */
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