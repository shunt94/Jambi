var jambiInsta = function () {

    var instaArray = {};
    var instaStarted = false;
    var instaStart;
    var instaEnd;
    var instaString = "";
    var counter = 0;
    var fs = require('fs');



    jambiInsta.prototype.getInstas = function () {
        // get instas from json file
        jambifs.readJSON('instas/instas.json', function(err, data){
            instaArray = data;
        });
    };

    jambiInsta.prototype.addNew = function(name, code) {
        function generateRandomString(length, chars) {
            var result = '';
            for (var i = length; i > 0; --i) {
                result += chars[Math.round(Math.random() * (chars.length - 1))];
            }
            return result;
        }
        var filename = generateRandomString(8, '0123456789abcdefghijklmnopqrstuvwxyz');
        var dateSeconds = new Date();
        filename += dateSeconds.getTime() + ".html";

        instaArray[name] = 'instas/' + filename;

        fs.writeFile('instas/instas/' + filename, code.toString(), function (err) {
            if (err) {
                jambi.showNotification('Jambi Intas', 'Error - Could not make new insta');
            } else {
                jambi.showNotification('Jambi Intas', 'Successfully made new insta');
            }
        });

        jambifs.writeJSON('instas/instas.json', JSON.stringify(instaArray));
    };

    jambiInsta.prototype.getInstaValues = function () {
        return Object.keys(instaArray);
    };

    jambiInsta.prototype.getString = function () {
        return instaString;
    };

    jambiInsta.prototype.addCharacter = function (character) {
        instaString += character;
    };

    jambiInsta.prototype.removeCharacter = function () {
        instaString.slice(0, -1);
    };

    jambiInsta.prototype.destoryString = function () {
        instaString = "";
    };

    jambiInsta.prototype.checkInsta = function () {
        if(instaArray[instaString]) {
            return true;
        }
        else {
            return false;
        }
    };

    jambiInsta.prototype.instaStarted = function () {
        return instaStarted;
    };

    jambiInsta.prototype.init = function () {
        instaStarted = true;
        instaStart = jambi.getJambiEditor().getCursor();
    };

    jambiInsta.prototype.insert = function (insta) {
        try{
            instaEnd = jambi.getJambiEditor().getCursor();
            // remove old insta code
            instaStart.ch = instaStart.ch-1;

            jambi.getJambiEditor().setSelection(instaStart, instaEnd);

            // insert new snippet
    		var iString = jambifs.readHTML("instas/" + instaArray[instaString]);
            jambi.getJambiEditor().replaceSelection(iString);
            instaStarted = false;
        } catch(err) {

        }
    };

};

var jInsta = new jambiInsta();
jInsta.getInstas();