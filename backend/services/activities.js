const helper = require('../helper.js');
const activitiesDao = require('../dao/activitiesDao.js');
const express = require('express');
var serviceRouter = express.Router();

console.log('- Service Activities');

// Neue Activity erstellen
serviceRouter.post('/activities', function(request, response) {
    try {
        //
    } catch (error) {
        //
    }
});

// Activity nach ID holen
serviceRouter.get('/activities/exists/:id', function(request, response) {
    try {
        //
    } catch (error) {
        //
    }
});

// Alle Activities holen
serviceRouter.get('/activities/all/', function(request, response) {
    try {
        //
    } catch (error) {
        //
    }
});

// Activity löschen
serviceRouter.delete('/activities/:id', function(request, response) {
    try {
        //
    } catch (error) {
        //
    }
});

module.exports = serviceRouter;