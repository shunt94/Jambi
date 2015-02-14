var JambiFS = function() {
    var fs = require('fs');

    JambiFS.prototype.readJSON = function(fileLocation, callback) {
        fs.readFile(fileLocation, "utf8" ,function (err, data) {
            if (err) throw err;

            if (typeof callback === "function") {
                callback(err, JSON.parse(data));
            }
        });
    };

    JambiFS.prototype.writeJSON = function(fileLocation, data) {
        fs.writeFile(fileLocation, data, function(err) {
            if (err) throw err;
            return true;
        });
    };

    JambiFS.prototype.readHTML = function(fileLocation, callback) {
        return fs.readFileSync(fileLocation, "utf8");
    };
}

var jambifs = new JambiFS();