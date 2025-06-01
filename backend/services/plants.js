const helper = require('../helper.js');
const express = require('express');
const plantsDao = require('../dao/plantsDao.js');
const activitiesDao = require('../dao/activitiesDao.js');
var serviceRouter = express.Router();

console.log('- Service Plants');

function extendPlantJSON(json,activitiesDaoInstance) {
    //const plantDaoInstance = new plantsDao(request.app.locals.dbConnection);
    //const activitiesDaoInstance = new activitiesDao(request.app.locals.dbConnection);

    // Berechnung watering_interval_calculated
    let watering_interval_calculated = json.watering_interval + json.watering_interval_offset;

    // Datum letestes Bewässern ermitteln 
    var arrWat = activitiesDaoInstance.loadByPlantIdAndType(json.plant_id,0);
    let last_watered = null;
    if(helper.isArray(arrWat))
    {
        if (helper.isArrayEmpty(arrWat))
        {
            // No elements = empty array
            last_watered = new Date(json.added);
        }
        else
        {
            // 2 or more elemts = array
            last_watered = new Date(arrWat[0].date);
        }
    }
    else if (!helper.isUndefined(arrWat))
    {
        // exactly one element
        last_watered = new Date(arrWat.date);
    }
    else{
        // something went wrong
        last_watered = new Date(json.added);
    }
    

    // Berechnung days_since_watering
    const currentDate = new Date();
    let ms_since_watering = currentDate - last_watered;
    let days_since_watering = Math.floor(ms_since_watering / (1000 * 60 * 60 * 24));

    // Berechnung days_until_watering
    // Erst berechnen wann das nächste mal gegossen werden muss
    const watering_due = new Date(last_watered.getTime() + watering_interval_calculated * 24 * 60 * 60 * 1000);
    // ms von heute von ms vom gießdatum abziehen und runden --> negativ heisst ueberfaellig
    let ms_until_watering = watering_due - currentDate;
    let days_until_watering = Math.floor(ms_until_watering / (1000 * 60 * 60 * 24)) +1;

    //Bestimmung repotted
    var arrPot = activitiesDaoInstance.loadByPlantIdAndType(json.plant_id,1);
    let repotted = null;
    if(helper.isArray(arrPot))
    {
        if (helper.isArrayEmpty(arrPot))
        {
            // No elements = empty array
            repotted = json.added;
        }
        else
        {
            // 2 or more elemts = array
            repotted = arrPot[0].date;
        }
    }
    else if (!helper.isUndefined(arrPot))
    {
        // exactly one element
        repotted = arrPot.date;
    }
    else{
        // something went wrong
        repotted = json.added;
    }

    //JSON erweitern
    json.watering_interval_calculated = watering_interval_calculated;
    json.days_since_watering = days_since_watering;
    json.days_until_watering = days_until_watering;
    json.repotted = repotted;
}

serviceRouter.get('/plants/get/:id', function(request, response) {
    console.log('Service plants: Client requested one record, id=' + request.params.id);

    const plantDaoInstance = new plantsDao(request.app.locals.dbConnection);
    const activitiesDaoInstance = new activitiesDao(request.app.locals.dbConnection);
    try {
        // JSON Objekt aus DB holen
        var obj = plantDaoInstance.loadById(request.params.id);

        extendPlantJSON(obj,activitiesDaoInstance);

        console.log('Service plants: Record loaded');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service plants: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/plants/all', function(request, response) {
    console.log('Service plants: Client requested all records');

    const plantDaoInstance = new plantsDao(request.app.locals.dbConnection);
    const activitiesDaoInstance = new activitiesDao(request.app.locals.dbConnection);
    try {
        var plantArr = plantDaoInstance.loadAll();
        // foreach Schleife über alle plant JSON, diese werden dabei erweitert
        plantArr.forEach(plant => {
            extendPlantJSON(plant,activitiesDaoInstance);
          });
          
        console.log('Service plants: Records loaded, count= ' + plantArr.length);
        response.status(200).json(plantArr);
    } catch (ex) {
        console.error('Service plants: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.get('/plants/exists/:id', function(request, response) {
    console.log('Service plants: Client requested check, if record exists, id=' + request.params.id);

    const plantDaoInstance = new plantsDao(request.app.locals.dbConnection);
    try {
        var exists = plantDaoInstance.exists(request.params.id);
        console.log('Service plants: Check if record exists by id=' + request.params.id +', exists= ' + exists);
        response.status(200).json({'plant_id': request.params.id, 'existiert': exists});
    } catch (ex) {
        console.error('Service plants: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

serviceRouter.post('/plants', function(request, response) {
    console.log('Service plants: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.name)) {
        errorMsgs.push('name missing');
    }       
    if (helper.isUndefined(request.body.species_name)) {
        errorMsgs.push('species_name missing');
    }
    // Nimmt aktuelles Datum für added, kann noch anders strukturiert werden
    if (helper.isUndefined(request.body.added)) {
        request.body.added = helper.getNow();
    }
    if (helper.isUndefined(request.body.watering_interval)) {
        errorMsgs.push('watering_interval missing');
    } else if (!helper.isNumeric(request.body.watering_interval)) {
        errorMsgs.push('watering_interval has to be a number');
    } else if (request.body.watering_interval <= 0) {
        errorMsgs.push('watering_interval has to be a bigger number than 0');
    }
    if (helper.isUndefined(request.body.watering_interval_offset)) {
        errorMsgs.push('watering_interval_offset missing');
    } else if (!helper.isNumeric(request.body.watering_interval_offset)) {
        errorMsgs.push('watering_interval has to be a number');
    }
    if (errorMsgs.length > 0) {
        console.log('Service plants: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Function not possible. Missing Data: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const plantDaoInstance = new plantsDao(request.app.locals.dbConnection);
    try {
        // #37 image is set to null
        var obj = plantDaoInstance.create(request.body.name, request.body.species_name,null,request.body.added,request.body.watering_interval,request.body.watering_interval_offset);
        console.log('Service plants: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service plants: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.put('/plants', function(request, response) {
    console.log('Service plants: Client requested update of existing plant');

    const plantDaoInstance = new plantsDao(request.app.locals.dbConnection);
    var errorMsgs=[];
    if (helper.isUndefined(request.body.plant_id)) {
        errorMsgs.push('plant_id missing');
    } else if (!helper.isNumeric(request.body.plant_id)) {
        errorMsgs.push('plant_id has to be a number');
    } else if (request.body.plant_id <= 0) {
        errorMsgs.push('plant_id has to be a bigger number than 0');
    }
    if (helper.isUndefined(request.body.name)) {
        errorMsgs.push('name missing');
    }       
    if (helper.isUndefined(request.body.species_name)) {
        errorMsgs.push('species_name missing');
    }
    if (helper.isUndefined(request.body.watering_interval)) {
        errorMsgs.push('watering_interval missing');
    } else if (!helper.isNumeric(request.body.watering_interval)) {
        errorMsgs.push('watering_interval has to be a number');
    } else if (request.body.watering_interval <= 0) {
        errorMsgs.push('watering_interval has to be a bigger number than 0');
    }
    if (helper.isUndefined(request.body.watering_interval_offset)) {
        errorMsgs.push('watering_interval_offset missing');
    } else if (!helper.isNumeric(request.body.watering_interval_offset)) {
        errorMsgs.push('watering_interval has to be a number');
    }
    if (errorMsgs.length > 0) {
        console.log('Service plants: Update not possible, data missing or invalid');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Function not possible. Missing or invalid data: ' + helper.concatArray(errorMsgs) });
        return;
    }
    try {
        // check if the plant even exists
        if(!plantDaoInstance.exists(request.body.plant_id))
        {
            console.error('Service plants: Error updating record by plant_id. No plant with this plant_id found');
            response.status(400).json({ 'fehler': true, 'nachricht': 'No plant with this plant_id found' });
            return;
        }

        // get the current image of the plant as it should not be changed here. See issue #37
        let image = plantDaoInstance.loadById(request.body.plant_id).image;

        // update the plant
        var obj = plantDaoInstance.update(request.body.plant_id,request.body.name, request.body.species_name,image,request.body.watering_interval,request.body.watering_interval_offset);
        console.log('Service plants: Record updated, plant_id=' + request.body.plant_id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service plants: Error updating record by plant_id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/plants/:id', function(request, response) {
    console.log('Service plants: Client requested deletion of plant, plant_id=' + request.params.id);

    const plantDaoInstance = new plantsDao(request.app.locals.dbConnection);
    try {
        plantDaoInstance.delete(request.params.id);
        console.log('Service plants: Deletion of plant successfull, plant_id=' + request.params.id);
        response.status(200).json({ 'fehler': false, 'nachricht': 'Plant deleted' });
    } catch (ex) {
        console.error('Service plants: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;