const plantsDao = require('../dao/plantsDao.js');
const activitiesDao = require('../dao/activitiesDao.js');

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