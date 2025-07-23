/////////////////
// Plant Manager Frontend
// Developed by: QuadcoreDevelopment
// Frontend Server

/////////////////////
// ATTENTION NEEDS NodeJS 22.3.0 TO WORK PROPERLY
/////////////////////

/////////////////
// workaround / bugfix for linux systems
Object.fromEntries = l => l.reduce((a, [k,v]) => ({...a, [k]: v}), {})
/////////////////

console.log('Starting server...');

try 
{

	// create server
	const HTTP_PORT = 8000;
	const express = require('express');
	//const morgan = require('morgan');

	console.log('Creating and configuring Web Server...');
	const app = express();

	console.log('Binding middleware...');
	app.use(express.static('./public'))
	app.use(function(request, response, next) {
		response.setHeader('Access-Control-Allow-Origin', '*'); 
		response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
		response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
		next();
	});
	//app.use(morgan('dev'));	
	
	// ====== BINDING ENDPOINTS ======

	

	// send default error message if no matching endpoint found
	app.use(function (request, response) {
		console.log('Error occured, 404, resource not found');
		response.status(404).json("404 Page not found");
	});
	// ===============================

	// starting the Web Server
	console.log('\nBinding Port and starting Webserver...');

	app.listen(HTTP_PORT, () => {
		console.log('Listening at localhost, port ' + HTTP_PORT);
		console.log('\nUsage: http://localhost:' + HTTP_PORT + "/");
		console.log('\nPlant Manager Frontend \nDeveloped by: QuadcoreDevelopment');
		console.log('\n\n---------------------------------------');
		console.log('exit / stop Server by pressing  CTRL-C');
		console.log('---------------------------------------\n\n');
	});
} 
catch (ex) 
{
	console.error(ex);
}
