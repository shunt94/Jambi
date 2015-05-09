/*
    Class: jambiTest
    Purpose: testing framework for Jambi
*/
var JambiTest = function (htmlDoc) {
    var that = this;
    var fs = require('fs');
    var errorCounter = 0;
    var testCounter = 0;
    var results = [];

    /*
        Method: describe
        Purpose: run the describe tests
    */
    JambiTest.prototype.describe = function(label, tests){
        tests();
    };

    /*
        Method: should
        Purpose: run the should tests
    */
    JambiTest.prototype.should = function(label, test) {
        // increment the test counter
        testCounter++;
        // send the done function as a parameter to the test
        var done = function(err) {
            if (err) {
                that.fail(label);
                errorCounter++;
            }
            else {
                that.pass(label);
            }
        };
        // run the test with the done function
        test(done);
    };

    /*
        Method: pass
        Purpose: print results that passed the test
    */
    JambiTest.prototype.pass = function(label) {
        that.printResults(label, true);
    };

    /*
        Method: fail
        Purpose: print the results that failed
    */
    JambiTest.prototype.fail = function(label) {
        that.printResults(label, false);
    };

    /*
        Method: printResults
        Purpose: print results
    */
    JambiTest.prototype.printResults = function(label, passed) {
        var print;
        // if passed print a tick, else print a cross
        if(passed) {
            print = '<span class="test-should"> It Should ' + label + ' <i class="fa fa-check test-pass"></i></span><br>';
        } else {
            print = '<span class="test-should"> It Should' + label + ' <i class="fa fa-times test-fail"></i></span><br>';
        }

        // append test
        htmlDoc.append(print);
    };

    /*
        Method: end
        Purpose: append the tests and the end
    */
    JambiTest.prototype.end = function (){
        setTimeout(function(){
            htmlDoc.append('<br><br> Ran ' + testCounter + ' tests with ' + errorCounter + ' errors.');
        }, 5000);
    };
};