const helper = require('../helper.js');
const PlantsDao = require('../dao/plantsDao.js');
const express = require('express');
const plantsDao = require('../dao/plantsDao.js');
var serviceRouter = express.Router();

console.log('- Service Plants');

serviceRouter.get('/plants/get/:id', function(request, response) {
    console.log('Service plants: Client requested one record, id=' + request.params.id);

    const plantDaoInstance = new plantsDao(request.app.locals.dbConnection);
    try {
        var obj = plantDaoInstance.loadById(request.params.id);
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
    try {
        var arr = plantDaoInstance.loadAll();
        console.log('Service plants: Records loaded, count= ' + arr.length);
        response.status(200).json(arr);
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
        console.log('Service planst: Check if record exists by id=' + request.params.id +', exists= ' + exists);
        response.status(200).json({'id': request.params.id, 'existiert': exists});
    } catch (ex) {
        console.error('Service plants: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// NOCH NICHT FERTIG FERTIG BEARBEITEN
serviceRouter.post('/plants', function(request, response) {
    console.log('Service plants: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.kennzeichnung)) 
        errorMsgs.push('kennzeichnung fehlt');
    if (helper.isUndefined(request.body.bezeichnung)) 
        errorMsgs.push('bezeichnung fehlt');
    
    if (errorMsgs.length > 0) {
        console.log('Service Land: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Funktion nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const landDao = new LandDao(request.app.locals.dbConnection);
    try {
        var obj = landDao.create(request.body.kennzeichnung, request.body.bezeichnung);
        console.log('Service Land: Record inserted');
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service Land: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

// Hier Inhalt

module.exports = serviceRouter;