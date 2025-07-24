/**
* Returns the fitting value from the URL for the argument presented
* @param {string} argument a string which will function as key for the value in the URL parameters
* @returns value associated with presented key and null if unsuccessful
*/
export function getArgumentFromURL(argument){
	let urlParams = new URLSearchParams(window.location.search);
	let argValue = urlParams.get(argument);
	if (argValue == null || argValue == undefined){
		console.log("Gesuchtes Argument nicht in URL vorhanden")
		return null;
	}
	else{
		return argValue;
	}	
}

/**
 * Returns the translated location to the given number. If number invalid, returns "not specified"
 * @param {int} watering_interval_offset key, that is then translated
 * @returns string with the desired location
 */

export function wateringIntervalToLocation(watering_interval_offset) {
    let plantLocation = "not specified";
	if (watering_interval_offset == -3) {
		plantLocation = "extrem sonnig"
	} else if (watering_interval_offset == -2) {
		plantLocation = "sehr sonnig";
	} else if (watering_interval_offset == -1) {
		plantLocation = "sonnig";
	} else if (watering_interval_offset == 0) {
		plantLocation = "normal";
	} else if (watering_interval_offset == 1) {
		plantLocation = "schattig"
	} else if (watering_interval_offset == 2) {
		plantLocation = "sehr schattig";
	} else if (watering_interval_offset == 3) {
		plantLocation = "extrem schattig";
	}
	return plantLocation;
}

/**
 * Converts a Date String from the format YYYY-MM-DD to DD.MM.YYYY
 * @param {string} sqlDate in Format YYYY-MM-DD
 * @returns string in German Date Format DD.MM.YYYY
 */
export function convertSqlDateToGermanFormat(sqlDate) {
    const dateParts = sqlDate.split('-');
    const germanDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
    
    return germanDate;
}