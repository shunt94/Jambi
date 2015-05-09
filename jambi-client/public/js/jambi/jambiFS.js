/*
    Class: JambiFS
    Purpose: To abstract NodeFS
*/
var JambiFS = function() {
    var fs = require('fs');
    /*
        Method: readJSON
        Purpose: Loads in an external file and returns the results in utf8
    */
    JambiFS.prototype.readJSON = function(fileLocation, callback) {
        // Read file
        fs.readFile(fileLocation, "utf8" ,function (err, data) {
            if (err) throw err;
            // Execute callback
            if (typeof callback === "function") {
                callback(err, JSON.parse(data));
            }
        });
    };

    /*
        Method: writeJSON
        Purpose: writes a file to a file location
    */
    JambiFS.prototype.writeJSON = function(fileLocation, data) {
        fs.writeFileSync(fileLocation, data);
    };

    /*
        Method: writeHTML
        Purpose: writes a html file to a file location
    */
    JambiFS.prototype.writeHTML = function(fileLocation, data) {
        fs.writeFileSync(fileLocation, data);
    };

    /*
        Method: readHTML
        Purpose: reads in a html file and returns the data in utf8 format
    */
    JambiFS.prototype.readHTML = function(fileLocation, callback) {
        return fs.readFileSync(fileLocation, "utf8");
    };

    /*
        Method: readDir
        Purpose: reads a directory and returns the file list or false
    */
    JambiFS.prototype.readDir = function(path) {
        try {
            return fs.readdirSync(path);
        } catch(err) {
            console.log(err);
            return false;
        }
    };
    /*
        Method: stat
        Purpose: stat a directory and return results
    */
    JambiFS.prototype.stat = function(path) {
        return fs.statSync(path);
    };
}
// Create new instance of class
var jambifs = new JambiFS();