var assert = require("assert");
var jsdom = require('mocha-jsdom');
var fs = require('fs');

  

describe('TestLabel1', function(){
	it('Should pass', function(done) {
		done();
	});
	
	it('should fail', function(done) {
		done();
	});
});


// describe('Server Tests', function() {
//     describe('GET jambi.herokuapp.com/api', function() {        
//         it('Should get a list get a list of API', function(done){
//              jQuery.ajax({
//                 type: 'GET',
//                 url: "http://jambi.herokuapp.com/api",
//                 async: true,
//                 contentType: "application/json",
//                 dataType: 'json',
//                 success: function(data) {
//                     if(data) done();
//                 },
//                 error: function(e) {
//                     if(e) !done();
//                 }
//             });

//         });
//     });
    
// });