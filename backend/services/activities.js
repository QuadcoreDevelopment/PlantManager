const helper = require('../helper.js');
const activitiesDao = require('../dao/activitiesDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Activities');

// Neue Activity erstellen
serviceRouter.post('/activities', function(request, response) {
    console.log('Activities plants: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.plant_id)) {
        errorMsgs.push('plant_id missing');
    }       
    if (helper.isUndefined(request.body.type)) {
        errorMsgs.push('type missing');
    }
    // Aktuelles Datum für date nehmen
    if (helper.isUndefined(request.body.date)) {
        request.body.added = helper.getNow();
    }

    if (errorMsgs.length > 0) {
        console.log('Service activities: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Function not possible. Missing Data: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const activitiesDaoInstance = new activitiesDao(request.app.locals.dbConnection);
    try {
        var obj = activitiesDaoInstance.create(request.body.plant_id, request.body.type, request.body.date);
        console.log('Service activities: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service activities: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Activity nach ID holen
serviceRouter.get('/activities/exists/:id', function(request, response) {
    console.log('Service activities: Client requested check, if activity exists, id=' + request.params.id);

    const activitiesDaoInstance = new activitiesDao(request.app.locals.dbConnection);
    try {
        var exists = activitiesDaoInstance.exists(request.params.id);
        console.log('Service activities: Check if activity exists by id=' + request.params.id +', exists= ' + exists);
        response.status(200).json({'id': parseInt(request.params.id), 'existiert': exists});
    } catch (ex) {
        console.error('Service activities: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Alle Activities holen
serviceRouter.get('/activities/all/', function(request, response) {
    console.log('Service activities: Client requested all records');

    const activitiesDaoInstance = new activitiesDao(request.app.locals.dbConnection);

    request.body.days_since = request.body.date - helper.getNow();

    try {
        var arr = activitiesDaoInstance.loadAll();
        console.log('Service activities: Records loaded, count= ' + arr.length);

        // days_since: Berechnen, seit wann Activity existiert
        const currentDate = new Date(); // Get the current date
        arr.forEach(activity => {
            const activityDate = activity.date;
            const timeDifference = currentDate - activityDate; // Zeitunterschied in Millisekunden
            const daysSince = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Millisekunden in Tage umrechnen
            activity.days_since = daysSince; 
        });

        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service activities: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Activity löschen
serviceRouter.delete('/activities/:id', function(request, response) {
    console.log('Service activities: Client requested deletion of activity, id=' + request.params.id);

    const activitiesDaoInstance = new activitiesDao(request.app.locals.dbConnection);
    try {
        activitiesDaoInstance.delete(request.params.id);
        console.log('Service activities: Deletion of activity successfull, id=' + request.params.id);
        response.status(200).json({ 'fehler': false, 'nachricht': 'Activity deleted' });
    } catch (ex) {
        console.error('Service activities: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;