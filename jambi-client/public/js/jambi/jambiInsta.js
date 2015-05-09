/*
    Class: jambiInsta
    Purpose: to control the Instas of Jambi
*/
var jambiInsta = function () {

    // init local variables
    var instaArray = {};
    var instaStarted = false;
    var instaStart;
    var instaEnd;
    var instaString = "";
    var counter = 0;
    var fs = require('fs');


    /*
        Method: getInstas
        Purpose: fetch the list of instas from instas.json
    */
    jambiInsta.prototype.getInstas = function () {
        // get instas from json file
        jambifs.readJSON('instas/instas.json', function(err, data){
            instaArray = data;
        });
    };

    /*
        Method: addNew
        Purpose: adds a new insta to instas.json
    */
    jambiInsta.prototype.addNew = function(name, code) {
        // function to generate the random file name using date and random string
        function generateRandomString(length, chars) {
            var result = '';
            // generate random string
            for (var i = length; i > 0; --i) {
                result += chars[Math.round(Math.random() * (chars.length - 1))];
            }
            return result;
        }
        // create filename
        var filename = generateRandomString(8, '0123456789abcdefghijklmnopqrstuvwxyz');
        // append date and .html to filename
        var dateSeconds = new Date();
        filename += dateSeconds.getTime() + ".html";

        // append to array
        instaArray[name] = 'instas/' + filename;

        // write the file
        fs.writeFile('instas/instas/' + filename, code.toString(), function (err) {
            if (err) {
                jambi.showNotification('Jambi Intas', 'Error - Could not make new insta');
            } else {
                jambi.showNotification('Jambi Intas', 'Successfully made new insta');
            }
        });
        // write insta to instas.json
        jambifs.writeJSON('instas/instas.json', JSON.stringify(instaArray));
    };

    /*
        Method: getInstaValues
        Purpose: return the key objects of the insta array
    */
    jambiInsta.prototype.getInstaValues = function () {
        return Object.keys(instaArray);
    };

    /*
        Method: getString
        Purpose: get the built string
    */
    jambiInsta.prototype.getString = function () {
        return instaString;
    };

    /*
        Method: addCharacter
        Purpose: adds a character to the built insta string
    */
    jambiInsta.prototype.addCharacter = function (character) {
        instaString += character;
    };

    /*
        Method: removeCharacter
        Purpose: removes a character from the insta string
    */
    jambiInsta.prototype.removeCharacter = function () {
        instaString.slice(0, -1);
    };

    /*
        Method: destroyString
        Purpose: removes all characters from built string
    */
    jambiInsta.prototype.destoryString = function () {
        instaString = "";
    };

    /*
        Method: checkInsta
        Purpose: checks if Insta string is in the array of instas
    */
    jambiInsta.prototype.checkInsta = function () {
        if(instaArray[instaString]) {
            return true;
        }
        else {
            return false;
        }
    };

    /*
        Method: instaStarted
        Purpose: checks if insta has been initialised
    */
    jambiInsta.prototype.instaStarted = function () {
        return instaStarted;
    };

    /*
        Method: init
        Purpose: initialise the insta string
    */
    jambiInsta.prototype.init = function () {
        instaStarted = true;
        instaStart = jambi.getJambiEditor().getCursor();
    };

    /*
        Method: insert
        Purpose: insert insta at cursor
    */
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

// new instance of insta class
var jInsta = new jambiInsta();
// fetch instas
jInsta.getInstas();