import * as alerts from "./alerts.mjs";

/**
 * Takes an error aka. exception, generates a user-friendly message for it and displays it.
 * Requires an initialized alerts display.
 * @param {Error} error The Error for which a message should be displayed.
 */
export function handleError(error) {
    console.error("Handling error:", error);

    // generate main message
    let mainMessage = generatePrimaryErrorMessage(error);

    // generate secondary message
    let secondaryMessage = generateSecondaryErrorMessage(error);

    // Display the error message
    alerts.displayError(mainMessage, secondaryMessage);
}

function generatePrimaryErrorMessage(error) {

    switch (error.name) {
        case "TypeError":
            if (error.message.includes("NetworkError")) {
                return "Fehler bei der Kommunikation mit dem Backend";
            }
            break;
    
        case "BackendError":
            if (error.message.includes("Failed to fetch plants")) {
                return "Fehler beim Abrufen der Pflanzen";
            } else if (error.message.includes("Failed to fetch plant")) {
                return "Fehler beim Abrufen der Pflanze";
            } else if (error.message.includes("Failed to create plant")) {
                return "Konnte keine neue Pflanze hinzufügen";
            } else if (error.message.includes("Failed to fetch activities")) {
                return "Konnte keine Aktivitäten zu dieser Pflanze abrufen";
            } else if (error.message.includes("Failed to upload image")) {
                return "Fehler beim Hochladen des Bildes";
            } else if (error.message.includes("Failed to delete plant")) {
                return "Fehler beim Löschen der Pflanze";
            } else if (error.message.includes("Failed to delete activity")) {
                return "Fehler beim Löschen der Aktivität";
            } else if (error.message.includes("Failed to update plant")) {
                return "Fehler beim aktualisieren der Pflanze";
            } else if (error.message.includes("Failed to create activity")) {
                if(error.message.includes("type 0"))
                {
                    return "Konnte die Pflanze nicht bewässern";
                }
                else if(error.message.includes("type 1"))
                {
                    return "Konnte die Pflanze nicht umtopfen";
                }
                else{
                    return "Konnte keine neue Aktivität anlegen";
                }
            }
            break;
    }

    return "Ein unbekannter Fehler ist aufgetreten";
}

function generateSecondaryErrorMessage(error) {

    switch (error.name) {
        case "TypeError":
            if (error.message.includes("NetworkError")) {
                return "Es konnte keine Verbindung zum Backend hergestellt werden. Bitte überprüfen Sie die Netzwerkkonfiguration und ob das Backend erreichbar ist.";
            }
            break;
    
        case "BackendError":
            return generateSecondaryErrorMessage_BackendError(error);
    }

    return "Es ist ein unbekannter Fehler aufgetreten. \nFehlertyp: " + error.name + " \nFehlerdetails: " + error.message;
}

/**
 * Generates a secondary, more detailed error message for BackendErrors.
 * @param {BackendError} error The BackendError for which a message should be generated.
 * @returns {string} The generated secondary error message.
 */
function generateSecondaryErrorMessage_BackendError(error) {

    switch (error.httpStatusCode) {
        case 404:
            return "Das Backend unterstützt die benötigte API nicht. Möglicherweise wird ein Update des Frontends oder Backends benötigt."

        case 400:{ 
            let errorMsg = "";
            for (let i = 0; i < error.errorArray.length; i++) {
                let err = error.errorArray[i];

                switch (err.msg) {
                case "Invalid value":
                    errorMsg += `Der Wert für das Feld "${err.path}" ist ungültig.`;
                    break;
                case "plant does not exist":
                    errorMsg += `Die Pflanze mit der ID "${err.value}" existiert nicht. Möglicherweise wurde sie gelöscht.`;
                    break;
                case "No picture was uploaded":
                    errorMsg += `Es wurde kein Bild zum Hochladen ausgewählt. Bitte wählen Sie eine Bilddatei aus.`;
                    break;
                case "The uploaded file had the wrong mimetype":
                    errorMsg += `Die hochgeladene Datei hat einen ungültigen Dateityp. Bitte laden Sie eine Bilddatei hoch.`;
                    break;
                case "The uploaded file had the wrong extension":
                    errorMsg += `Die hochgeladene Datei hat eine ungültige Dateiendung. Bitte laden Sie eine Bilddatei hoch.`;
                    break;
                default:
                    errorMsg += `Es ist ein unbekannter Fehler aufgetreten: ${err.msg}`;
                }

                if( i < error.errorArray.length - 1 ){
                    errorMsg += err.errorMsg + "\n";
                }
            }
            return errorMsg }
    
        case 500:
            return `Im Backend ist ein interner Fehler aufgetreten. Fehlerdetails: ${error.errorArray[0].errorMsg}`;
    }

    return `Es ist ein unbekannter Fehler im Backend aufgetreten. HTTP-Statuscode: ${error.httpStatusCode}`;
}