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
        Method:
        Purpose:
    */
    JambiTest.prototype.describe = function(label, tests){
        tests();
    };

    /*
        Method:
        Purpose:
    */
    JambiTest.prototype.should = function(label, test) {
        testCounter++;
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

    /*
        Method:
        Purpose:
    */
    JambiTest.prototype.pass = function(label) {
        that.printResults(label, true);
    };

    /*
        Method:
        Purpose:
    */
    JambiTest.prototype.fail = function(label) {
        that.printResults(label, false);
    };

    /*
        Method:
        Purpose:
    */
    JambiTest.prototype.printResults = function(label, passed) {
        var print;
        if(passed) {
            print = '<span class="test-should"> It Should ' + label + ' <i class="fa fa-check test-pass"></i></span><br>';
        } else {
            print = '<span class="test-should"> It Should' + label + ' <i class="fa fa-times test-fail"></i></span><br>';
        }
        htmlDoc.append(print);
    };

    /*
        Method:
        Purpose:
    */
    JambiTest.prototype.end = function (){
        setTimeout(function(){
            htmlDoc.append('<br><br> Ran ' + testCounter + ' tests with ' + errorCounter + ' errors.');
        }, 5000);
    };
};