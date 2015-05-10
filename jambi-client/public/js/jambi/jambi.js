// setup the menu object - to add event listeners later
var jSetup = new jambiSetup();

/*
    Class: Jambi
    Purpose: All primary features are implemented here, the variable is then exported for use across Jambi
*/
var Jambi = function () {

    // Imports and variable declarations

    // Node File System
    var fs = require('fs');
    // Child process - for executing terminal commands
    var terminal = require('child_process');
    // shell as a different implementation from terminal commands
    var shell = require('shelljs');
    // Define the editor object
    var jambiEditor;
    // Define the editor configuration
    var jambiEditorConfig;
    var currentFileDir;
    // Current Version of Jambi
    var version;
    var widgets = [];
    var areFilesUnsaved = false;

    // Define the editor font size - default to 14px
    var editorFontSize = 14;

    var gui = require('nw.gui');


    // Read in the Jambi settings
    readJambiSettings();

    try{
        shell.exec("flow start", function(code, output) {});
    } catch(er) {

    }
    /*
        Method: readJambiSettings
        Purpose: Reads the settings file jambi.json that stores all user settings
    */
    function readJambiSettings() {
        // Call the jambi file system function to read in the json
        jambifs.readJSON('jambi.json', function(err, data) {
            // if there was an error reading the file, alert the user and set the default version to 1.0
            if(err) {
                alert("Failed to read Jambi settings");
                version = "1.0";
            }
            else {
                // else set the version to the user settings file - this gets updated/ checked with Jambi Servers
                version = data.version;
                // Set the editor font size and update inline CSS to override all other CSS
                editorFontSize = data.editor_settings.fontsize;
                $('#instyled').append(".CodeMirror { font-size:" + editorFontSize + "px; }");
            }
        });
    }

    /*
        Method: menuSetup
		Purpose: Function used to setup all of the menu bar - Action listeners and populators
	*/
    Jambi.prototype.menuSetup = function () {
        var jMenu = jSetup.jambiMenu;

        jMenu.file.fileSave.click = function () {
            jambi.saveFile();
        };
        jMenu.file.fileSaveAs.click = function () {
            jambi.saveFileAs();
        };
        jMenu.file.fileOpen.click = function () {
            jambi.openFile();
        };
        jMenu.file.fileNewSubmenu[0].value.click = function () {
            jambi.newFile();
        };
        jMenu.file.fileClose.click = function () {
            jambi.closeCurrentFile();
        };
        jMenu.file.fileCloseAll.click = function () {
            jambi.closeAllFiles();
        };

        jMenu.view.viewProjects.click = function () {
            // Change the view to the projects page
            window.location.replace("#/project");
        };

        jMenu.view.viewEditor.click = function () {
            // Change the view to the editor page
            window.location.replace("#/home");
        };

        jMenu.view.viewShowcase.click = function () {
            // Change the view to the showcase page
            window.location.replace("#/showcase");
        };

        jMenu.tools.toolsFlowFlowCode.click = function () {
            // Check active document is a javascript file
            if(jModel.getActiveDocument().mode === "javascript" && jModel.getActiveProject()) {
                // Initialise flow
                jambi.initFlow(jModel.getActiveProject().root);
                // Flow the code
                jambi.flowCode(jModel.getActiveDocument().fileLocation, jModel.getActiveDocument().title);
            }
        };

        jMenu.tools.toolsLess.click = function () {
            if(jModel.getActiveDocument()) {
                var file = jModel.getActiveDocument();
                // Get the file name
                var fileNameWithoutType = file.title.substr(0, file.title.lastIndexOf('.'));
                // call the less compile
                jambi.compileLess(file.fileLocation + "/" + fileNameWithoutType + ".css");
            }
        };

        jMenu.tools.toolsBeautifyJS.click = function () {
            var activeDoc = jModel.getActiveDocument();
            if(activeDoc.mode === "javascript") {
                // Import the beautify module
                var beautify = require('js-beautify').js_beautify;
                // Beautify the code and set the value of the editor to the output
                var code = beautify(jambi.getJambiEditor().getValue(), { indent_size: jambi.getJambiEditor().tabSize });
                jambi.getJambiEditor().setValue(code);
            }
        };

        jMenu.tools.toolsCompileJava.click = function () {
            jambi.compieleJava();
        };

        jMenu.tools.toolsBeautifyCSS.click = function () {
            var activeDoc = jModel.getActiveDocument();
            if(activeDoc.mode === "css") {
                // Import the beautify module
                var beautify = require('js-beautify').css;
                // Beautify the code and set the value of the editor to the output
                var code = beautify(jambi.getJambiEditor().getValue(), { indent_size: jambi.getJambiEditor().tabSize });
                jambi.getJambiEditor().setValue(code);
            }
        };

        jMenu.tools.toolsBeautifyHTML.click = function () {
            var activeDoc = jModel.getActiveDocument();
            if(activeDoc.mode === "htmlmixed") {
                // Import the beautify module
                var beautify = require('js-beautify').html;
                // Beautify the code and set the value of the editor to the output
                var code = beautify(jambi.getJambiEditor().getValue(), { indent_size: jambi.getJambiEditor().tabSize });
                jambi.getJambiEditor().setValue(code);
            }
        };

        jMenu.tools.toolsJambiTemplate.click = function () {
            // Call the template engine with the value of the editor
            jambi.jambiTemplate(jambiEditor.getValue());
        };

        jMenu.tools.toolsSSHConnect.click = function () {
            // if there is an active project and ssh is enabled, show the file browser
            var activeProject = jModel.getActiveProject();
            if(activeProject) {
                if(activeProject.ssh.enabled) {
                    jModel.showSSHFiles();
                }
            }
        };

        jMenu.tools.toolsSSHConnect.enabled = false;


        jMenu.tools.toolsStartServer.click = function () {
            // Import the terminal command prompt
            var spawn = require('child_process').spawn;
            if(jModel.getActiveProject()) {
                // Execute the python simple server command
                var child = shell.exec('cd ' + jModel.getActiveProject().root + '&& python -m SimpleHTTPServer', function(code, output) {
                    jSetup.gui.Shell.openExternal("http://localhost:8000");
                });
                setTimeout(function () {
                    child.kill();
                }, 10000);
            }
        };


        jMenu.instas.instasMenu.click = function () {
            // Get all Instas from the Jambi Insta module
            var content = jInsta.getInstaValues();
            var modalContent = "";
            // List out all of the insta variables
            for(var i = 0; i < content.length; i++) {
                modalContent += '$' +  content[i] + '<br>'
            };
            var modalFunction = function () {
                 jMenu.instas.instasNew.click();
            };
            // Spawn a new modal with the insta content
            jambi.createModal("Instas", "List of Instas", modalContent, "Add", modalFunction);
        };

        jMenu.instas.instasNew.click = function () {
            var editor;
            // setup the modal to add a new insta
            function modalFunction() {
                jInsta.addNew($('#instaKeys').val(), editor.getValue());
            }

            var modalContent;
            // get the instas menu from a file
             $.ajax({
                 dataType : "html",
                 url : "public/views/modal/insta.html",
                 success : function(results) {
                    // Create the modal with
                    modalContent = results;
                    jambi.createModal("Create New Insta", "", modalContent, "Add", modalFunction);

                    // Create a new CodeMirror instance for the insta editor
                    editor = CodeMirror(document.getElementById('instaCode'), {
                        mode:  "htmlmixed",
                        lineNumbers: true
                    });
                 }
            });
        };


        // Themes
        jMenu.settings.settingsTheme.click = function () {
            function modalFunction() {

            }
            var modalContent;
            // Get the theme html modal content from a file
            $.ajax({
                dataType : "html",
                url : "public/views/modal/theme.html",
                success : function(results) {
                    modalContent = results;

                    // spawn the modal
                    jambi.createModal("Select Theme", "", modalContent, "Ok", modalFunction);
                }
            });
        };

        jMenu.settings.settingsClearSettings.click = function () {
            function modalFunction() {
                storedb('userSettings').remove();
            }
            jambi.createModal("Remove user settings",
                              "Are you sure you want to remove user settings?",
                              "This will delete all custom settings you may have made",
                              "Remove Settings",
                              modalFunction);
        };

        // check when the user closes the application for any open files
        jSetup.gui.Window.get().on('close', function () {
            try{
                shell.exec("flow stop", function(code, output) {});
            } catch(er) {

            }

            var that = this;
            //jambi.createModal("Are you sure you want to quit", "You have unsaved files", "Unsaved files", "Quit", function(){that.close(true);});
            //jambi.openModal();
            //return false;
            that.close(true);
        });
    };

    /*
        Method: getVersion
        Purpose: returns the version number of Jambi
    */
    Jambi.prototype.getVersion = function () {
        return version;
    };

    /*
        Method: getFontSize
        Purpose: returns the font size of the Jambi editor
    */
    Jambi.prototype.getFontSize = function () {
        return editorFontSize;
    };

    /*
        Method: getJambiEditor
        Purpose: returns the editor
    */
    Jambi.prototype.getJambiEditor = function () {
        return jambiEditor;
    };

    /*
        Method: initCodeMirror
        Purpose: Initialise the code mirror instance
    */
    Jambi.prototype.initCodeMirror = function () {
        // User Settings
        var codeMirrortheme = "ambiance";

        // Find user settings using storeDB
        storedb('userSettings').find({ "setting": "theme" }, function (err, result) {
            try{
                if (err) {
                    jambi.showNotification("Jambi", "Could not find theme");
                } else if (result[0] !== null || result[0] !== undefined) {
                    codeMirrortheme = result[0].setTo;
                    //console.log(result);
                }
            } catch(e) {

            }

            $("#themeselector option").filter(function () {
                return $(this).text() == codeMirrortheme;
            }).prop('selected', true);
        });


        // Create code mirror
        var mixedMode = {
            name: "htmlmixed"
        };

        // Function to use spaces/ tabs
        function betterTab(cm) {
            if (cm.somethingSelected()) {
                cm.indentSelection("add");
            } else {
                cm.replaceSelection(cm.getOption("indentWithTabs")? "\t":
                Array(cm.getOption("indentUnit") + 1).join(" "), "end", "+input");
            }
        }


      function completeAfter(cm, pred) {
        var cur = cm.getCursor();
        if (!pred || pred()) setTimeout(function() {
          if (!cm.state.completionActive)
            cm.showHint({completeSingle: false});
        }, 100);
        return CodeMirror.Pass;
      }

      function completeIfAfterLt(cm) {
        return completeAfter(cm, function() {
          var cur = cm.getCursor();
          return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
        });
      }

      function completeIfInTag(cm) {
        return completeAfter(cm, function() {
          var tok = cm.getTokenAt(cm.getCursor());
          if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
          var inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
          return inner.tagName;
        });
      }


        var foldLine = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);

        // Set up the main editor configuration
        jambiEditorConfig = {
            mode: mixedMode,
            theme: codeMirrortheme,
            lineWrapping: true,
            lineNumbers: true,
            tabSize: 4,
            gutters: ["test1", "test2"],
            indentUnit: 4,
            indentWithTabs: true,
            autoCloseTags: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            matchTags: true,
            foldGutter: true,
            highlightSelectionMatches: true,
            styleActiveLine: true,
            extraKeys: {
                Tab: betterTab,
                "Ctrl-Space": "autocomplete",
                "'<'": completeAfter,
                "'/'": completeIfAfterLt,
                "' '": completeIfInTag,
                "'='": completeIfInTag
            },
            profile: 'xhtml'
        };


        // Render Editor
        jambi.renderEditor();

        // Set listeners
        jambi.setListeners();
    };

    /*
        Method: updateCursorPosition
        Purpose: updates the cursor position text situated at the bottom of the editor
    */
    Jambi.prototype.updateCursorPosition = function () {
        var cursorPos = jambiEditor.getCursor();
        $('#jambiLine').text(cursorPos.line + 1);
        $('#jambiColumn').text(cursorPos.ch + 1);
    };

    /*
        Method: setListeners
        Purpose: set all the global action listeners of Jambi
    */
    Jambi.prototype.setListeners = function () {
        // Changed the theme of the editor
        $('#themeselector').on('change', function () {
            var theme = $('#themeselector option:selected').text();
            jambiEditor.setOption("theme", theme);

            // remove the old settings
            storedb('userSettings').remove({
                "setting": "theme"
            }, function (err) {});

            // store the new settings
            storedb('userSettings').insert({
                "setting": "theme",
                "setTo": theme
            }, function (err, result) {
                if (err) {
                    jambi.showNotification("Jambi", "User settings could not be saved.. " + err);
                } else {
                    jambi.showNotification("Jambi", "User settings saved");
                }
            });

        });

        // Activates the JSHint-ing button on Javascript mode
        $('#modeSelector').on('change', function () {
            var mode = $("#modeSelector option:selected").attr('data-mode');
            jambiEditor.setOption("mode", mode);
        });
    };

	/*
        Method: renderEditor
        Purpose: Renders the same editor when the editor view is called - Used when the editor view is called and when the initial editor is made
    */
	var instaStarted = false;
    Jambi.prototype.renderEditor = function () {

        // Create the CodeMirror instance
        jambiEditor = CodeMirror(document.getElementById('jambi-editor'), jambiEditorConfig);
        // focus the editor
        jambiEditor.focus();


        // remove all the action listeners, ready for new listeners, avoids double functions be called
        jambiEditor.off("cursorActivity");
        jambiEditor.off("change");
        jambiEditor.off("keyup");
        jambiEditor.off("gutterClick");

        // update the cursor position when the user clicks somewhere on the document
        jambiEditor.on("cursorActivity", function(e) {
            jambi.updateCursorPosition();
        });

        // Setup the fold line function
        var foldLine = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
        // on gutter click, fold the line
        jambiEditor.on("gutterClick", foldLine);

        var timeout;


        /*
            Function: generateJambiContextMenus
            Purpose: Setup the context menu when a user right clicks on the editor
        */
        function generateJambiContextMenus() {


            /*
                Method: doesFileExist
                Purpose: checks if a file or folder exists, returns true if so
            */
            function doesFileExist (tempfileLoc) {
                try { fs.statSync(tempfileLoc); return true }
                catch (er) { return false }
            }


            // create the new menu
            var code_menu = new gui.Menu();

            // append the items to the menu
            code_menu.append(new gui.MenuItem({ label: 'Cut' }));
            code_menu.append(new gui.MenuItem({ label: 'Copy' }));
            code_menu.append(new gui.MenuItem({ label: 'Paste' }));
            code_menu.append(new gui.MenuItem({ type: 'separator' }));
            code_menu.append(new gui.MenuItem({ label: 'Colour chooser..' }));
            code_menu.append(new gui.MenuItem({ type: 'separator' }));
            code_menu.append(new gui.MenuItem({ label: 'Goto this file' }));
            code_menu.append(new gui.MenuItem({ label: 'Open file in folder' }));

            // Cut click function
            code_menu.items[0].click = function(){
                 document.execCommand("cut");
            };

            // Copy click function
            code_menu.items[1].click = function(){
                 document.execCommand("copy");
            };

            // Paste click function
            code_menu.items[2].click = function(){
                 document.execCommand("paste");
            };

            // colour chooser function
            code_menu.items[4].click = function(){
                jambi.colourChooser();
            };

            // goto file click function
            code_menu.items[6].click = function(e) {
                // Get the current code selection of the cursor
                var selection = jambi.getJambiEditor().getSelection();
                // Get the active document
                var activeDoc = jModel.getActiveDocument();
                if(activeDoc) {
                    if(activeDoc.fileLocation) {
                        // Match the selection to a file location
                        if(selection.match(/((\/)?)(\w)*(\/)(\w)*(.)(\w)*/) || selection.match(/(\w)*(-)?(\w)*(\.)(\w{1,4})/)) {
                            var filename = selection.substr(selection.lastIndexOf("/")+1, selection.length);
                            var fileLoc = jModel.getActiveDocument().fileLocation + selection.substr(0, selection.lastIndexOf("/"));
                            var filetype = jModel.checkFileTypes(filename.substr(filename.lastIndexOf(".")+1, filename.length));
                            var contents = "";
                            // check that the file exists
                            if(doesFileExist(fileLoc + "/" + filename)) {
                                contents = jambi.openFileByDir(fileLoc + "/" + filename);
                            }
                            // Open the file
                            jModel.openFile(filename, contents, filetype, fileLoc + "/");
                        }
                    } else {
                        // File is not saved to alert the user
                        alert("Save current file first");
                        jambi.saveFile();
                    }
                } else {
                    var filename = selection.substr(selection.lastIndexOf("/")+1, selection.length);
                    var filetype = jModel.checkFileTypes(filename.substr(filename.lastIndexOf(".")+1, filename.length));
                    jModel.openFile(filename, "", filetype);
                }
            };

            // Click function for the 'open file in folder'
            code_menu.items[7].click = function(e) {
                // get active document
                var activeDoc = jModel.getActiveDocument();
                if(activeDoc)
                if(activeDoc.fileLocation) {
                    var command = "cd " + activeDoc.fileLocation + " && open .";
                    shell.exec(command, function(code, output) {

                    });
                }
            };

            // remove event listener
            $('#jambi-body').off("contextmenu");
            // re add event listener
            $('#jambi-body').on("contextmenu", '.editor-container' ,function(e){
               code_menu.popup(e.pageX, e.pageY);
               return false;
            });

        }

        // generate the context menu
        generateJambiContextMenus();


        // Insta setup
        var instaReady = false;

        // Map key codes of popular keys, used for instas
        var popupKeyCodes = {
            "9": "tab",
            "13": "enter",
            "27": "escape",
            "33": "pageup",
            "32": "space",
            "8": "backspace",
            "34": "pagedown",
            "35": "end",
            "36": "home",
            "38": "up",
            "40": "down",
            "16": "shift",
            "91": "leftwindow",
            "93": "rightwindow",
            "18": "alt",
            "17": "ctrl",
            "16": "shift",
            "20": "caps"
        };


        // Function used to check if an insta has been entered
        function checkInstas(code, keyevent) {
            if(instaReady && code === 13) {
                jInsta.insert(jInsta.getString());
                instaReady = false;
            }

            if(!!popupKeyCodes[(keyevent.keyCode || keyevent.which).toString()]) {
                jInsta.destoryString();
            }

            if(jInsta.instaStarted() && code && !popupKeyCodes[(keyevent.keyCode || keyevent.which).toString()]) {
                jInsta.addCharacter(String.fromCharCode(code).toLowerCase());
                if(jInsta.checkInsta()) {
                    instaReady = true;
                }
            }

            // if $ detected then start the insta function
            if(code === 52 && keyevent.shiftKey) {
                jInsta.destoryString();
                jInsta.init();
            }

            if(code === 8) {
                jInsta.removeCharacter();
            }

        }

        // delay functions that only execute if the user stops typing
        var delay = (function(){
          var timer = 0;
          return function(callback, ms){
                clearTimeout (timer);
                timer = setTimeout(callback, ms);
            };
        })();

         var delay2 = (function(){
          var timer = 0;
          return function(callback, ms){
                clearTimeout (timer);
                timer = setTimeout(callback, ms);
            };
        })();

        // Set the functions that execute when the document changes
        jambiEditor.on("change", function(keyevent) {
            jambi.updateCursorPosition();
                var currentActiveDoc = jModel.getActiveDocument();
                var currentActiveProject = jModel.getActiveProject();
                if(currentActiveDoc && currentActiveProject) {
                    if(currentActiveDoc.isSaved) {
                        if(currentActiveDoc.mode === "javascript") {
                             delay2(function(){
                                setTimeout(function(){
                                    jambi.findVariables();
                                }, 100);
                            }, 700);
                        }

                        if(currentActiveProject.flowInitialised && currentActiveDoc.mode === "javascript") {
                           delay(function(){
                                setTimeout(function(){
                                    jambi.flowCode(currentActiveDoc.fileLocation, currentActiveDoc.title);
                                }, 100);
                            }, 700);
                        }
                    }
                }
        });

        // Check instas on keydown
        jambiEditor.on("keydown", function(editor, keyevent) {
            // if insta has been init then build string
            checkInstas(keyevent.keyCode, keyevent);
        });


    };

    /*
        Method: insertAtCursor
        Purpose: Method used to insert a string of text at the cursor position
    */
    Jambi.prototype.insertAtCursor = function (text) {
        jambi.getJambiEditor().replaceSelection(text);
        jambi.getJambiEditor().focus();
    }

    /*
        Method: colourChooser
        Purpose: brings up a modal with the HTML5 colour chooser, it will then insert that hex colour at the cursor
    */
    Jambi.prototype.colourChooser = function () {
        function modalFunction() {
            // Get the colour
            var colour = $('#colourChooserColour').val();
            // insert hex colour at cursor
            jambi.insertAtCursor(colour);
        }

        // Get web pages to render the modal
        $.ajax({
            dataType : "html",
            url : "public/views/modal/colour.html",
            success : function(results) {
                modalContent = results;

                // spawn the modal
                jambi.createModal("Colour Chooser",
                                    "",
                                    modalContent,
                                    "Ok",
                                    modalFunction);
            }
        });



    };


	/*
        Method: jsHint
        Purpose: Handler for the JSHint function for the Javascript mode in the editor
    */
    Jambi.prototype.jsHint = function () {
        function updateHints() {
                // Clear the gutter of all messages
                jambiEditor.clearGutter("test2");
                //JSHINT the text editors value
                JSHINT(jambiEditor.getValue());
                $('#jsErrors').empty();

                // Print off the errors
                for (var x = 0; x < JSHINT.errors.length; ++x) {
                    var err = JSHINT.errors[x];
                    if (!err) continue;


                    var gutterLine = parseInt(err.line-1);

                    // Add a widget at the gutter line
                    jambiEditor.setGutterMarker(gutterLine, "test2", makeMarker(err.reason));

                    function makeMarker(error) {
                        var marker = document.createElement("div");
                        marker.className = "test3";
                        marker.setAttribute('data-error', error);
                        marker.style.color = "#ff0000";
                        marker.innerHTML = '<i class="fa fa-exclamation-circle"></i>';
                        return marker;
                    }

                    // refresh the editor
                    jambiEditor.refresh();
                    // append the JS errors
                    $('#jsErrors').append("Error at line: " + err.line + " - " + err.reason);
                }

                $('.test3').off();
                $('.test3').on('mouseover', function(){
                    alert($(this).data('error'));
                });
        }
        updateHints();

    };

    /*
        Method: updateJambi
        Purpose: fetches data from the server to update Jambi with
    */
    Jambi.prototype.updateJambi = function () {
        // Get data from server
        $.ajax({
            type: 'GET',
            url: "http://jambi.herokuapp.com/api",
            async: true,
            contentType: "application/json",
            dataType: 'json',
            success: function(data) {
                // Update the CDN Insta links
                jModel.setCDNS(data.cdns);
            },
            error: function(e) {
                // Alert if error
                alert("Error: " + e);
            }
        });
    };

    /*
        Method: newFile
        Purpose: Creates a new file using JambiModel
    */
    Jambi.prototype.newFile = function () {
        jModel.newFile();
    };

    /*
        Method: closeCurrentFile
        Purpose: Closes current file using JambiModel
    */
    Jambi.prototype.closeCurrentFile = function () {
        jModel.closeCurrentDoc();
    };

    /*
        Method: closeAllFiles
        Purpose: closes all files using JambiModel
    */
    Jambi.prototype.closeAllFiles = function () {
        jModel.closeAllDocs();
    };

    /*
        Method: openFileByDir
        Purpose: Opens a file by its directory
    */
    Jambi.prototype.openFileByDir = function(dir) {
        try {
            return fs.readFileSync(dir,{"encoding":'utf8'});
        } catch(err) {
            return null;
        }
    };

    /*
        Method: addFileToRecents
        Purpose: Adds opened files to the recently opened menu
    */
    Jambi.prototype.addFileToRecents = function(file) {
        // if there are more than 10 items, remove the first one until there is less than 10
        if(jSetup.openRecentMenu.items.length > 10) {
            while(jSetup.openRecentMenu.items.length > 10){
                jSetup.openRecentMenu.removeAt(0);
            }
        }
        // if not then add the new item
        if(jSetup.openRecentMenu.items.length <= 10) {
            var fileName = file.substr(file.lastIndexOf("/")+1, file.length);
            var filetype = fileName.substr(fileName.lastIndexOf('.') + 1, fileName.length);
            jSetup.openRecentMenu.append(new gui.MenuItem({ label: fileName,
                click: function(){
                    jModel.openFile(fileName ,jambi.openFileByDir(file), jModel.checkFileTypes(filetype), file);
                }
            }));
        }
    };

    /*
        Method: openFile
        Purpose: Opens a file using a file dialog
    */
    Jambi.prototype.openFile = function () {
        try {
            $('#fileDialog').change(function (evt) {
                // get file location
                var openFileLocation = $(this).val();
                // read the file using the location set by the dialog
                fs.readFile(openFileLocation, "utf8", function (error, data) {
                    if (error) {
                        alert(error);
                    } else {
                        // get file options
                        var fileLocation = openFileLocation.substring(0,openFileLocation.lastIndexOf("/")+1);
                        var fileName = openFileLocation.replace(/^.*[\\\/]/, '');
                        var filetype = fileName.substr(fileName.lastIndexOf('.') + 1, fileName.length);

                        // open the file
                        jModel.openFile(fileName ,data, jModel.checkFileTypes(filetype), fileLocation);
                        jambi.addFileToRecents(openFileLocation);
                    }
                });
            });
            $('#fileDialog').trigger('click');
        } catch(err) {
            alert("Could not open file");
        }
    };

    /*
        Method: saveFile
        Purpose: Saves the current file
    */
    Jambi.prototype.saveFile = function () {
        // Check that the page is correct
        if(jModel.onEditorPage()){
            // get active document and file location
            var file = jModel.getActiveDocument();
            var fileLocation = file.fileLocation;

            var cursorPos = jambiEditor.getCursor();


            function doesDirectoryExist (tempfileLoc) {
              try { fs.statSync(tempfileLoc); return true }
              catch (er) { return false }
            }
            // if the file has a location set, save that file to the same place
            if (fileLocation) {
                // final Check, make the directory if it does not exist on the file system
                if(!doesDirectoryExist(fileLocation)) {
                    fs.mkdirSync(fileLocation);
                }
                // create new file location with name and location
                fileLocation = file.fileLocation + file.title;

                // write the file
                fs.writeFile(fileLocation, jambiEditor.doc.getValue(), function (err) {
                    if (err) {
                        alert(err);
                    } else {
                        $('.file.active .filesaved i').removeClass("fa-circle").addClass("fa-circle-o");
                        jModel.getActiveDocument().isSaved = true;
                        // check for special file types
                        if(file == "less") {
                            var fileNameWithoutType = file.title.substr(0, file.title.lastIndexOf('.'));
                            jambi.compileLess(file.fileLocation + fileNameWithoutType + ".css");
                        }
                        // compile template if needed
                        if(jModel.getActiveProject()) {
                            if(jModel.getActiveProject().jTemplate){
                                jambi.jambiTemplate(jambiEditor.getValue());
                            }
                            // save with ssh if needed
                            if(jModel.getActiveDocument().ssh) {
                                if(jModel.getActiveDocument().ssh.enabled) {
                                    jambi.showNotification('Jambi', 'Successfully uploaded to server');
                                }
                            }

                        }
                        jambiEditor.setCursor(cursorPos);
                    }
                });
            } else {
                // else save file as
                jambi.saveFileAs();
            }
        }
    };

    /*
        Method: saveFileAs
        Purpose: Saves the current file with a dialog to specifiy a location
    */
    Jambi.prototype.saveFileAs = function () {
        // check if on the correct page
        if(jModel.onEditorPage()){
            // load the save dialog
            $('#saveDialog').click();
            $('#saveDialog').on('change', function (event) {
                // get the file location
                var fileLocation = $(this).val();
                // write the file
                fs.writeFile(fileLocation, jambiEditor.doc.getValue(), function (err) {
                    if (err) {
                        alert(err);
                    } else {

                        // If windows, do double back slash
                        var sysString = "/";
                        if(process.platform == "win32" || process.platform == "win64" ) {
                    		sysString = "\\";
                    	}


                        // get options
                        var filename = fileLocation.replace(/^.*[\\\/]/, '');
                        fileLocation = fileLocation.substring(0,fileLocation.lastIndexOf(sysString)+1);
                        $('#saveDialog').attr('nwworkingdir', fileLocation);
                        // set options
                        jModel.setDocLocation(fileLocation);
                        jModel.setDocName(filename);

                        if(!jModel.getActiveDocument().isSaved) {
                            $('.file.active .filesaved i').removeClass("fa-circle").addClass("fa-circle-o");
                            jModel.getActiveDocument().isSaved = true;
                        }

                        // if file is not already in Projects JSON
                        // use checkFileType here as well
                        var activeProject = jModel.getActiveProject();
                        if(activeProject) {
                    		var activeIndex = -1;

                    		// set active index
                    		for(var i = 0; i < activeProject.openfiles.length; i++){
                    		    activeProject.openfiles[i].active = false;
                    		    if(jModel.getActiveDocument().fileLocation === activeProject.openfiles[i].root &&
                    		        jModel.getActiveDocument().title === activeProject.openfiles[i].name) {
                                        activeIndex = i;
                    		    }
                    		}
                            if(activeIndex < 0) {
                        		jModel.addFileToProject(filename, fileLocation, "htmlmixed");
                        		jModel.saveAllProjects();
                    		}
                        }
                    }
                });
            });
        }
    };

    /*
        Method: compileLess
        Purpose: compiles a less file
    */
    Jambi.prototype.compileLess = function (fileLocationWithName) {
        // import less
        var less = require('less');
        // compile file and save
        less.render(jambi.getJambiEditor().getValue(), {
              paths: ['.', './lib'],  // Specify search paths for @import directives
              filename: fileLocationWithName, // Specify a filename, for better error messages
              compress: false          // Minify CSS output
            }, function (e, output) {
                if(!e) {
                    // save file and show notification
                    jambifs.writeJSON(fileLocationWithName, output.css);
                    jambi.showNotification('Jambi LESS', 'Successfully compiled to css');
                }
            });
    };

    /*
        Method: showNotification
        Purpose: shows a MacOSX style notification at the top right hand of the computer
    */
    Jambi.prototype.showNotification = function(ttl, msg, resp) {
        // import modules
        var notifier = require('node-notifier');
        // send notification
        notifier.notify({
            title: ttl,
            message: msg,
            icon: 'public/img/logo.png',
            sound: false,
            wait: false
            }, function (err, response) {
                if(response && resp && !err) {
                    resp();
                }
                if(err && resp) {
                    alert(err);
                }
            }
        );
        return notifier;
    };


	/*
        Method: searchWeb
        Purpose: Function to handle the web (stackoverflow.com) search box
    */
    Jambi.prototype.searchWeb = function () {
        // if the key = enter, search the web
        $("#stackoverflow_search").keyup(function(event){
            if(event.keyCode === 13){
                var searchTerm = $("#stackoverflow_search").val().split(' ').join('+');
                var searchURL = 'https://www.google.co.uk/webhp?sourceid=chrome-instant&rlz=1C5CHFA_enGB558GB558&ion=1&espv=2&ie=UTF-8#q=' +
                    searchTerm +
                    '%20site%3Astackoverflow.com';
                // open the url
                jSetup.gui.Shell.openExternal(searchURL);
                // set the value to empty again
                $(this).val("");
            }
        });
    };

    /*
        Method: openServer
        Purpose: starts a python simple server
    */
    Jambi.prototype.openServer = function () {
       jModel.execServer();
    };

	/*
        Method: createModel
        Purpose: Function made to populate the modal in Jambi
		            There is one modal markup that gets populated via this function
    */
    Jambi.prototype.createModal = function (modalTitle, modalSubtitle, modalContent, modalType, modalFunc, modalWidth, extraButton) {
        // If there is no modal type defined then we set the default button name - 'Save'
        if (modalType === undefined || modalType === null) {
            modalType = "Save";
        }

        // Check if the function of the modal is defined, if not there is no point in the modal - so we let the programmer know this with an alert
        if (modalFunc === undefined || modalFunc === null) {
            modalFunc = function () {
                alert("Modal: " + modalTitle + " has no function");
            };
        }

        // If the width is defined then we set the css width of the modal - default is set in main.scss - 500px
        if(modalWidth) {
            $('.jambiModal-modal').css('width', modalWidth);
        }

        // Set values of the modal
        $('#modalButtonRight').html(modalType);
        $('#modalTitle').html(modalTitle);
        $('#modalSubtitle').html(modalSubtitle);
        $('#modalContent').html(modalContent);

        if(extraButton) {
            $('.jambiModal-buttons').append('<a href="#" class="btn btn-blue" id="modalButtonExtra">' + extraButton + '</a>');
        }

        // Open the modal
        jambi.openModal();

        // Set the click function of the modal to the function given in the parameters
        $('#modalButtonRight').off('click');
        $('#modalButtonRight').on('click', function () {
            modalFunc();
        });
    };

    /*
        Method: openModal
        Purpose: function to open the modal
    */
    Jambi.prototype.openModal = function () {
        // Open the modal using a 'href' javascript emulator
        location.href = "#jambiModal";
    };

    /*
        Method: addSideMenu
        Purpose: appends a side menu to the side bar
    */
    Jambi.prototype.addSideMenu = function (title, content) {
        $('#sidebar-content').append('<div class="sidebar-heading">' + title + '</div>')
        .append('<div class="sidebar-content">' + content + '</div>');
    };

    // Jambi Animations
    /*
        Method: toggleSidebar
        Purpose: function that toggles the sidebar in Jambi
    */
    Jambi.prototype.toggleSideMenu = function () {
        // if toggled, show/ hide
        if($('.sidebar').hasClass("inView")) {
            $('.sidebar').animate({"margin-right": '-=300px'}, 200);
            $('.editor-container').animate({ "width": "+=300px" }, 200);
            $('.sidebar').removeClass("inView");
            $('#sidebar_toggle i').removeClass('fa-indent').addClass('fa-outdent');
            jambiEditor.refresh();
        }
        else {
            $('.sidebar').animate({"margin-right": '+=300px'}, 200);
            $('.editor-container').animate({ "width": "-=300px" }, 200);
            $('.sidebar').addClass("inView");
            $('#sidebar_toggle i').removeClass('fa-outdent').addClass('fa-indent');
            jambiEditor.refresh();
        }
    };


    /*
        Method: runCommand
        Purpose: runs a command using the shell process (terminal)
    */
    Jambi.prototype.runCommand = function(command, div) {
        try{
            // execute the command given in the argument
            shell.exec(command, function(code, output) {
                if(code !== 0) {
                    //console.log('Exit code:', code);
                }
                if(div && output) {
                    div.text(output);
                }
            });
        } catch(e) {
            // Show notification if error
            jambi.showNotification("Jambi", "Error Running Command");
        }
    };

    /*
        Method: initFlow
        Purpose: Starts a flow server given the project
    */
    Jambi.prototype.initFlow = function (projectLocation) {
        if(!(jModel.getActiveProject().flowInitialised)) {
            jambi.runCommand('cd ' + '"' + projectLocation + '"' +
                ' && /usr/local/bin/flow init');
            jModel.getActiveProject().flowInitialised = true;
            jModel.saveAllProjects();
        }

    };

    /*
        Method: flowCode
        Purpose: Method used for static type checking of JavaScript Files
                 Written by facebook but only as a terminal command line system, integrated here with I/O of Terminal
    */
    Jambi.prototype.flowCode = function(fileLocation, filename) {
        // Wrap in try to avoid terminal errors
        try{
            if(fileLocation && filename) {
                // Remove all the old messages and mouseover event listener
                $('#jambi-body').off('mouseover', '.test');
                $('#flowErrorMessage').hide();

                // Counter for errors
                var errorCount = 0;
                // Old text of Jambi
                var oldText = jambi.getJambiEditor().getValue();
                // if flow message is not at the top, add it
                if(!oldText.match(/(\/)(\*)(\s)(@flow)(\s)(\*)(\/)/)) {
                    jambi.getJambiEditor().setValue("/* @flow */\n" + oldText);
                }
                // save the file for changes
                jambi.saveFile();

                var fullPath = fileLocation + filename;
                if(fullPath.indexOf("./") === 1) {
                    fullPath = fullPath.substr(2, fullPath.length);
                }

                // variable for the results
                var listOfJSON = "";

                // spawn the command
                var flowResults = terminal.spawn('/usr/local/bin/flow', ['check', '--json', fileLocation]);

                // when the command returns data, append it to the results string
                flowResults.stdout.on('data', function (data) {
                    return listOfJSON += data.toString();
                });

                // when the spawn command closes, wait, then use that data to populate the side bar messages
                flowResults.on('close', function (code) {
                    setTimeout(function() {
                         try{
                            // clear the gutter of all messages
                            jambiEditor.clearGutter('test1');
                            // parse input from terminal
                            var results = JSON.parse(listOfJSON.toString()).errors;

                            // loop through all errors and append
                            for(var i = 0; i<results.length; i++) {
                                if(results[i].message[0].path === fullPath) {
                                    errorCount += 1;
                                    var result = results[i];
                                    var desc = result.message[0].descr;
                                    if(result.message[1]) {
                                        desc = result.message[0].descr + " " + result.message[1].descr;
                                    }
                                    var start = {"line": result.message[0].line, "ch": result.message[0].start};
                                    var end = {"line": result.message[0].endline, "ch": result.message[0].end};

                                    // Set gutter marker
                                    jambiEditor.setGutterMarker(result.message[0].line-1, "test1", makeMarker(desc));

                                    // Create markers
                                    function makeMarker(error) {
                                        var marker = document.createElement("div");
                                        marker.className = "test";
                                        marker.setAttribute('data-error', error);
                                        marker.style.color = "#ff0000";
                                        marker.innerHTML = '<i class="fa fa-exclamation-circle"></i>';
                                        return marker;
                                    }

                                }
                            }

                        } catch(err) {
                            // show error if error has occured
                            jambi.showNotification("Jambi Error", "Flow Error");
                        }

                        // be sure again to remove all old messages, then populate new ones
                        var $errorMessageDiv = $('#flowErrorMessage');
                        $('#jambi-body').off('mouseover', '.test');
                        // when the user hovers over the gutter marker, change a divs location to the cursor and show that div with
                        // information on the errors at that line
                        $('#jambi-body').on('mouseover', '.test', function(){
                            var $that = $(this);
                            var message = $that.data('error');
                            var offTop = $that.offset().top;
                            var offLeft = $that.offset().left;
                            $errorMessageDiv.fadeIn();
                            $errorMessageDiv.offset({top: offTop, left: offLeft+20});
                            $errorMessageDiv.html(message);
                        });
                        // hide the div when the mouse leaves
                        $('#jambi-body').on('mouseleave', '.test', function(){
                            $errorMessageDiv.fadeOut();
                        });

                        // update the flow module
                        $('#flowcontent').html("Found " + errorCount + " errors");

                    }, 400);
                });

                // refresh the editor
                jambiEditor.refresh();
            }
        } catch(e) {
            // if error, show notification error
            jambi.showNotification("Error", "Flow error");
        }
    };

    /*
        Method: vcStatus
        Purpose: Version Control status
    */
    Jambi.prototype.vcStatus = function(div, vcType) {
        try{
            var command;
            var root = jModel.getActiveDocument().fileLocation;
            command = 'cd ' + root + ' && ' + vcType + ' status';

            shell.exec(command, function(code, output) {
                if(div && output) {
                    div.html(output);
                }
            });
        } catch(e) {
            jambi.showNotification("Jambi VC", "Error Showing Status");
        }
    };

    /*
        Method: vcPull
        Purpose: Version Control pull from repo
    */
    Jambi.prototype.vcPull = function (vcType) {
        try {
            var command;
            var root = jModel.getActiveDocument().fileLocation;
            if(vcType === "git") {
                command = 'cd ' + root + ' &&  git pull origin master';
            }
            if(vcType === "hg") {
                command = 'cd ' + root + ' && hg pull -u';
            }

            shell.exec(command, function(code, output) {
                if(output) {
                    jambi.showNotification("Jambi VC", "Repository Pulled");
                }
            });
        } catch(e) {
            jambi.showNotification("Jambi VC", "Error Pulling Repo");
        }
    };

    /*
        Method: vcPush
        Purpose: Version Control push to repo
    */
    Jambi.prototype.vcPush = function (vcType) {
        try{
            var command;
            var root = jModel.getActiveDocument().fileLocation;
            command = 'cd ' + root + ' && ' + vcType + ' push';

            shell.exec(command, function(code, output) {
                if(output){
                    jambi.showNotification("Jambi VC", "Successfully Pushed");
                }
            });
        } catch(e) {
            jambi.showNotification("Jambi VC", "Error Pushing Changes");
        }
    };

    /*
        Method: vcCommit
        Purpose: Version Control commit changes
    */
    Jambi.prototype.vcCommit = function (vcType, commitMsg) {
        try{
            var command;
            jambi.saveFile();
            var root = jModel.getActiveDocument().fileLocation;
            if(commitMsg) {
                command = 'cd ' + root + ' && ' + vcType + ' add ' + root + ' && ' + vcType + ' commit -m ' + '"' + commitMsg + '"';
            }
            else {
                command = 'cd ' + root + ' && ' + vcType + ' add ' + root + ' && ' + vcType + ' commit -m "Commiting changes to ' +
                jModel.getActiveDocument().title + '"';
            }

            shell.exec(command, function(code, output) {
                if(output){
                    jambi.showNotification("Jambi VC", "Files Commited");
                }
            });
        } catch(e) {
            jambi.showNotification("Jambi VC", "Error Commiting changes");
        }
    };

    /*
        Method: vcClone
        Purpose: Version Control clone repo
    */
    Jambi.prototype.vcClone = function (url, vcType) {
        try{
            var command;
            var root = jModel.getActiveProject().root;
            if(url) {
                command = 'cd ' + root + ' && ' +  vcType + ' clone ' + url;
            }

            shell.exec(command, function(code, output) {});
        } catch(e) {
            jambi.showNotification("Jambi VC", "Error Cloning Repo");
        }
    };

    /*
        Method: jambiTemplate
        Purpose: compiles the jambi template pages into a folder
    */
	Jambi.prototype.jambiTemplate = function (input) {
    	// get document attributes
    	var currentHistory = jambiEditor.doc.getHistory();
        var activeDoc = jModel.getActiveDocument();
        var activeProject = jModel.getActiveProject();

        // function to check if directory exists
        function doesDirectoryExist (tempfileLoc) {
            try { fs.statSync(tempfileLoc); return true }
            catch (er) { return false }
        }

        // if active document has a file location and project
        if(activeDoc.fileLocation && activeProject) {
            var oldHTML = jambiEditor.getValue();
            // regex for template tags
            var templateTags = /(\(%)(\s)?(')?(include|if)?(\s)(')?(.)*(')?(%)(\))/g;

            var tags = input.match(templateTags);
            // if there are any template tags in the document
            if(tags) {
                var counter = 0;
                var searchCursor = jambiEditor.getSearchCursor(templateTags,0,true);
                // while there is another template tag, compile more!
                while(searchCursor.findNext()) {
                    var tag = tags[counter];
                    counter++;
                    // You run out of regex variable names soon enough....
                    var asd = /(\')(.)*(\')/;
                    var filename = tag.match(asd)[0];

                    filename = filename.substr(1, filename.length-2);

                    // find tag and replace with content
            		var row = searchCursor.from().line;
                    var col = searchCursor.from().ch;
                    jambiEditor.setCursor(row,col);
                    var cursor = jambi.getJambiEditor().getCursor();
                    cursor.ch = 100;
                    // Set the selection ready to insert the new html
                    jambiEditor.setSelection(searchCursor.from(), cursor);
                    // create the templates folder if it doesn't exist
                    if(!doesDirectoryExist (activeProject.root + "/templates")) {
                        fs.mkdirSync(activeProject.root + "/templates");
                    }

                    try{
                        // read in the html
                        var newHtml = jambifs.readHTML(activeDoc.fileLocation + filename);
                        // set the value
                        jambi.getJambiEditor().replaceSelection(newHtml);
                        // export the template
                        jambifs.writeJSON(activeProject.root + "/" + activeDoc.title, jambiEditor.getValue());

                    } catch(err) {
                        alert(err);
                    }
                }
            }
            // change back to the old html file
            jambiEditor.setValue(oldHTML);
        }
        // reset the history
        jambiEditor.doc.setHistory(currentHistory);
	};

    /*
    * Java Compiler
    * Compiles Java files when clicked on the item in the menu bar
    */
	Jambi.prototype.compieleJava = function () {
    	try{
        	// get the active document
            var activeDoc = jModel.getActiveDocument();
            $('#flowErrorMessage').hide();

            // if active document
            if(activeDoc) {

                // get the file location
                var fileLocation = activeDoc.fileLocation;
                // if file location
                if(fileLocation) {
                    // save the file
                    jambi.saveFile();
                    // get the file name and type
                    var filename = fileLocation + activeDoc.title;
                    var fileType = filename.substr((filename.lastIndexOf(".")+1), filename.length);
                    // check that the file type is a java file
                    if(fileType === "java") {
                        // run JavaC with the file
                        var command = "javac " + filename;
                        shell.exec(command, function(code, output) {
                            if(code === 0) {
                                // if no errors, then show a success notification
                                jambi.showNotification("Jambi Java Compiler", "Successfully Compiled");
                                $('#javaReporter').html("No errors");
                            } else {
                                // Error reporting
                                $('#javaReporter').empty();
                                // get error lines
                                var errors = output.match(/error:(\s)(.)*/g);
                                var errorLines = output.match(/(:)\d(:)/g);
                                // go through and create markers for all the errors
                                for(var i = 0; i < errors.length; i++){
                                    if(errorLines !== null || errorLines !== undefined) {
                                        if(errorLines[i] !== undefined || errorLines[i] !== null ) {
                                            var errorLine = errorLines[i].match(/\d/);
                                            $('#javaReporter').append(errors[i] + " at line " + errorLine + "<br>");
                                            jambiEditor.setGutterMarker(parseInt((errorLine)-1), "test1", makeMarker(errors[i]));
                                        } else {
                                            $('#javaReporter').append(errors[i] + "<br>");
                                        }
                                    }
                                }

                                function makeMarker(error) {
                                  var marker = document.createElement("div");
                                  marker.className = "test";
                                  marker.setAttribute('data-error', error);
                                  marker.style.color = "#ff0000";
                                  marker.innerHTML = '<i class="fa fa-exclamation-circle"></i>';
                                  return marker;
                                }

                                // add the errors to the line numbers
                                var $errorMessageDiv = $('#flowErrorMessage');
                                $('#jambi-body').off('mouseover', '.test');
                                // same as flow, mouse over to show the errors
                                $('#jambi-body').on('mouseover', '.test', function(){
                                    var $that = $(this);
                                    var message = $that.data('error');
                                    var offTop = $that.offset().top;
                                    var offLeft = $that.offset().left;
                                    $errorMessageDiv.fadeIn();
                                    $errorMessageDiv.offset({top: offTop, left: offLeft+20});
                                    $errorMessageDiv.html(message);
                                });
                                // hide the box on
                                $('#jambi-body').on('mouseleave', '.test', function(){
                                    $errorMessageDiv.fadeOut();
                                });
                            }
                        });
                    }
                } else {
                    // save the file first if not saved already
                    alert("Please save your current file");
                }
            }
        } catch(e) {

        }
	};

    /*
        Method: findVariables
        Purpose: method to find all variable tags in the active document, used for variable analysis
    */
	Jambi.prototype.findVariables = function () {
    	try{
        	// cache the js variables div
            var $jsVars = $('#jsVariables');
            // empty it of all previous results
            $jsVars.empty();

            var tags = [];
            // find all var tags and their names
            var vRegEx = /var(\s)[^(\s)]*(\s?)(;?)[^\s]*/g;
            var listOfTags = jambi.getJambiEditor().getValue().match(vRegEx);

            // if list of tags is not null
            if(listOfTags !== null) {
                    for(var k = 0; k<listOfTags.length; k++) {
                        // get tag name
                        var tagName = listOfTags[k].substr(4, listOfTags[k].length);
                        tagName = tagName.match(/[^\s=;]*/g)[0];

                        // create tag object
                        var tagObject = {
                            "name" : tagName
                        }
                        // push to array
                        tags.push(tagObject);
                    }
                    // print that array to the sidebar
                    if(tags.length === 1) {
                        $jsVars.prepend(tags.length + " variable found <br><hr>");
                    } else {
                        $jsVars.prepend(tags.length + " variables found <br><hr>");
                    }
                    // append vars to div
                    for(var i = 0; i<tags.length; i++) {
                        $jsVars.append(tags[i].name + "<br>");
                    }
                    return tags;
            }
        } catch(e) {

        }
	};


};

var jambi = new Jambi();
jambi.menuSetup();