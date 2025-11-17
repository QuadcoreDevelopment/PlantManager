const helper = require('../helper.js');
const validationHelper = require('./validationHelper.js');
const express = require('express');
const plantsDao = require('../dao/plantsDao.js');
const fs = require('fs');
var serviceRouter = express.Router();
const { body, matchedData, validationResult } = require('express-validator');

console.log('- Service Upload');

function deletePublicImage(filenameAndPath){
    let path = './public/images/' + filenameAndPath;
    console.log('Service Upload: Scheduling deletion of ' + path + ' from the FS');
    fs.unlink(path, (err) => {
        if (err)
        {
            console.log('Service Upload: Unable to delete ' + path + ' from the FS: ' + err);
        }
        console.log('Service Upload:' + path + ' was deleted from the FS');
    }); 
}

function isValidImageExtension(extension){
    const validExtensions = ['jpg','jpeg','png','gif','bmp','webp','heic'];
    return validExtensions.includes(extension.toLowerCase());
}

function isValidImageMimeType(mimeType){
    // Based on tests I saw: 'image/jpeg','application/pdf' and 'application/x-msdownload'
    const validMimeTypes = ['image/jpg','image/jpeg', 'image/heic','image/png','image/gif','image/bmp','image/webp'];
    return validMimeTypes.includes(mimeType);
}

// Files can't be validated with express-validator directly, so we only validate the plant_id here
serviceRouter.put('/upload/image', 
    body("plant_id").isInt({min:0}).bail().toInt().custom(validationHelper.validatePlantIDExists),
    (req, resp) => {
    
    console.log('Service Upload: Client uploaded an image');
    const vResult = validationResult(req);
    if (!vResult.isEmpty()) {
        console.warn('Service plants: Error uploading an image, validation errors');
        return resp.status(400).json({ errors: vResult.array() });
    }

    const plant_id = matchedData(req).plant_id;
    const plantDaoInstance = new plantsDao(req.app.locals.dbConnection);
    let picture = null;
    let extension = "error";

    // File Validations
    try {
        if (!req.files || !req.files.picture) {
            console.warn('Service Upload: No file was uploaded by the client');
            return resp.status(400).json({ errors: [{msg: 'No picture was uploaded'}] });
        }
        picture = req.files.picture;
        if(!isValidImageMimeType(picture.mimetype))
        {
            console.warn('Service Upload: Client uploaded file with MimeType "' + picture.mimetype + '" but was supposed to upload image');
            return resp.status(400).json({ errors: [{msg: 'The uploaded file had the wrong mimetype'}] });
        }
        extension = picture.name.split(".").pop();
        if(!isValidImageExtension(extension))
        {
            console.warn('Service Upload: Client uploaded file with extension "' + extension + '" but was supposed to upload image');
            return resp.status(400).json({ errors: [{msg: 'The uploaded file had the wrong extension'}] });
        }
    }
    catch(ex)
    {
        console.error('Service Upload: Exception during file validation: ' + ex.message);
        return resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    }


    //Get image, save it and update plant
    try 
    {
        // save file on server
        // if target directory does not exist, it will be created automatically
        // existing files will be overwritten!
        console.log('Service Upload: saving file to target directory on server');
        let filename = plant_id + "." + extension;
        picture.mv('./public/images/plants/' + filename);

        // about Path Traversal attacks on the .mv:
        // - plant_id is validated and sanitized by the express validator and should thus be safe
        // - extension is checked against a whitelist and should thus be safe

        // Update plant to use the uploaded picture
        let plant = plantDaoInstance.loadById(plant_id);
        let oldFile = plant.image;
        console.log('Service Upload: updating plant to use new image');
        plantDaoInstance.update(plant_id,plant.name,plant.species_name,filename,plant.watering_interval,plant.watering_interval_offset)

        // delete the old image if necessary (eg. when the old one was .jpeg and the new one is .png)
        if(!helper.isUndefined(oldFile) && !helper.isNull(oldFile) && oldFile != "" && oldFile != filename)
        {
            deletePublicImage('plants/' + oldFile);

            // about Path Traversal attacks on the delete:
            // - as long as the filename in the DB is clean this is not an issue
        }

        resp.status(200).json({'success': true, 'filename': filename, 'plant_id': plant_id});
    }
    catch(ex)
    {
        console.error('Service Upload: Exception while saving file: ' + ex.message);
        return resp.status(500).json({ errors: [validationHelper.exceptionToJson(ex)] });
    }
});

module.exports = serviceRouter;