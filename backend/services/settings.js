const validationHelper = require('./validationHelper.js');
const express = require('express');
const settingsDao = require('../dao/settingsDao.js');
const { body, param, matchedData, validationResult } = require('express-validator');

const serviceRouter = express.Router();
console.log('- Service Settings');

serviceRouter.get('/settings/:key',
    param('key').isString().trim().custom(validationHelper.validateSettingKey),
    function(req, resp) {

        console.log('Service settings: Client requested loading of setting');
        const result = validationResult(req);
        if (!result.isEmpty()) {
            console.warn('Service settings: Loading not possible, validation errors');
            return resp.status(400).json({ errors: result.array() });
        }
        const data = matchedData(req);
        const dao = new settingsDao(req.app.locals.dbConnection);
        
        try {
            const val = dao.load(data.key);
            if (val === null) return resp.status(404).json({ errors: [{ msg: 'Not found' }]});
            resp.status(200).json({ key: data.key, value: val });
        } catch (ex) {
            resp.status(500).json({ errors: [{ msg: ex.message }] });
        }
    }
);

serviceRouter.put('/settings/',
    body('key').isString().trim().custom(validationHelper.validateSettingKey),
    body('value').isString().trim().custom(validationHelper.validateSettingValue),
    function(req, resp) {

        console.log('Service settings: Client requested saving of setting');
        const result = validationResult(req);
        if (!result.isEmpty()) {
            console.warn('Service settings: Saving not possible, validation errors');
            return resp.status(400).json({ errors: result.array() });
        }
        const data = matchedData(req);
        const dao = new settingsDao(req.app.locals.dbConnection);
        
        try {
            dao.save(data.key, data.value);
            resp.status(200).json({ key: data.key, value: data.value });
        } catch (ex) {
            resp.status(500).json({ errors: [{ msg: ex.message }] });
        }
    }
);

module.exports = serviceRouter;