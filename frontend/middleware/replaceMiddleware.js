const fs = require('fs');
const path = require('path');

// Mapping: Marker => Datei
const replacements = {
    '<!-- nav -->': path.join(__dirname, '../templates/nav.html'),
    '<!-- commonHead -->': path.join(__dirname, '../templates/commonHead.html'),
    '<!-- bottomScripts -->': path.join(__dirname, '../templates/bottomScripts.html'),
    // weitere Marker und Dateien hier ergänzen
};

function replaceMiddleware(req, res, next) {
    let requestedFile = req.path;

    // Wenn Root angefragt wird, auf index.html umleiten
    if (requestedFile === '/' || requestedFile === '') {
        requestedFile = '/index.html';
    }

    // Wenn es kein HTML ist skip
    if (!requestedFile.endsWith('.html')) {
        return next();
    }

    console.log(`replaceMiddleware running for ${requestedFile}`);

    const filePath = path.join(__dirname, '../public', requestedFile);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.log("Error in replaceMiddleware: could not find " + filePath);
            return next();
        }

        // Alle Marker ersetzen
        const markers = Object.keys(replacements);
        let pending = markers.length;
        let replacedData = data;

        if (pending === 0) {
            res.setHeader('Content-Type', 'text/html');
            return res.send(replacedData);
        }

        markers.forEach(marker => {
             
            if(!replacedData.includes(marker))
            {
                pending--;
                return; //hier wie continue
            }

            fs.readFile(replacements[marker], 'utf8', (fileErr, fileContent) => {
                if (fileErr) {
                    console.log(`Error in replaceMiddleware: could not find file for marker ${marker}`);
                }
                else {
                    replacedData = replacedData.replace(marker, fileContent);
                }
                pending--;
                if (pending <= 0) {
                    res.setHeader('Content-Type', 'text/html');
                    res.send(replacedData);
                }
            });
        });
    });
}

module.exports = replaceMiddleware;