const helper = require('../helper.js');
const validationHelper = require('./validationHelper.js');
const express = require('express');
const plantsDao = require('../dao/plantsDao.js');
const activitiesDao = require('../dao/activitiesDao.js');
var serviceRouter = express.Router();
const { body, param, matchedData, validationResult } = require('express-validator');

console.log('- Service Plants');

function extendPlantJSON(json,activitiesDaoInstance) {
    //const plantDaoInstance = new plantsDao(request.app.locals.dbConnection);
    //const activitiesDaoInstance = new activitiesDao(request.app.locals.dbConnection);

    // Berechnung watering_interval_calculated
    let watering_interval_calculated = json.watering_interval + json.watering_interval_offset;

    // Datum letztes Bewässern ermitteln 
    let arrWat = activitiesDaoInstance.loadByPlantIdAndType(json.plant_id,0);
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
            // 2 or more elements = array
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
    let arrPot = activitiesDaoInstance.loadByPlantIdAndType(json.plant_id,1);
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
            // 2 or more elements = array
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

serviceRouter.get('/plants/get/:plant_id', 
    param("plant_id").isInt({min:0}).bail().toInt().custom(validationHelper.validatePlantIDExists),
    function(req, resp) {

    console.log('Service plants: Client requested one record');
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
        console.warn('Service plants: Error loading record by id, validation errors');
        return resp.status(400).json({ errors: vResult.array() });
    }

    const data = matchedData(req);
    const plantDaoInstance = new plantsDao(req.app.locals.dbConnection);
    const activitiesDaoInstance = new activitiesDao(req.app.locals.dbConnection);
    try {
        // JSON Objekt aus DB holen
        var obj = plantDaoInstance.loadById(data.plant_id);

        extendPlantJSON(obj,activitiesDaoInstance);

        console.log('Service plants: Record loaded');
        resp.status(200).json(obj);
    } catch (ex) {
        console.error('Service plants: Error loading record by id. Exception occurred: ' + ex.message);
        resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    }
});

serviceRouter.get('/plants/composted', function(req, resp) {
    console.log('Service plants: Client requested all composted records');

    const plantDaoInstance = new plantsDao(req.app.locals.dbConnection);
    const activitiesDaoInstance = new activitiesDao(req.app.locals.dbConnection);
    try {
        var plantArr = plantDaoInstance.loadAllComposted();
        // foreach Schleife über alle plant JSON, diese werden dabei erweitert
        plantArr.forEach(plant => {
            extendPlantJSON(plant,activitiesDaoInstance);
          });
          
        console.log('Service plants: Composted records loaded, count= ' + plantArr.length);
        resp.status(200).json(plantArr);
    } catch (ex) {
        console.error('Service plants: Error loading all composted records. Exception occurred: ' + ex.message);
        resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    }
});

serviceRouter.get('/plants/all', function(req, resp) {
    console.log('Service plants: Client requested all records');

    const plantDaoInstance = new plantsDao(req.app.locals.dbConnection);
    const activitiesDaoInstance = new activitiesDao(req.app.locals.dbConnection);
    try {
        var plantArr = plantDaoInstance.loadAll();
        // foreach Schleife über alle plant JSON, diese werden dabei erweitert
        plantArr.forEach(plant => {
            extendPlantJSON(plant,activitiesDaoInstance);
          });
          
        console.log('Service plants: Records loaded, count= ' + plantArr.length);
        resp.status(200).json(plantArr);
    } catch (ex) {
        console.error('Service plants: Error loading all records. Exception occurred: ' + ex.message);
        resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    }
});

serviceRouter.get('/plants/exists/:plant_id', 
    param("plant_id").isInt({min:0}).toInt(),
    function(req, resp) {

    console.log('Service plants: Client requested check, if record exists');
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
        console.warn('Service plants: Error checking if plant exists, validation errors');
        return resp.status(400).json({ errors: vResult.array() });
    }

    const data = matchedData(req);
    const plantDaoInstance = new plantsDao(req.app.locals.dbConnection);
    try {
        var exists = plantDaoInstance.exists(data.plant_id);
        console.log('Service plants: Check if record exists by id=' + data.plant_id +', exists= ' + exists);
        resp.status(200).json({'plant_id': data.plant_id, 'exists': exists});
    } catch (ex) {
        console.error('Service plants: Error checking if record exists. Exception occurred: ' + ex.message);
        resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    }
});

serviceRouter.post('/plants',
    body("name").default("New Plant").isString().notEmpty().trim().escape(),
    body("species_name").default("Unknown").isString().notEmpty().trim().escape(),
    body("watering_interval").isInt({min:1,max:100}).toInt(),
    body("watering_interval_offset").isInt({min:-25,max:25}).toInt(),
    body("added").optional().isISO8601(),
    function(req, resp) {

    console.log('Service plants: Client requested creation of new record');
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
        console.warn('Service plants: Error creating new record, validation errors');
        return resp.status(400).json({ errors: vResult.array() });
    }
    const data = matchedData(req);

    // use current date if date is not provided
    if (helper.isUndefined(data.added)) {
        data.added = helper.getNow();
    }
    else {
        data.added = helper.parseDateTimeString(data.added);
    }

    const plantDaoInstance = new plantsDao(req.app.locals.dbConnection);
    try {
        // #37 image is set to null
        var obj = plantDaoInstance.create(data.name, data.species_name,null,data.added,data.watering_interval,data.watering_interval_offset);
        console.log('Service plants: Record inserted');
        resp.status(200).json(obj);
    } catch (ex) {
        console.error('Service plants: Error creating new record. Exception occurred: ' + ex.message);
        resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    } 
});

serviceRouter.put('/plants', 
    body("plant_id").isInt({min:0}).bail().toInt().custom(validationHelper.validatePlantIDExists),
    body("name").optional().isString().notEmpty().trim().escape(),
    body("species_name").optional().isString().notEmpty().trim().escape(),
    body("watering_interval").optional().isInt({min:1,max:100}).toInt(),
    body("watering_interval_offset").optional().isInt({min:-25,max:25}).toInt(),
    body("composted").optional({values: "null"}).isISO8601(),
    function(req, resp) {
    
    // Evaluate request
    console.log('Service plants: Client requested update of existing plant');
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
        console.warn('Service plants: Error updating record, validation errors');
        return resp.status(400).json({ errors: vResult.array() });
    }
    const data = matchedData(req);
    const plantDaoInstance = new plantsDao(req.app.locals.dbConnection);

    // Load existing plant data
    let oldPlantData;
    try {
        oldPlantData = plantDaoInstance.loadById(data.plant_id)
        console.log('Service plants: Loaded existing plant data for update, plant_id=' + data.plant_id);
    } catch (ex) {
        console.error('Service plants: Error loading old plant data. Exception occurred: ' + ex.message);
        resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    } 

    // Check which fields need to be updated
    if (helper.isUndefined(data.name)) {
        // use current name from DB
        data.name = oldPlantData.name;
    }
    if (helper.isUndefined(data.species_name)) {
        // use current species_name from DB
        data.species_name = oldPlantData.species_name;
    }
    if (helper.isUndefined(data.watering_interval)) {
        // use current watering_interval from DB
        data.watering_interval = oldPlantData.watering_interval;
    }
    if (helper.isUndefined(data.watering_interval_offset)) {
        // use current watering_interval_offset from DB
        data.watering_interval_offset = oldPlantData.watering_interval_offset;
    }

    // null is not passed by express-validator, so we need to check the original req.body
    if (helper.isNull(req.body.composted)) {
        // set composted to null
        data.composted = null;
    }
    else if (helper.isUndefined(data.composted)) {
        // use current composted from DB
        data.composted = oldPlantData.composted;
    }

    // get the current image of the plant as it should not be changed here. See issue #37
    data.image = oldPlantData.image;

    try {
        // update the plant
        let obj = plantDaoInstance.update(data.plant_id, data.name, data.species_name, data.image, data.watering_interval, data.watering_interval_offset, data.composted);
        console.log('Service plants: Record updated, plant_id=' + data.plant_id);
        resp.status(200).json(obj);
    } catch (ex) {
        console.error('Service plants: Error updating record by plant_id. Exception occurred: ' + ex.message);
        resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    }    
});

serviceRouter.delete('/plants/:plant_id', 
    param("plant_id").isInt({min:0}).bail().toInt().custom(validationHelper.validatePlantIDExists),
    function(req, resp) {

    console.log('Service plants: Client requested deletion of plant');
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
        console.warn('Service plants: Error deleting plant, validation errors');
        return resp.status(400).json({ errors: vResult.array() });
    }
    const data = matchedData(req);

    const plantDaoInstance = new plantsDao(req.app.locals.dbConnection);
    try {
        plantDaoInstance.delete(data.plant_id);
        console.log('Service plants: Deletion of plant successful, plant_id=' + data.plant_id);
        resp.status(200).json({'plant_id': data.plant_id, 'deleted': true});
    } catch (ex) {
        console.error('Service plants: Error deleting record. Exception occurred: ' + ex.message);
        resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    }
});

module.exports = serviceRouter;