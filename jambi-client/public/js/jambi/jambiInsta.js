var jambiInsta = function () {

    var instaArray = {};
    var instaStarted = false;
    var instaStart;
    var instaEnd;
    var instaString = "";

    jambiInsta.prototype.getInstas = function () {
        // get instas from json file
        jambifs.readJSON('instas/instas.json', function(err, data){
            instaArray = data;
        });
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

    jambiInsta.prototype.addInsta = function (instaName, instaCode) {
        // add insta to json

        // fetch new list
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
            //var iString = instaArray[instaString]
    		var iString = jambifs.readHTML("instas/" + instaArray[instaString]);
            jambi.getJambiEditor().replaceSelection(iString);
            instaStarted = false;
        } catch(err) {

        }
    };

};

var jInsta = new jambiInsta();
jInsta.getInstas();