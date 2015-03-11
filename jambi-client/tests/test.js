//$('#testResults').hide();
jSetup.jambiMenu.settings.settingsRunTests.click = function () {
    runTests();
}
setTimeout(function(){
    runTests();
}, 1000);

function runTests() {
    $('#testResults').empty();
    $('#testResults').show();
    var jTest = new JambiTest($('#testResults'));

    jTest.describe("AJAX To Server", function() {
        jTest.should("GET data from api", function(done){
            $.ajax({
                type: 'GET',
                url: "http://jambi.herokuapp.com/api",
                async: true,
                contentType: "application/json",
                dataType: 'json',
                success: function(data) {
                    if(data) {
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



    jTest.describe("Read in Local settings files", function(){
        jTest.should("Get settings file jambi.json", function(done){
            jambifs.readJSON('jambi.json', function(err, data) {
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


    jTest.describe("Jambi Methods", function(){
        jTest.should("Get the version", function(done){
            if(jambi.getVersion()) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("Get the stored font size", function(done){
            if(jambi.getFontSize()) {
                done()
            } else {
                done("error");
            }
        });

        jTest.should("Return the editor", function(done){
            if(jambi.getJambiEditor()) {
                done();
            }
            else {
                done("error");
            }
        });

        jTest.should("Show a notification", function(done){
            if(jambi.showNotification("test", "test")) {
                done();
            } else {
                done("error");
            }
        });
    });

    jTest.describe("Jambi Model Methods", function(){

        jTest.should("Create a new file", function(done){
            if(jModel.newFile()) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("Get active file", function(done) {
            setTimeout(function(){
                if(jModel.getActiveDocument()) {
                    done();
                } else {
                   done("error");
                }
            }, 1000);

        });

        jTest.should("Returns if on editor page", function(done){
            setTimeout(function(){
                if(jModel.onEditorPage()) {
                    done();
                } else {
                    done("error");
                }
            }, 1000);
        });

        jTest.should("Checks the file type and returns codemirror fileMode html", function(done){
           if(jModel.checkFileTypes("html") === "htmlmixed") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Checks the file type and returns codemirror fileMode css", function(done){
           if(jModel.checkFileTypes("css") === "css") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Checks the file type and returns codemirror fileMode javascript", function(done){
           if(jModel.checkFileTypes("js") === "javascript") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Checks the file type and returns codemirror fileMode python", function(done){
           if(jModel.checkFileTypes("py") === "python") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Checks the file type and returns codemirror fileMode sass", function(done){
           if(jModel.checkFileTypes("sass") === "text/x-sass") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Checks the file type and returns codemirror fileMode scss", function(done){
           if(jModel.checkFileTypes("scss") === "text/x-scss") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Checks the file type and returns codemirror fileMode less", function(done){
           if(jModel.checkFileTypes("less") === "text/x-less") {
               done();
           } else {
               done("error");
           }
        });


    });


    jTest.end();


    setTimeout(function(){
      //  $('#testResults').hide();
    }, 3000);
}

