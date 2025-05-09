const helper = require('../helper.js');
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
        console.log('Service plants: Check if record exists by id=' + request.params.id +', exists= ' + exists);
        response.status(200).json({'id': request.params.id, 'existiert': exists});
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
    if (helper.isUndefined(request.body.image)) {
        errorMsgs.push('image missing');
    }
    // Nimmt aktuelles Datum für added, kann noch anders strukturiert werden
    if (helper.isUndefined(request.body.added)) {
        request.body.added = helper.getNow();
    }
    if (helper.isUndefined(request.body.watering_interval)) {
        errorMsgs.push('watering_interval missing');
    }
    if (helper.isUndefined(request.body.watering_interval_offset)) {
        errorMsgs.push('watering_interval_offset missing');
    }
    if (errorMsgs.length > 0) {
        console.log('Service plants: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Function not possible. Missing Data: ' + helper.concatArray(errorMsgs) });
        return;
    }

    const plantDaoInstance = new plantsDao(request.app.locals.dbConnection);
    try {
        var obj = plantDaoInstance.create(request.body.name, request.body.species_name,request.body.image,request.body.added,request.body.watering_interval,request.body.watering_interval_offset);
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
    if (helper.isUndefined(request.body.id)) {
        errorMsgs.push('id missing');
    }
    if (helper.isUndefined(request.body.name)) {
        errorMsgs.push('name missing');
    }       
    if (helper.isUndefined(request.body.species_name)) {
        errorMsgs.push('species_name missing');
    }
    if (helper.isUndefined(request.body.image)) {
        errorMsgs.push('image missing');
    }
    if (helper.isUndefined(request.body.added)) {
        let plant = plantDaoInstance.loadById(request.body.id);
        request.body.added = plant.added;
    }
    if (helper.isUndefined(request.body.watering_interval)) {
        errorMsgs.push('watering_interval missing');
    }
    if (helper.isUndefined(request.body.watering_interval_offset)) {
        errorMsgs.push('watering_interval_offset missing');
    }
    if (errorMsgs.length > 0) {
        console.log('Service plants: Creation not possible, data missing');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Function not possible. Missing Data: ' + helper.concatArray(errorMsgs) });
        return;
    }

    try {
        var obj = plantDaoInstance.update(request.body.id,request.body.name, request.body.species_name,request.body.image,request.body.added,request.body.watering_interval,request.body.watering_interval_offset);
        console.log('Service plants: Record updated, id=' + request.body.id);
        response.status(200).json(obj);
    } catch (ex) {
        console.error('Service plants: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }    
});

serviceRouter.delete('/plants/:id', function(request, response) {
    console.log('Service plants: Client requested deletion of plant, id=' + request.params.id);

    const plantDaoInstance = new plantsDao(request.app.locals.dbConnection);
    try {
        plantDaoInstance.delete(request.params.id);
        console.log('Service plants: Deletion of plant successfull, id=' + request.params.id);
        response.status(200).json({ 'fehler': false, 'nachricht': 'Plant deleted' });
    } catch (ex) {
        console.error('Service plants: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json({ 'fehler': true, 'nachricht': ex.message });
    }
});

// Hier Inhalt

module.exports = serviceRouter;