const helper = require('../helper.js');
const validationHelper = require('./validationHelper.js');
const express = require('express');
const plantsDao = require('../dao/plantsDao.js');
var serviceRouter = express.Router();
const { body, param, matchedData, validationResult } = require('express-validator');

console.log('- Service Plants');

// TODO Test all endpoints. Especially dates and intervals with setting different watering profiles

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
    try {
        // JSON Objekt aus DB holen
        var obj = plantDaoInstance.loadById(data.plant_id);
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
    try {
        var plantArr = plantDaoInstance.loadAllComposted();
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
    try {
        var plantArr = plantDaoInstance.loadAll();
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
    body("watering_interval_warm").isInt({min:1,max:100}).toInt(),
    body("watering_interval_cold").isInt({min:1,max:100}).toInt(),
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
        data.added = helper.formatToSQLDate(helper.getNow());
    }

    const plantDaoInstance = new plantsDao(req.app.locals.dbConnection);
    try {
        // #37 image is set to null
        var obj = plantDaoInstance.create(data.name, data.species_name,null,data.added,data.watering_interval,data.watering_interval_warm,data.watering_interval_cold);
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
    body("watering_interval_warm").optional().isInt({min:1,max:100}).toInt(),
    body("watering_interval_cold").optional().isInt({min:1,max:100}).toInt(),
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
    if (helper.isUndefined(data.watering_interval_warm)) {
        // use current watering_interval from DB
        data.watering_interval_warm = oldPlantData.watering_interval_warm;
    }
    if (helper.isUndefined(data.watering_interval_cold)) {
        // use current watering_interval from DB
        data.watering_interval_cold = oldPlantData.watering_interval_cold;
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
        let obj = plantDaoInstance.update(data.plant_id, data.name, data.species_name, data.image, data.watering_interval, data.watering_interval_warm, data.watering_interval_cold, data.composted);
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