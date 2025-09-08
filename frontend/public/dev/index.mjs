import { backendUrl_plantImages } from "../mjs/config.mjs";
import * as navigation from "../mjs/navigation.mjs";
import * as alerts from "../mjs/alerts.mjs";
import * as backend from "../mjs/backend_api.mjs";
import * as error_handler from "../mjs/error_handler.mjs";
import * as utils from "../mjs/utils.mjs";




async function onButtonAlertClick() {
    testAlert();
    testAlert2();
    testAlert3();
    testAlert4();
}


function registerEventHandlers(plant){

    $('#alert-button').on('click', function() {
        onButtonAlertClick(plant);
    });
}

function testAlert(){
    const mainText = "Pflanze wurde kompostiert";
    const secondaryText = "Die Pflanze wurde am 09.06.2025 kompostiert";
    alerts.displayAlert(mainText, "warning", secondaryText);
}

function testAlert2(){
    const mainText = "Pflanze wurde kompostiert";
    alerts.displayAlert(mainText, "warning");
}

function testAlert3(){
    const mainText = "Pflanze wurde kompostiert";
    alerts.displayAlert(mainText, "warning", null, "bi-exclamation-triangle-fill");
}

function testAlert4(){
    const mainText = "Pflanze wurde kompostiert";
    const secondaryText = "Die Pflanze wurde am 09.06.2025 kompostiert";
    alerts.displayAlert(mainText, "warning", secondaryText, "bi-exclamation-triangle-fill");
}

async function init() {
    alerts.initializeAlertDisplay();
    registerEventHandlers();
}

// Call the init function, when site is done loading
$(document).ready(function() {
    init();
});