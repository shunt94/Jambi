$('#testResults').hide();
jSetup.jambiMenu.settings.settingsRunTests.click = function () {
    runTests();
}
function runTests() {
    $('#testResults').show();
    var jTest = new JambiTest($('#testResults'));

    jTest.describe("AJAX To Server", function(callback) {
        jTest.should("GET data from api", function(done){
            $.ajax({
                type: 'GET',
                url: "http://jambi.herokuapp.com/api",
                async: true,
                contentType: "application/json",
                dataType: 'json',
                success: function(data) {
                    if(data) {
                        callback();
                        done();

                    }
                    else {
                        done("error");
                    }
                },
                error: function(e) {
                    done(e);
                }
            });
        });
    });



    jTest.describe("Read in Local settings files", function(callback){
        jTest.should("Get settings file jambi.json", function(done){
            jambifs.readJSON('jambi.json', function(err, data) {
                if(err) {
                    done(err);
                }
                else {
                    if(data) {
                        callback();
                        done();
                    } else {
                        done("error");
                    }
                }
            });
        });

        jTest.should("Get projects file projects.json", function(done){
            jambifs.readJSON('projects.json', function(err, data) {
                if(err) {
                    done(err);
                }
                else {
                    if(data) {
                        done();
                    } else {
                        done("error");
                    }
                }
            });
        });
    });

    setTimeout(function(){
        $('#testResults').hide();
    }, 3000);
}


