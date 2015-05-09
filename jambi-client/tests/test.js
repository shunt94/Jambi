$('#testResults').hide();
// setup the menu test
jSetup.jambiMenu.settings.settingsRunTests.click = function () {
    runTests();
}
/*
    Method: runTests()
    Purpose: runs tests for Jambi
*/
function runTests() {
    // empty and show the test cases
    $('#testResults').empty();
    $('#testResults').show();
    // create new instance of the test class
    var jTest = new JambiTest($('#testResults'));

    // test ajax to server
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
    // test reading local files
    jTest.describe("Read in Local settings files", function(){
        // test getting settings file
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
        // test getting projects file
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

    // test jambi methods
    jTest.describe("Jambi Methods", function(){
        // getting the version
        jTest.should("Get the version", function(done){
            if(jambi.getVersion()) {
                done();
            } else {
                done("error");
            }
        });
        // get the font size of the editor
        jTest.should("Get the stored font size", function(done){
            if(jambi.getFontSize()) {
                done()
            } else {
                done("error");
            }
        });
        // get the editor
        jTest.should("Return the editor", function(done){
            if(jambi.getJambiEditor()) {
                done();
            }
            else {
                done("error");
            }
        });
        // show a notification of 'test'
        jTest.should("Show a notification", function(done){
            if(jambi.showNotification("test", "test")) {
                done();
            } else {
                done("error");
            }
        });
    });
    // test jambi model methods
    jTest.describe("Jambi Model Methods", function(){
        // create a new file
        jTest.should("Create a new file", function(done){
            if(jModel.newFile()) {
                done();
            } else {
                done("error");
            }
        });
        // get the active file
        jTest.should("Get active file", function(done) {
            setTimeout(function(){
                if(jModel.getActiveDocument()) {
                    done();
                } else {
                   done("error");
                }
            }, 1000);

        });
        // return is on editor page
        jTest.should("Returns if on editor page", function(done){
            setTimeout(function(){
                if(jModel.onEditorPage()) {
                    done();
                } else {
                    done("error");
                }
            }, 1000);
        });
        // check if html returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode html", function(done){
           if(jModel.checkFileTypes("html") === "htmlmixed") {
               done();
           } else {
               done("error");
           }
        });
        // check if css returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode css", function(done){
           if(jModel.checkFileTypes("css") === "css") {
               done();
           } else {
               done("error");
           }
        });
        // check if js returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode javascript", function(done){
           if(jModel.checkFileTypes("js") === "javascript") {
               done();
           } else {
               done("error");
           }
        });
        // check if python returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode python", function(done){
           if(jModel.checkFileTypes("py") === "python") {
               done();
           } else {
               done("error");
           }
        });
        // check if sass returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode sass", function(done){
           if(jModel.checkFileTypes("sass") === "text/x-sass") {
               done();
           } else {
               done("error");
           }
        });
        // check if scss returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode scss", function(done){
           if(jModel.checkFileTypes("scss") === "text/x-scss") {
               done();
           } else {
               done("error");
           }
        });
        // check if less returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode less", function(done){
           if(jModel.checkFileTypes("less") === "text/x-less") {
               done();
           } else {
               done("error");
           }
        });
        // check if json returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode json", function(done){
           if(jModel.checkFileTypes("json") === "javascript") {
               done();
           } else {
               done("error");
           }
        });
        // check if ruby returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode ruby", function(done){
           if(jModel.checkFileTypes("rb") === "ruby") {
               done();
           } else {
               done("error");
           }
        });
        // check if coffee returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode coffee", function(done){
           if(jModel.checkFileTypes("coffee") === "text/x-coffeescript") {
               done();
           } else {
               done("error");
           }
        });
        // check if haskell returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode haskell", function(done){
           if(jModel.checkFileTypes("hs") === "text/x-haskell") {
               done();
           } else {
               done("error");
           }
        });
        // check if c returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode c", function(done){
           if(jModel.checkFileTypes("c") === "text/x-csrc") {
               done();
           } else {
               done("error");
           }
        });
        // check if c++ returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode c++", function(done){
           if(jModel.checkFileTypes("cpp") === "text/x-c++src") {
               done();
           } else {
               done("error");
           }
        });
        // check if java returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode java", function(done){
           if(jModel.checkFileTypes("java") === "text/x-java") {
               done();
           } else {
               done("error");
           }
        });
        // check if c-sharp returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode c#", function(done){
           if(jModel.checkFileTypes("cs") === "text/x-csharp") {
               done();
           } else {
               done("error");
           }
        });
        // check if object-c returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode objective C", function(done){
           if(jModel.checkFileTypes("m") === "text/x-objectivec") {
               done();
           } else {
               done("error");
           }
        });
        // check if lua returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode lua", function(done){
           if(jModel.checkFileTypes("lua") === "text/x-lua") {
               done();
           } else {
               done("error");
           }
        });
        // check if php returns the correct codemirror type
        jTest.should("Check the file type and return codemirror fileMode php", function(done){
           if(jModel.checkFileTypes("php") === "text/x-php") {
               done();
           } else {
               done("error");
           }
        });
    });
    // check menu setup module
    jTest.describe("Jambi Menu Setup", function(){
        // see if module returns the model
        jTest.should("return the jambi setup model", function(done){
            if(jSetup) {
                done();
            } else {
                done("error");
            }
        });
        // see if gui is returned
        jTest.should("return the gui model", function(done){
            if(jSetup.gui) {
                done();
            } else {
                done("error");
            }
        });
        // see if menu is returned
        jTest.should("return the jambiMenu model", function(done){
            if(jSetup.jambiMenu) {
                done();
            } else {
                done("error");
            }
        });
        // see if recent menu is returned
        jTest.should("return the openRecentMenu model", function(done){
            if(jSetup.openRecentMenu) {
                done();
            } else {
                done("error");
            }
        });
        // see if gui app is returned
        jTest.should("return the App model", function(done){
            if(jSetup.gui.App) {
                done();
            } else {
                done("error");
            }
        });
        // see if data path model is returned
        jTest.should("return the App dataPath model", function(done){
            if(jSetup.gui.App.dataPath) {
                done();
            } else {
                done("error");
            }
        });
        // see if manifest if returned
        jTest.should("return the App manifest model", function(done){
            if(jSetup.gui.App.manifest) {
                done();
            } else {
                done("error");
            }
        });
        // see if deps are returned
        jTest.should("return the App manifest dependencies model", function(done){
            if(jSetup.gui.App.manifest.dependencies) {
                done();
            } else {
                done("error");
            }
        });
        // see if desc is returned
        jTest.should("return the App manifest description model", function(done){
            if(jSetup.gui.App.manifest.description) {
                done();
            } else {
                done("error");
            }
        });
        // see if main is returned
        jTest.should("return the App manifest main model", function(done){
            if(jSetup.gui.App.manifest.main === "editor.html") {
                done();
            } else {
                done("error");
            }
        });
        // see if maintainers are returned
        jTest.should("return the App manifest maintainers model", function(done){
            if(jSetup.gui.App.manifest.maintainers) {
                done();
            } else {
                done("error");
            }
        });
        // see if email is returned
        jTest.should("return the App manifest maintainers email model", function(done){
            if(jSetup.gui.App.manifest.maintainers[0].email) {
                done();
            } else {
                done("error");
            }
        });
        // see if name is returned
        jTest.should("return the App manifest maintainers name model", function(done){
            if(jSetup.gui.App.manifest.maintainers[0].name) {
                done();
            } else {
                done("error");
            }
        });
        // see if web model is returned
        jTest.should("return the App manifest maintainers web model", function(done){
            if(jSetup.gui.App.manifest.maintainers[0].web) {
                done();
            } else {
                done("error");
            }
        });
        // see if name is returned
        jTest.should("return the App manifest maintainers name model", function(done){
            if(jSetup.gui.App.manifest.name) {
                done();
            } else {
                done("error");
            }
        });
        // see if version is returned
        jTest.should("return the App manifest maintainers version model", function(done){
            if(jSetup.gui.App.manifest.version) {
                done();
            } else {
                done("error");
            }
        });
        // see if window is returned
        jTest.should("return the App manifest window model", function(done){
            if(jSetup.gui.App.manifest.window) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the App manifest window frame model", function(done){
            if(jSetup.gui.App.manifest.window.frame) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the App manifest window height model", function(done){
            if(jSetup.gui.App.manifest.window.height) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the App manifest window icon model", function(done){
            if(jSetup.gui.App.manifest.window.icon) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the App manifest window min-height model", function(done){
            if(jSetup.gui.App.manifest.window.min_height) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the App manifest window min width model", function(done){
            if(jSetup.gui.App.manifest.window.min_width) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the App manifest window position model", function(done){
            if(jSetup.gui.App.manifest.window.position) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the App manifest window title model", function(done){
            if(jSetup.gui.App.manifest.window.title) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the App manifest window toolbar model", function(done){
            if(jSetup.gui.App.manifest.window.toolbar) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the App manifest window width model", function(done){
            if(jSetup.gui.App.manifest.window.width) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the screen model", function(done){
            if(jSetup.gui.Screen) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the screen model", function(done){
            if(jSetup.gui.Screen) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the shell model", function(done){
            if(jSetup.gui.Shell) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the Shortcut model", function(done){
            if(jSetup.gui.Shortcut) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the tray model", function(done){
            if(jSetup.gui.Tray) {
                done();
            } else {
                done("error");
            }
        });
        // ... see 'should' method for what this does
        jTest.should("return the window model", function(done){
            if(jSetup.gui.Window) {
                done();
            } else {
                done("error");
            }
        });
    });

    // end the tests
    jTest.end();

    // hide results after 5 seconds
    setTimeout(function(){
        $('#testResults').hide();
    }, 5000);
}

