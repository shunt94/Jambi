var JambiTest = function (htmlDoc) {
    var that = this;
    var fs = require('fs');
    var output;
    var errorCounter = 0;
    var results = [];

    JambiTest.prototype.describe = function(label, tests){
        output = "";
        output = "<br>" + label + "<br>";
        tests();
        //htmlDoc.append(output);
    };

    JambiTest.prototype.should = function(label, test) {
        var done = function(err) {
            if (err) {
                that.fail(label);
                errorCounter++;
            }
            else {
                that.pass(label);
            }
        };

        test(done);

    };

    JambiTest.prototype.pass = function(label) {
        that.printResults(label, true);
    };

    JambiTest.prototype.fail = function(label) {
        that.printResults(label, false);
    };

    JambiTest.prototype.printResults = function(label, passed) {
        var print;
        if(passed) {
            print = '<span class="test-should"> It Should ' + label + ' <i class="fa fa-check test-pass"></i></span><br>';
        } else {
            print = '<span class="test-should"> It Should' + label + ' <i class="fa fa-times test-fail"></i></span><br>';
        }
        htmlDoc.append(print);
    };

};