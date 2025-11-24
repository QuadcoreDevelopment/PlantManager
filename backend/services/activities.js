const helper = require('../helper.js');
const validationHelper = require('./validationHelper.js');
const activitiesDao = require('../dao/activitiesDao.js');
const express = require('express');
let serviceRouter = express.Router();
const { body, param, matchedData, validationResult } = require('express-validator');

console.log('- Service Activities');

// Create new activity
serviceRouter.post('/activities',
    body("plant_id").isInt({min:0}).bail().toInt().custom(validationHelper.validatePlantIDExists),
    body("type").isInt({min:0, max:1}).toInt(),
    body("date").optional().isISO8601(),
    function(req, resp) {

    console.log('Service activities: Client requested creation of new activity');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        console.warn('Service activities: Creation not possible, validation errors');
        return resp.status(400).json({ errors: result.array() });
    }

    const data = matchedData(req);
    // use current date if date is not provided
    if (!data.date) {
        data.date = helper.formatToSQLDate(helper.getNow());
    }

    const activitiesDaoInstance = new activitiesDao(req.app.locals.dbConnection);
    try {
        let obj = activitiesDaoInstance.create(data.plant_id, data.type, data.date);
        console.log('Service activities: Record inserted');
        resp.status(200).json(obj);
    } catch (ex) {
        console.error('Service activities: Error creating new record. Exception occurred: ' + ex.message);
        resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    }
});

// Activity exists check
serviceRouter.get('/activities/exists/:id', 
    param("id").isInt({min:0}).toInt(),
    function(req, resp) {
    
    console.log('Service activities: Client requested check, if activity exists');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        console.warn('Service activities: Check not possible, validation errors');
        return resp.status(400).json({ errors: result.array() });
    }
    
    const data = matchedData(req);
    const activitiesDaoInstance = new activitiesDao(req.app.locals.dbConnection);
    try {
        let exists = activitiesDaoInstance.exists(data.id);
        console.log('Service activities: Check if activity exists by id=' + data.id +', exists= ' + exists);
        resp.status(200).json({'id': data.id, 'exists': exists});
    } catch (ex) {
        console.error('Service activities: Error checking if record exists. Exception occurred: ' + ex.message);
        resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    }
});

// Get all activities for a plants
serviceRouter.get('/activities/all/:plant_id',
    param("plant_id").isInt({min:0}).bail().toInt().custom(validationHelper.validatePlantIDExists), 
    function(req, resp) {

    console.log('Service activities: Client requested all records for a plant');
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
        console.warn('Service activities: Fetch not possible, validation errors');
        return resp.status(400).json({ errors: vResult.array() });
    }

    const data = matchedData(req);
    const activitiesDaoInstance = new activitiesDao(req.app.locals.dbConnection);

    try {
        let result = activitiesDaoInstance.loadByPlantId(data.plant_id);
        console.log('Service activities: Records loaded for plant_id = ' + data.plant_id);
    
        resp.status(200).json(result);
    } catch (ex) {
        console.error('Service activities: Error loading all records based on plant_id. Exception occurred: ' + ex.message);
        resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    }
});

// delete activity by id
serviceRouter.delete('/activities/:id', 
    param("id").isInt({min:0}).bail().toInt().custom(validationHelper.validateActivityIDExists), 
    function(req, resp) {

    console.log('Service activities: Client requested deletion of activity');
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
        console.warn('Service activities: Deletion not possible, validation errors');
        return resp.status(400).json({ errors: vResult.array() });
    }

    const data = matchedData(req);
    const activitiesDaoInstance = new activitiesDao(req.app.locals.dbConnection);

    try {
        activitiesDaoInstance.delete(data.id);
        console.log('Service activities: Deletion of activity successful, id=' + data.id);
        resp.status(200).json({'id': data.id, 'deleted': true});
    } catch (ex) {
        console.error('Service activities: Error deleting record. Exception occurred: ' + ex.message);
        resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    }
});

module.exports = serviceRouter;