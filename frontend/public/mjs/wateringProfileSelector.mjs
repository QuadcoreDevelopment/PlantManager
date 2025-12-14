import * as backend from "../mjs/backend_api.mjs";
import * as error_handler from "../mjs/error_handler.mjs";

let changeListeners = [];

// TODO: Needs AlertsDisplay which is not yet initialized when this module is loaded
// TODO: Flickering when changing profile because of async fetchSetting or animation

function onWpsRadioClick(radio) {
    let profile = radio.value;
    console.log("Selected watering profile:", profile);

    // Send to backend
    try {
        backend.updateSetting("watering_profile", profile);
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
    const currentProfile = await backend.fetchSetting("watering_profile");
    displayProfile(currentProfile);
    setRadioListeners();
}

export function addWpsChangeListener(listener) {
    changeListeners.push(listener);
}