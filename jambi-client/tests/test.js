$('#testResults').hide();
jSetup.jambiMenu.settings.settingsRunTests.click = function () {
    runTests();
}
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

        jTest.should("Check the file type and return codemirror fileMode html", function(done){
           if(jModel.checkFileTypes("html") === "htmlmixed") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode css", function(done){
           if(jModel.checkFileTypes("css") === "css") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode javascript", function(done){
           if(jModel.checkFileTypes("js") === "javascript") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode python", function(done){
           if(jModel.checkFileTypes("py") === "python") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode sass", function(done){
           if(jModel.checkFileTypes("sass") === "text/x-sass") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode scss", function(done){
           if(jModel.checkFileTypes("scss") === "text/x-scss") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode less", function(done){
           if(jModel.checkFileTypes("less") === "text/x-less") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode json", function(done){
           if(jModel.checkFileTypes("json") === "javascript") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode ruby", function(done){
           if(jModel.checkFileTypes("rb") === "ruby") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode coffee", function(done){
           if(jModel.checkFileTypes("coffee") === "text/x-coffeescript") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode haskell", function(done){
           if(jModel.checkFileTypes("hs") === "text/x-haskell") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode c", function(done){
           if(jModel.checkFileTypes("c") === "text/x-csrc") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode c++", function(done){
           if(jModel.checkFileTypes("cpp") === "text/x-c++src") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode java", function(done){
           if(jModel.checkFileTypes("java") === "text/x-java") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode c#", function(done){
           if(jModel.checkFileTypes("cs") === "text/x-csharp") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode objective C", function(done){
           if(jModel.checkFileTypes("m") === "text/x-objectivec") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode lua", function(done){
           if(jModel.checkFileTypes("lua") === "text/x-lua") {
               done();
           } else {
               done("error");
           }
        });

        jTest.should("Check the file type and return codemirror fileMode php", function(done){
           if(jModel.checkFileTypes("php") === "text/x-php") {
               done();
           } else {
               done("error");
           }
        });
    });

    jTest.describe("Jambi Menu Setup", function(){
        jTest.should("return the jambi setup model", function(done){
            if(jSetup) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the gui model", function(done){
            if(jSetup.gui) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the jambiMenu model", function(done){
            if(jSetup.jambiMenu) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the openRecentMenu model", function(done){
            if(jSetup.openRecentMenu) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App model", function(done){
            if(jSetup.gui.App) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App dataPath model", function(done){
            if(jSetup.gui.App.dataPath) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest model", function(done){
            if(jSetup.gui.App.manifest) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest dependencies model", function(done){
            if(jSetup.gui.App.manifest.dependencies) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest description model", function(done){
            if(jSetup.gui.App.manifest.description) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest main model", function(done){
            if(jSetup.gui.App.manifest.main === "editor.html") {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest maintainers model", function(done){
            if(jSetup.gui.App.manifest.maintainers) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest maintainers email model", function(done){
            if(jSetup.gui.App.manifest.maintainers[0].email) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest maintainers name model", function(done){
            if(jSetup.gui.App.manifest.maintainers[0].name) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest maintainers web model", function(done){
            if(jSetup.gui.App.manifest.maintainers[0].web) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest maintainers name model", function(done){
            if(jSetup.gui.App.manifest.name) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest maintainers version model", function(done){
            if(jSetup.gui.App.manifest.version) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest window model", function(done){
            if(jSetup.gui.App.manifest.window) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest window frame model", function(done){
            if(jSetup.gui.App.manifest.window.frame) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest window height model", function(done){
            if(jSetup.gui.App.manifest.window.height) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest window icon model", function(done){
            if(jSetup.gui.App.manifest.window.icon) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest window min-height model", function(done){
            if(jSetup.gui.App.manifest.window.min_height) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest window min width model", function(done){
            if(jSetup.gui.App.manifest.window.min_width) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest window position model", function(done){
            if(jSetup.gui.App.manifest.window.position) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest window title model", function(done){
            if(jSetup.gui.App.manifest.window.title) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest window toolbar model", function(done){
            if(jSetup.gui.App.manifest.window.toolbar) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the App manifest window width model", function(done){
            if(jSetup.gui.App.manifest.window.width) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the screen model", function(done){
            if(jSetup.gui.Screen) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the screen model", function(done){
            if(jSetup.gui.Screen) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the shell model", function(done){
            if(jSetup.gui.Shell) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the Shortcut model", function(done){
            if(jSetup.gui.Shortcut) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the tray model", function(done){
            if(jSetup.gui.Tray) {
                done();
            } else {
                done("error");
            }
        });

        jTest.should("return the window model", function(done){
            if(jSetup.gui.Window) {
                done();
            } else {
                done("error");
            }
        });






    });


    jTest.end();


    setTimeout(function(){
        $('#testResults').hide();
    }, 3000);
}

