const helper = require('../helper.js');
const express = require('express');
const plantsDao = require('../dao/plantsDao.js');
const fs = require('fs');
var serviceRouter = express.Router();

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
            errorMsgs.push('no files provided');
        }
    }
    catch(ex)
    {
        response.status(400).json({'fehler': true, 'nachricht': 'Error in Validation: ' + ex});
    }

    // Send back result of validation
    if (errorMsgs.length > 0) {
        console.log('Service Upload: Upload not possible, data missing or invalid');
        response.status(400).json({ 'fehler': true, 'nachricht': 'Function not possible. Missing or invalid Data: ' + helper.concatArray(errorMsgs) });
        return;
    }

    //Get image, save it and update plant
    try 
    {
        // get handle on file info, in this case 'picture' is the HTML Field Name
        var picture = request.files.picture;

        // validate mimetype type
        // Based on tests iI saw: 'image/jpeg','application/pdf' and 'application/x-msdownload'
        let type = picture.mimetype.split("/")[0];
        if(type != "image")
        {
            console.log('Service Upload: Client uploaded file of type "' + type + '" but was supposed to upload image');
            response.status(400).json({'fehler': true, 'nachricht': 'the file sent was not of type image but "' + type + '"'});
            return;
        }

        // save file on server
        // if target directory is not existent, it is created automatically
        // exsisting files will be overwritten!
        console.log('Service Upload: saving file to target directory on server');
        let extension = picture.name.split(".").pop();
        let filename = plant_id + "." + extension;
        picture.mv('./public/images/plants/' + filename);

        // about Path Traversal attacks on the .mv:
        // - plant_id is validated as number and should thus be safe
        // - extension can not contain . because of the split and pop

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

        response.status(200).json({'fehler': false});
    }
    catch(ex)
    {
        response.status(400).json({'fehler': true, 'nachricht': 'Error in Service: ' + ex});
    }

});

module.exports = serviceRouter;