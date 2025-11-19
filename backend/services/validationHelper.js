const plantsDao = require('../dao/plantsDao.js');
const activitiesDao = require('../dao/activitiesDao.js');
const { matchedData } = require('express-validator');

// plant exists validation function
module.exports.validatePlantIDExists = (value,{req}) => {
    const plantsDaoInstance = new plantsDao(req.app.locals.dbConnection);
    console.log('Validating plant_id existence: ' + value);
    if (!plantsDaoInstance.exists(value)) {
      throw new Error('Plant with the given ID does not exist');
    }
    return true;
};

// activity exists validation function
module.exports.validateActivityIDExists = (value,{req}) => {
    const activitiesDaoInstance = new activitiesDao(req.app.locals.dbConnection);
    console.log('Validating activity_id existence: ' + value);
    if (!activitiesDaoInstance.exists(value)) {
      throw new Error('Activity with the given ID does not exist');
    }
    return true;
}

module.exports.validateSettingKey = (value,{req}) => {
    const validKeys = ['watering_profile'];
    console.log('Validating settings key: ' + value);
    if (!validKeys.includes(value)) {
      throw new Error('Invalid settings key');
    }
    return true;
}

/**
 * setting value validation function
 * requires that the setting key has already been validated
 * @param {*} value 
 * @param {*} param1 
 * @returns {boolean} true if valid, throws error if invalid
 */
module.exports.validateSettingValue = (value,{req}) => {
  let key = matchedData(req).key;  
  console.log('Validating setting value for key ' + key + ': ' + value);
    // Add specific validation logic based on the key
    if (key === 'watering_profile') {
        const validProfiles = ['cold', 'normal', 'warm'];
        if (!validProfiles.includes(value)) {
            throw new Error('Invalid value for watering_profile. Allowed values are: ' + validProfiles.join(', '));
        }
    }
    return true;
}

/**
 * Converts an exception to a JSON object.
 * @param {Error} ex The exception to convert
 * @returns {Object} JSON object representing the exception
 */
module.exports.exceptionToJson = (ex) => {
    return { 
      'msg': "An error occurred", 
      'errorMsg': ex.message
    };
}