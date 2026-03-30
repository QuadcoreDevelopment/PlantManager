import * as backend from "../mjs/backend_api.mjs";
import * as error_handler from "../mjs/error_handler.mjs";

let changeListeners = [];

async function onWpsRadioClick(radio) {
    let profile = radio.value;
    console.log("Selected watering profile:", profile);

    // Send to backend
    try {
        await backend.updateSetting("watering_profile", profile);
    } catch (e) {
        error_handler.handleError(e);
        return;
    }
    
    // Notify listeners
    for (let i = 0; i < changeListeners.length; i++) {
        changeListeners[i](profile);
    }
}

function setRadioListeners() {
    let wpsRadios = document.getElementsByName("wateringProfileSelector");
    for (let i = 0; i < wpsRadios.length; i++) {
        wpsRadios[i].addEventListener('click', function() {
            onWpsRadioClick(wpsRadios[i]);
        });
    }
}

function displayProfile(profile) {
    let wpsRadios = document.getElementsByName("wateringProfileSelector");
    for (let i = 0; i < wpsRadios.length; i++) {
        if (wpsRadios[i].value === profile) {
            wpsRadios[i].checked = true;
            return;
        }
    }
    throw new Error("Unknown watering profile: " + profile);
}

export async function initWpsSelector() {
    setRadioListeners();
    let currentProfile = null;
    try {
        currentProfile = await backend.fetchSetting("watering_profile");
    } catch (e) {
        if(e.message.includes("NetworkError")){
            // If this happens, then loading of other information has also probably failed.
            // We don't want to display two error messages about no internet connection.
            console.log("Network Error while loading Setting for watering profile selector");
        } else {
            error_handler.handleError(e);
        }
        return;
    }
    displayProfile(currentProfile);
}

export function addWpsChangeListener(listener) {
    changeListeners.push(listener);
}