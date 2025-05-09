const helper = require('../helper.js');
const activitiesDao = require('../dao/activitiesDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Activities');

// Neue Activity erstellen
serviceRouter.post('/activities', function(request, response) {
    // kommt noch...
});

// Activity nach ID holen
serviceRouter.get('/activities/exists/:id', function(request, response) {
    console.log('Service activities: Client requested check, if activity exists, id=' + request.params.id);

    const activitiesDaoInstance = new activitiesDao(request.app.locals.dbConnection);
    try {
        var exists = activitiesDaoInstance.exists(request.params.id);
        console.log('Service activities: Check if activity exists by id=' + request.params.id +', exists= ' + exists);
        response.status(200).json({'id': request.params.id, 'existiert': exists});
    } catch (ex) {
        console.error('Service activities: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Alle Activities holen
serviceRouter.get('/activities/all/', function(request, response) {
    console.log('Service activities: Client requested all records');

    const activitiesDaoInstance = new activitiesDao(request.app.locals.dbConnection);
    try {
        var arr = activitiesDaoInstance.loadAll();
        console.log('Service activities: Records loaded, count= ' + arr.length);
        response.status(200).json(arr);
    } catch (ex) {
        console.error('Service activities: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Activity löschen
serviceRouter.delete('/activities/:id', function(request, response) {
    console.log('Service activities: Client requested deletion of activity, id=' + request.params.id);

    const activitiesDaoInstance = new activitesDaoInstance(request.app.locals.dbConnection);
    try {
        var obj = activitiesDaoInstance.loadById(request.params.id);
        activitiesDaoInstance.delete(request.params.id);
        console.log('Service activities: Deletion of activity successfull, id=' + request.params.id);
        response.status(200).json({ 'fehler': false, 'nachricht': 'Activity deleted' });
    } catch (ex) {
        console.error('Service activities: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

module.exports = serviceRouter;