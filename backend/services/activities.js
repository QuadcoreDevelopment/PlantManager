const helper = require('../helper.js');
const validationHelper = require('./validationHelper.js');
const activitiesDao = require('../dao/activitiesDao.js');
const express = require('express');
var serviceRouter = express.Router();
const { body, param, matchedData, validationResult } = require('express-validator');

console.log('- Service Activities');

// Neue Activity erstellen
// TODO Funktion weiter ausbauen
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

// Activity nach ID holen
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

// Alle Activities für Plant_ID holen
serviceRouter.get('/activities/all/:plant_id', function(request, response) {

    console.log('Service activities: Client requested all records');

    const activitiesDaoInstance = new activitiesDao(request.app.locals.dbConnection);

    request.body.days_since = request.body.date - helper.getNow();
    try {
        var result = activitiesDaoInstance.loadByPlantId(request.params.plant_id);
        console.log('Service activities: Records loaded, result= ', result);

        var activities = [];
    
        // Check if result is an array or a single object
        if (Array.isArray(result)) {
            activities = result;
        } else if (result && typeof result === 'object') {
            activities = [result];
        } else {
            return response.status(404).json({ 'fehler': true, 'nachricht': 'No activities found for the given plant ID.' });
        }
    
        // Process each activity
        const currentDate = new Date(); 
        activities.forEach(activity => {
            if (activity && activity.date) { 
                const activityDate = new Date(activity.date);
                const timeDifference = currentDate - activityDate;
                const daysSince = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
                activity.days_since = daysSince;
            }
        });
    
        response.status(200).json(activities);
    } catch (ex) {
        console.error('Service activities: Error loading all records. Exception occurred: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Activity löschen
serviceRouter.delete('/activities/:id', function(request, response) {
    console.log('Service activities: Client requested deletion of activity, id=' + request.params.id);

    const activitiesDaoInstance = new activitiesDao(request.app.locals.dbConnection);

    try {
        if (activitiesDaoInstance.exists(request.params.id)) {
            activitiesDaoInstance.delete(request.params.id);
            console.log('Service activities: Deletion of activity successfull, id=' + request.params.id);
            response.status(200).json({ 'fehler': false, 'nachricht': 'Activity deleted' });
        } else {
            console.error('Service activities: Activity with given ID does not exist.');
            response.status(404).json({ 'fehler': true, 'nachricht': 'Activity with the given ID does not exist.' });
        }
    } catch (ex) {
        console.error('Service activities: Error deleting record. Exception occurred: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;