var Jambiac = function() {

    var $autoCompleteBox = $('#jambiAutoCompleteBox');
    var listArray = [];

    Jambiac.prototype.init = function () {
        console.log("initializing Auto Complete");
    };

    Jambiac.prototype.setMenuContext = function (context) {
        listArray = $.getJSON('public/modes/' + context + '.json', function(data, err){
            //console.log(data[0].items);
            listArray = data[0].items;
        });
    };

    Jambiac.prototype.addItem = function (context) {

    };

    Jambiac.prototype.getMenuItems = function () {

    };

    Jambiac.prototype.filterResults = function (letter) {
        if(listArray !== undefined){
            var filteredResults = [];
            var len = listArray.length;
            for (var i = 0; i < len; i++) {
            //    if (listArray[i].indexOf(letter) == 0) results.push(listArray[i]);
            }
            //console.dir(filteredResults);
        }
    };

    Jambiac.prototype.show = function () {
        var $acUL = $('#jambiAutoCompleteBox ul');
        $acUL.empty();
        //populate
        for(var i =0 ; i<listArray.length; i++){
            $acUL.append("document");
            //console.dir(listArray[i]);
        }

        setTimeout(function() {
            var cursor = $('.CodeMirror-cursor').offset();
            if(cursor) {
                $autoCompleteBox.css(cursor);
                $autoCompleteBox.css('display', 'block');
            }
        }, 100);

    };

    Jambiac.prototype.hide = function () {
        $autoCompleteBox.css('display', 'none');
    };

};


var jambiAC = new Jambiac();
jambiAC.init();