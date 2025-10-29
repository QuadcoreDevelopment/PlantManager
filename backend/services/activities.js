const helper = require('../helper.js');
const validationHelper = require('./validationHelper.js');
const activitiesDao = require('../dao/activitiesDao.js');
const express = require('express');
var serviceRouter = express.Router();
const { body, param, matchedData, validationResult } = require('express-validator');

console.log('- Service Activities');

/**
 * Adds the days_since field to each activity in the provided array.
 * @param {*} activities The array of activity objects to process
 */
function addDaysSinceToActivities(activities) {
    const currentDate = new Date(); 
    activities.forEach(activity => {
        if (activity && activity.date) { 
            const activityDate = new Date(activity.date);
            const daysSince = helper.calculateDaysBetween(activityDate, currentDate);
            activity.days_since = daysSince;
        }
    });
}

// Create new activity
serviceRouter.post('/activities',
    body("plant_id").isInt({min:0}).bail().custom(validationHelper.validatePlantIDExists),
    body("type").isInt({min:0, max:1}).toInt(),
    body("date").optional().isISO8601(),
    function(req, resp) {

    console.log('Activities plants: Client requested creation of new activity');
    const result = validationResult(req);
    if (!result.isEmpty()) {
        console.warn('Service activities: Creation not possible, validation errors');
        return resp.status(400).json({ errors: result.array() });
    }

    const data = matchedData(req);
    // use current date if date is not provided
    if (helper.isUndefined(data.date)) {
        data.date = helper.getNow();
    }
    else {
        data.date = helper.parseDateTimeString(data.date);
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
    param("plant_id").isInt({min:0}).bail().custom(validationHelper.validatePlantIDExists), 
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
        var result = activitiesDaoInstance.loadByPlantId(data.plant_id);
        console.log('Service activities: Records loaded, result= ', result);

        var activities = [];
    
        // Check if result is an array or a single object
        if (Array.isArray(result)) {
            activities = result;
        } else if (result && typeof result === 'object') {
            activities = [result];
        } else {
            return resp.status(404).json({ errors: [{msg: 'No activities found for the given plant ID.'}] });
        }

        // Process each activity
        addDaysSinceToActivities(activities);
    
        resp.status(200).json(activities);
    } catch (ex) {
        console.error('Service activities: Error loading all records based on plant_id. Exception occurred: ' + ex.message);
        resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    }
});

// delete activity by id
serviceRouter.delete('/activities/:id', 
    param("id").isInt({min:0}).bail().custom(validationHelper.validateActivityIDExists), 
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