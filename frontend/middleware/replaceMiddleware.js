const fs = require('fs');
const path = require('path');

function replaceMiddleware(req, res, next) {
    let requestedFile = req.path;

    // Wenn Root angefragt wird, auf index.html umleiten
    if (requestedFile === '/' || requestedFile === '') {
        requestedFile = '/index.html';
    }

    if (requestedFile.endsWith('.html')) {
        console.log("replaceMiddleware");
        const filePath = path.join(__dirname, '../public', requestedFile);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.log("Error in replaceMiddleware: could not find " + filePath);
                return next();
            }
            fs.readFile(path.join(__dirname, '../templates', 'test.html'), 'utf8', (testErr, testContent) => {
                if (testErr){ 
                    testContent = '';
                    console.log("Error in replaceMiddleware: could not find file test.html");
                }
                const replaced = data.replace('<!-- test -->', testContent);
                res.setHeader('Content-Type', 'text/html');
                res.send(replaced);
            });
        });
    } else {
        next();
    }
}

module.exports = replaceMiddleware;