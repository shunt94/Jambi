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
        fs.writeFileSync(fileLocation, data);
    };

    JambiFS.prototype.writeHTML = function(fileLocation, data) {
        fs.writeFileSync(fileLocation, data);
    };

    JambiFS.prototype.readHTML = function(fileLocation, callback) {
        return fs.readFileSync(fileLocation, "utf8");
    };

    JambiFS.prototype.readDir = function(path) {
        try {
            return fs.readdirSync(path);
        } catch(err) {
            console.log(err);
            return false;
        }
    };

    JambiFS.prototype.stat = function(path) {
        return fs.statSync(path);
    };
}

var jambifs = new JambiFS();