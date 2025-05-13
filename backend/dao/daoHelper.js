const helper = require('../helper.js');

// guarantees the DAO return type to be an array
// no matter how many entries were loaded
module.exports.guaranteeArray = function(result){
    if (helper.isUndefined(result)){
        return [];
    }
    else if(!helper.isArray(result)){
        return [result];
    }
    else{
        return result;
    }
}