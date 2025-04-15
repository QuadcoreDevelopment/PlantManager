const fs = require('fs');

// check if a object exists
module.exports.exists = function(obj) {
	if (obj === null || obj === undefined) 
		return false;
	else 
		return true;
}

// retreive the property names of the uploaded files, the original HTML field names
module.exports.getFileHandles = function(request) {
	if (!this.exists(request.files)) 
		return [];

	return Object.keys(request.files);
}

// count the uploaded files
module.exports.cntUploadedFiles = function(request) {
	if (!this.exists(request.files)) 
		return 0;

	var cnt = 0;
	Object.keys(request.files).forEach(function (item) {
		if (Array.isArray(request.files[item])) 
			cnt += request.files[item].length;
		else 
			cnt++;
	});

	return cnt;
}

// check if any files were uploaded
module.exports.hasUploadedFiles = function(request) {
	return (this.cntUploadedFiles(request) > 0);
}

// checks if file handle exists
module.exports.existsFileHandle = function(request, handleName) {
	if (!this.exists(request.files)) 
		return false;

	if (request.files[handleName] === null || request.files[handleName] === undefined) 
		return false;

	return true;
}

// returns an array of json objects of the file data by file handle
// if handle not exists, returns empty array
// if only one file is uploaded converts this also to an array
// if expanded is true, add additional properties like nameOnly, extension, picture and webPicture
// also fixes filename if contains spaces
module.exports.getUploadedFilesAsArray = function(request, handleName, expanded) {
	if (!this.existsFileHandle(request, handleName)) 
		return [];

	// get objects
	var data = request.files[handleName];
	// if no array, convert to array
	if (!Array.isArray(data)) 
		data = [data];
	
	// expanded if needed
	for (x = 0; x < data.length; x++) {
		
		data[x].name = data[x].name.replace(/ /g, '_');

		var ext = this.getExtension(data[x].name);

		if (expanded) {
			data[x].nameOnly = this.getNameOnly(data[x].name);
			data[x].extension = ext;
			data[x].isPicture = this.isMimeTypePicture(data[x].mimetype);
			data[x].isWebPicture = this.isMimeTypeWebPicture(data[x].mimetype);
			data[x].hasExtension = ext.length > 0;
		}
	}
	
	// return result
	return data;
}

// returns all uploaded files as array
// adds also the handle name as property
// returns empty array if nothing found
// also fixes filename if contains spaces
module.exports.getAllUplodedFilesAsArray = function(request, expanded) {
	var handles = this.getFileHandles(request);

	var arr = [];
	for (i = 0; i < handles.length; i++) {

		var data = request.files[handles[i]];

		if (!Array.isArray(data)) 
			data = [ data ];

		for (x = 0; x < data.length; x++) {

			data[x].name = data[x].name.replace(/ /g, '_');

			var ext = this.getExtension(data[x].name);

			if (expanded) {
				data[x].nameOnly = this.getNameOnly(data[x].name);
				data[x].extension = ext;
				data[x].isPicture = this.isMimeTypePicture(data[x].mimetype);
				data[x].isWebPicture = this.isMimeTypeWebPicture(data[x].mimetype);
				data[x].hasExtension = ext.length > 0;
			}
			data[x].handleName = handles[i];
			arr.push(data[x]);
		}
	}
	
	return arr;
}

// checks if given obj is a file object, needs properties name, size, mimetype
module.exports.isFileObject = function(obj) {
	if (!this.exists(obj)) 
		return false;

	return (this.exists(obj.name) && this.exists(obj.size) && this.exists(obj.mimetype));
}

// extracts extension of a given filename
// if empty or not found, returns empty string
module.exports.getExtension = function(fileName) {
	if (!this.exists(fileName)) 
		return '';

	var idx = fileName.lastIndexOf('.');
	if (idx == -1) 
		return '';

	return fileName.substr(idx + 1);
}

// extracts filename without extension of a given filename
// if empty returns empty string
// if no extension returns the filename as is
module.exports.getNameOnly = function(fileName) {
	if (!this.exists(fileName)) 
		return '';

	var idx = fileName.lastIndexOf('.');
	if (idx == -1) 
		return fileName;

	return fileName.substr(0, idx);
}

// checks if a given mimetype is of type picture
module.exports.isMimeTypePicture = function(mimeType) {
	if (!this.exists(mimeType)) 
		return false;
	return mimeType.startsWith('image');
}

// checks if a given mimetype is of type webpicture
// only jpg, gif or png are allowed
module.exports.isMimeTypeWebPicture = function(mimeType) {
	if (!this.exists(mimeType)) 
		return false;

	return (mimeType === 'image/jpeg' || mimeType === 'image/png' || mimeType === 'image/gif');
}

// checks if a given file object if of type picture
module.exports.isFileObjectPicture = function(obj) {
	if (!this.isFileObject(obj)) 
		return false;

	return this.isMimeTypePicture(obj.mimetype);
}

// checks if a given file object if of type webpicture
// only jpg, gif or png are allowed
module.exports.isFileObjectWebPicture = function(obj) {
	if (!this.isFileObject(obj)) 
		return false;

	return this.isMimeTypeWebPicture(obj.mimetype);
}

// creates an random filename
// defined by length and extension
// if the filename length is smaller 4 it is set to 4
module.exports.createRandomFilename = function(fileNameLength, extension) {
	if (!this.exists(fileNameLength)) 
		fileNameLength = 4;

	if (fileNameLength < 4) 
		fileNameLength = 4;

	var result = [];
	var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for ( i = 0; i < fileNameLength; i++ ) {
		result.push(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
	}

	var randomName = result.join('');
	if (this.exists(extension)) 
		randomName += '.' + extension;
	
	return randomName;
}

// checks if a given file exists in given folder
module.exports.existsFile = function(pathToFile) {
	return fs.existsSync(pathToFile);
}
