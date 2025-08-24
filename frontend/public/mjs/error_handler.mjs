import * as alerts from "./alerts.mjs";

/**
 * Takes an error aka. exception, generates a user-friendly message for it and displays it.
 * Requires a initialized alerts display.
 * @param {Error} error The Error for which a message should be displayed.
 */
export function handleError(error) {
    console.error("Handling error:", error);

    // generate main message
    let mainMessage = "Ein unbekannter Fehler ist aufgetreten";

    switch (error.name) {
        case "TypeError":
            if (error.message.includes("NetworkError")) {
                mainMessage = "Fehler bei der Kommunikation mit dem Backend";
            }
            break;
    
        default:
            if (error.message.includes("Failed to fetch plants")) {
                mainMessage = "Fehler beim Abrufen der Pflanzen";
            } else if (error.message.includes("Failed to fetch plant")) {
                mainMessage = "Fehler beim Abrufen der Pflanze";
            } else if (error.message.includes("Failed to create plant")) {
                mainMessage = "Konnte keine neue Pflanze hinzufügen";
            } else if (error.message.includes("Failed to fetch activities")) {
                mainMessage = "Konnte keine Aktivitäten zu dieser Pflanze abrufen";
            } else if (error.message.includes("Failed to upload image")) {
                mainMessage = "Fehler beim Hochladen des Bildes";
            } else if (error.message.includes("Failed to delete plant")) {
                mainMessage = "Fehler beim Löschen der Pflanze";
            } else if (error.message.includes("Failed to update plant")) {
                mainMessage = "Fehler beim aktualisieren der Pflanze";
            } else if (error.message.includes("Failed to create activity")) {
                if(error.message.includes("type 0"))
                {
                    mainMessage = "Konnte die Pflanze nicht bewässern";
                }
                else if(error.message.includes("type 1"))
                {
                    mainMessage = "Konnte die Pflanze nicht umtopfen";
                }
                else{
                    mainMessage = "Konnte keine neue Aktivität anlegen";
                }
            }
            break;
    }

    // generate secondary message
    let secondaryMessage = null;

    if (error.message.includes("Error 404")) {
        secondaryMessage = "Das Backend unterstützt die benötigte API nicht. Möglicherweise wird ein Update benötigt.";
    } else if (error.message.includes("Error 400")) {
        if (error.message.includes("was not of type image")) {
            secondaryMessage = "Es können nur Bild Dateien hochgeladen werden. Bitte wählen Sie eine andere Datei.";
        } else if (error.message.includes("Missing or invalid data")) {
            secondaryMessage = "Die eingegebenen Daten sind ungültig oder unvollständig";
        } else {
            secondaryMessage = "Das Backend konnte die Anfrage nicht verarbeiten. Möglicherweise benötigt das Backend weitere Informationen oder das Frontend ist nicht kompatibel.";
        }
    } else if (error.message.includes("plant does not exist")) {
        secondaryMessage = "Die gewünschte Pflanze existiert nicht. Möglicherweise wurde sie gelöscht.";
    }

    // Display the error message
    alerts.displayError(mainMessage, secondaryMessage);
}