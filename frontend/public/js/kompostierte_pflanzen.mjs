import * as ui_helper from "../mjs/ui_helpers.mjs";
import * as navigation from "../mjs/navigation.mjs";
import * as alerts from "../mjs/alerts.mjs";
import * as backend from "../mjs/backend_api.mjs";
import * as error_handler from "../mjs/error_handler.mjs";

function init()
{
    alerts.initializeAlertDisplay();
}

document.addEventListener('DOMContentLoaded', init);