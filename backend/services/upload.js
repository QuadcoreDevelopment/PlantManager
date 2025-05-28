const helper = require('../helper.js');
const express = require('express');
const plantsDao = require('../dao/plantsDao.js');
var serviceRouter = express.Router();

console.log('- Service Upload');

serviceRouter.post('/upload/image', (request, response) => {
    console.log('Service Upload: Client uploaded an image');

    const plantDaoInstance = new plantsDao(request.app.locals.dbConnection);
    let errorMsgs=[];
    let plant_id = request.body.plant_id;

    // Validations
    try {
        if (helper.isUndefined(plant_id)) {
            errorMsgs.push('plant_id missing');
        } else if (!helper.isNumeric(plant_id)) {
            errorMsgs.push('plant_id has to be a number');
        } else if (plant_id <= 0) {
            errorMsgs.push('plant_id has to be a bigger number than 0');
        } else if(!plantDaoInstance.exists(plant_id)) {
            errorMsgs.push('no plant with this plant_id');
        }
        if (!request.files) {
            errorMsgs.push('missing file');
        }
    }
    catch(ex)
    {
        response.status(400).json({'fehler': true, 'nachricht': 'Error in Service: ' + ex});
    }

    // Send back result of validation
    if (errorMsgs.length > 0) {
        console.log('Service Upload: Upload not possible, data missing or invalid');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Function not possible. Missing or invalid Data: ' + helper.concatArray(errorMsgs) });
        return;
    }

    //TODO continue here

});

module.exports = serviceRouter;