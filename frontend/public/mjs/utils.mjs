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
 * Converts a Date String from the format YYYY-MM-DD to DD.MM.YYYY
 * @param {string} sqlDate in format YYYY-MM-DD
 * @returns {string} string in German Date Format DD.MM.YYYY
 */
export function convertSqlDateToGermanFormat(sqlDate) {
    const dateParts = sqlDate.split('-');
    const germanDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
    
    return germanDate;
}

/**
 * Converts a JS Date to a String with format YYYY-MM-DD
 * @param {Date} jsDate JS Date Obj
 * @returns {string} string in sql format YYYY-MM-DD
 */
export function convertJSToDateSqlDateFormat(jsDate) {
	// JS logic: month 0-11; days 1-31
	// see: https://www.w3schools.com/js/js_date_methods.asp

    let monthString = String(jsDate.getMonth() + 1);
	if(jsDate.getMonth() < 10){
		monthString = `0${monthString}`;
	}

	// I think .getDay() returns the week day?
	// So .getDate() does what you would expect .getDay() to do
	let dayString = String(jsDate.getDate());
	if(jsDate.getDate() < 10){
		dayString = `0${dayString}`;
	}

	const sqlDate = `${jsDate.getFullYear()}-${monthString}-${dayString}`;
    
    return sqlDate;
}