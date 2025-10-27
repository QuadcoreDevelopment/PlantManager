const plantsDao = require('../dao/plantsDao.js');

// plant_id exists validation function
module.exports.validatePlantIDExists = (value,{req}) => {
    const plantsDaoInstance = new plantsDao(req.app.locals.dbConnection);
    console.log('Validating plant_id existence: ' + value);
    if (!plantsDaoInstance.exists(value)) {
      throw new Error('Plant with the given ID does not exist');
    }
    return true;
};