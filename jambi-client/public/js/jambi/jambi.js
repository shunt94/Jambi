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

    // Read in the Jambi settings
    readJambiSettings();

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
            var that = this;
            jambi.createModal("Are you sure you want to quit", "You have unsaved files", "Unsaved files", "Quit", function(){that.close(true);});
            jambi.openModal();
            return false;
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
                console.log(result);
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

        generateJambiContextMenus();



        var instaReady = false;
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


        jambiEditor.on("keydown", function(editor, keyevent) {
            var code = keyevent.keyCode;
            // if insta has been init then build string
            checkInstas(code, keyevent);
        });


    };


    Jambi.prototype.insertAtCursor = function (text) {
        jambi.getJambiEditor().replaceSelection(text);
        jambi.getJambiEditor().focus();
    }


    Jambi.prototype.colourChooser = function () {
        function modalFunction() {
            var colour = $('#colourChooserColour').val();
            jambi.insertAtCursor(colour);
        }

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
		Handler for the JSHint function for the Javascript mode in the editor
	*/
    Jambi.prototype.jsHint = function () {
        function updateHints() {
                jambiEditor.clearGutter("test2");
                JSHINT(jambiEditor.getValue());
                $('#jsErrors').empty();
                for (var x = 0; x < JSHINT.errors.length; ++x) {
                    var err = JSHINT.errors[x];
                    if (!err) continue;


                    var gutterLine = parseInt(err.line-1);


                    jambiEditor.setGutterMarker(gutterLine, "test2", makeMarker(err.reason));

                    function makeMarker(error) {
                        var marker = document.createElement("div");
                        marker.className = "test3";
                        marker.setAttribute('data-error', error);
                        marker.style.color = "#ff0000";
                        marker.innerHTML = '<i class="fa fa-exclamation-circle"></i>';
                        return marker;
                    }


                    jambiEditor.refresh();
                    $('#jsErrors').append("Error at line: " + err.line + " - " + err.reason);
                }

                $('.test3').off();
                $('.test3').on('mouseover', function(){
                    alert($(this).data('error'));
                });
        }


        var waiting;
        updateHints();

    };

    Jambi.prototype.stopJSHint = function () {

    };

    Jambi.prototype.updateJambi = function () {
        $.ajax({
            type: 'GET',
            url: "http://jambi.herokuapp.com/api",
            async: true,
            contentType: "application/json",
            dataType: 'json',
            success: function(data) {
                jambiEditor.setValue('<link rel="stylesheet" type="text/css" href="' + data.cdns.bootstrap_css + '"> \n' +'<link rel="stylesheet" type="text/css" href="' + data.cdns.bootstrap_theme + '"> \n' + '<script type="text/javascript" src="' + data.cdns.jquery + '"></script> \n' + '<script type="text/javascript" src="' + data.cdns.bootstrap_js + '"></script> \n');
            },
            error: function(e) {
                alert("Error: " + e);
            }
        });
    };

    Jambi.prototype.newFile = function () {
        jModel.newFile();
    };

    Jambi.prototype.closeCurrentFile = function () {
        jModel.closeCurrentDoc();
    };

    Jambi.prototype.closeAllFiles = function () {
        jModel.closeAllDocs();
    };


    Jambi.prototype.openFileByDir = function(dir) {
        try {
            return fs.readFileSync(dir,{"encoding":'utf8'});
        }
        catch(err) {
            return null;
        }
    };

    Jambi.prototype.addFileToRecents = function(file) {
        if(jSetup.openRecentMenu.items.length > 10) {
            while(jSetup.openRecentMenu.items.length > 10){
                jSetup.openRecentMenu.removeAt(0);
            }
        }
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


    Jambi.prototype.openFile = function () {
        try {
            $('#fileDialog').change(function (evt) {
                var openFileLocation = $(this).val();
                fs.readFile(openFileLocation, "utf8", function (error, data) {
                    if (error) {
                        alert(error);
                    } else {
                        var fileLocation = openFileLocation.substring(0,openFileLocation.lastIndexOf("/")+1);
                        var fileName = openFileLocation.replace(/^.*[\\\/]/, '');
                        var filetype = fileName.substr(fileName.lastIndexOf('.') + 1, fileName.length);
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

    Jambi.prototype.saveFile = function () {
        if(jModel.onEditorPage()){
            var file = jModel.getActiveDocument();
            var fileLocation = file.fileLocation;

            var cursorPos = jambiEditor.getCursor();


            function doesDirectoryExist (tempfileLoc) {
              try { fs.statSync(tempfileLoc); return true }
              catch (er) { return false }
            }

            if (fileLocation) {
                if(!doesDirectoryExist(fileLocation)) {
                    fs.mkdirSync(fileLocation);
                }
                fileLocation = file.fileLocation + file.title;
                fs.writeFile(fileLocation, jambiEditor.doc.getValue(), function (err) {
                    if (err) {
                        alert(err);
                    } else {
                        $('.file.active .filesaved i').removeClass("fa-circle").addClass("fa-circle-o");
                        jModel.getActiveDocument().isSaved = true;
                        if(file == "less") {
                            var fileNameWithoutType = file.title.substr(0, file.title.lastIndexOf('.'));
                            jambi.compileLess(file.fileLocation + fileNameWithoutType + ".css");
                        }
                        if(jModel.getActiveProject()) {
                            if(jModel.getActiveProject().jTemplate){
                                jambi.jambiTemplate(jambiEditor.getValue());
                            }
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
                jambi.saveFileAs();
            }
        }
    };

    Jambi.prototype.saveFileAs = function () {
        if(jModel.onEditorPage()){
            $('#saveDialog').click();
            $('#saveDialog').on('change', function (event) {
                var fileLocation = $(this).val();
                fs.writeFile(fileLocation, jambiEditor.doc.getValue(), function (err) {
                    if (err) {
                        alert(err);
                    } else {

                        var sysString = "/";
                        if(process.platform == "win32" || process.platform == "win64" ) {
                    		sysString = "\\";
                    	}



                        var filename = fileLocation.replace(/^.*[\\\/]/, '');
                        fileLocation = fileLocation.substring(0,fileLocation.lastIndexOf(sysString)+1);
                        $('#saveDialog').attr('nwworkingdir', fileLocation);
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

    Jambi.prototype.saveUserSetting = function (setting, value) {

    };

    Jambi.prototype.compileLess = function (fileLocationWithName) {
        var less = require('less');
        less.render(jambi.getJambiEditor().getValue(), {
              paths: ['.', './lib'],  // Specify search paths for @import directives
              filename: fileLocationWithName, // Specify a filename, for better error messages
              compress: false          // Minify CSS output
            }, function (e, output) {
                if(!e) {
                    jambifs.writeJSON(fileLocationWithName, output.css);
                    jambi.showNotification('Jambi LESS', 'Successfully compiled to css');
                }
            });
    };

    Jambi.prototype.showNotification = function(ttl, msg, resp) {
        var notifier = require('node-notifier');
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
		Function to handle the web (stackoverflow.com) search box
	*/
    Jambi.prototype.searchWeb = function () {
        $("#stackoverflow_search").keyup(function(event){
            if(event.keyCode === 13){
                var searchTerm = $("#stackoverflow_search").val().split(' ').join('+');
                var searchURL = 'https://www.google.co.uk/webhp?sourceid=chrome-instant&rlz=1C5CHFA_enGB558GB558&ion=1&espv=2&ie=UTF-8#q=' +
                    searchTerm +
                    '%20site%3Astackoverflow.com';
                jSetup.gui.Shell.openExternal(searchURL);
                $('#stackoverflow_search').val("");
            }
        });
    };

    Jambi.prototype.openServer = function () {
       jModel.execServer();
    };

    /*
		Function made to populate the modal in Jambi
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
		Function used to open modal
	*/
    Jambi.prototype.openModal = function () {
        // Open the modal using a 'href' javascript emulator
        location.href = "#jambiModal";
    };

    Jambi.prototype.addSideMenu = function (title, content) {
        $('#sidebar-content').append('<div class="sidebar-heading">' + title + '</div>')
        .append('<div class="sidebar-content">' + content + '</div>');
    };

    // Jambi Animations
    /*
        Function that toggles the sideMenu in Jambi
    */
    Jambi.prototype.toggleSideMenu = function () {
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


    Jambi.prototype.runCommand = function(command, div) {
        shell.exec(command, function(code, output) {
            if(code !== 0) {
                console.log('Exit code:', code);
            }
            if(div && output) {
                div.text(output);
            }
        });
    };


    Jambi.prototype.initFlow = function (projectLocation) {
        if(!(jModel.getActiveProject().flowInitialised)) {
            jambi.runCommand('cd ' + '"' + projectLocation + '"' +
                ' && /usr/local/bin/flow init');
            jModel.getActiveProject().flowInitialised = true;
            jModel.saveAllProjects();
        }

    };




    Jambi.prototype.flowCode = function(fileLocation, filename) {
        if(fileLocation && filename) {

            $('#jambi-body').off('mouseover', '.test');
            $('#flowErrorMessage').hide();
            var errorCount = 0;
            var oldText = jambi.getJambiEditor().getValue();
            if(!oldText.match(/(\/)(\*)(\s)(@flow)(\s)(\*)(\/)/)) {
                jambi.getJambiEditor().setValue("/* @flow */\n" + oldText);
            }
            jambi.saveFile();

            var fullPath = fileLocation + filename;
            if(fullPath.indexOf("./") === 1) {
                fullPath = fullPath.substr(2, fullPath.length);
            }

            var listOfJSON = "";
            var flowResults = terminal.spawn('/usr/local/bin/flow', ['check', '--json', fileLocation]);

            flowResults.stdout.on('data', function (data) {
                return listOfJSON += data.toString();
            });
            flowResults.on('close', function (code) {
                setTimeout(function() {
                     try{
                        jambiEditor.clearGutter('test1');
                        var results = JSON.parse(listOfJSON.toString()).errors;
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

                                jambiEditor.setGutterMarker(result.message[0].line-1, "test1", makeMarker(desc));

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
                        console.log(err);
                        jambi.showNotification("Jambi Error", "Flow Error");
                    }

                    var $errorMessageDiv = $('#flowErrorMessage');
                    $('#jambi-body').off('mouseover', '.test');
                    $('#jambi-body').on('mouseover', '.test', function(){
                        var $that = $(this);
                        var message = $that.data('error');
                        var offTop = $that.offset().top;
                        var offLeft = $that.offset().left;
                        $errorMessageDiv.fadeIn();
                        $errorMessageDiv.offset({top: offTop, left: offLeft+20});
                        $errorMessageDiv.html(message);
                    });
                    $('#jambi-body').on('mouseleave', '.test', function(){
                        $errorMessageDiv.fadeOut();
                    });

                    $('#flowcontent').html("Found " + errorCount + " errors");

                }, 100);
            });

            jambiEditor.refresh();
        }
    };

    Jambi.prototype.vcStatus = function(div, vcType) {
        var command;
        var root = jModel.getActiveDocument().fileLocation;
        command = 'cd ' + root + ' && ' + vcType + ' status';

        shell.exec(command, function(code, output) {
            if(div && output) {
                div.html(output);
            }
        });
    };


    Jambi.prototype.vcPull = function (vcType) {
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
    };

    Jambi.prototype.vcPush = function (vcType) {
        var command;
        var root = jModel.getActiveDocument().fileLocation;
        command = 'cd ' + root + ' && ' + vcType + ' push';

        shell.exec(command, function(code, output) {
            if(output){
                jambi.showNotification("Jambi VC", "Successfully Pushed");
            }
        });
    };


    Jambi.prototype.vcCommit = function (vcType, commitMsg) {
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
    };

    Jambi.prototype.vcClone = function (url, vcType) {
        var command;
        var root = jModel.getActiveProject().root;
        if(url) {
            command = 'cd ' + root + ' && ' +  vcType + ' clone ' + url;
        }

        shell.exec(command, function(code, output) {
        });
    };


	Jambi.prototype.jambiTemplate = function (input) {
    	var currentHistory = jambiEditor.doc.getHistory();
        var activeDoc = jModel.getActiveDocument();
        var activeProject = jModel.getActiveProject();

        function doesDirectoryExist (tempfileLoc) {
            try { fs.statSync(tempfileLoc); return true }
            catch (er) { return false }
        }

        if(activeDoc.fileLocation && activeProject) {
            var oldHTML = jambiEditor.getValue();
            var templateTags = /(\(%)(\s)?(')?(include|if)?(\s)(')?(.)*(')?(%)(\))/g;

            var tags = input.match(templateTags);
            if(tags) {


                var counter = 0;
                var searchCursor = jambiEditor.getSearchCursor(templateTags,0,true);
                while(searchCursor.findNext()) {
                    var tag = tags[counter];
                    counter++;
                    var asd = /(\')(.)*(\')/;
                    var filename = tag.match(asd)[0];

                    filename = filename.substr(1, filename.length-2);


            		var row = searchCursor.from().line;
                    var col = searchCursor.from().ch;
                    jambiEditor.setCursor(row,col);
                    var cursor = jambi.getJambiEditor().getCursor();
                    cursor.ch = 100;
                    jambiEditor.setSelection(searchCursor.from(), cursor);
                    if(!doesDirectoryExist (activeProject.root + "/templates")) {
                        fs.mkdirSync(activeProject.root + "/templates");
                    }

                    try{
                        var newHtml = jambifs.readHTML(activeDoc.fileLocation + filename);
                        jambi.getJambiEditor().replaceSelection(newHtml);
                        jambifs.writeJSON(activeProject.root + "/" + activeDoc.title, jambiEditor.getValue());

                    } catch(err) {
                        alert(err);
                    }
                }
            }
            jambiEditor.setValue(oldHTML);
        }

        jambiEditor.doc.setHistory(currentHistory);
	};

    /*
    * Java Compiler
    * Compiles Java files when clicked on the item in the menu bar
    */
	Jambi.prototype.compieleJava = function () {
    	// get the active document
        var activeDoc = jModel.getActiveDocument();
        $('#flowErrorMessage').hide();
        if(activeDoc) {
            var fileLocation = activeDoc.fileLocation;
            if(fileLocation) {
                jambi.saveFile();
                var filename = fileLocation + activeDoc.title;
                var fileType = filename.substr((filename.lastIndexOf(".")+1), filename.length);
                if(fileType === "java") {
                    var command = "javac " + filename;
                    shell.exec(command, function(code, output) {
                        if(code === 0) {
                            jambi.showNotification("Jambi Java Compiler", "Successfully Compiled");
                            $('#javaReporter').html("No errors");
                        } else {
                            // Error reporting
                            $('#javaReporter').empty();
                            var errors = output.match(/error:(\s)(.)*/g);
                            var errorLines = output.match(/(:)\d(:)/g);
                            for(var i = 0; i < errors.length; i++){
                                if(errorLines[i] !== undefined || errorLines[i] !== null ) {
                                    var errorLine = errorLines[i].match(/\d/);
                                    $('#javaReporter').append(errors[i] + " at line " + errorLine + "<br>");
                                    jambiEditor.setGutterMarker(parseInt((errorLine)-1), "test1", makeMarker(errors[i]));
                                } else {
                                    $('#javaReporter').append(errors[i] + "<br>");
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
                            $('#jambi-body').on('mouseover', '.test', function(){
                                var $that = $(this);
                                var message = $that.data('error');
                                var offTop = $that.offset().top;
                                var offLeft = $that.offset().left;
                                $errorMessageDiv.fadeIn();
                                $errorMessageDiv.offset({top: offTop, left: offLeft+20});
                                $errorMessageDiv.html(message);
                            });
                            $('#jambi-body').on('mouseleave', '.test', function(){
                                $errorMessageDiv.fadeOut();
                            });




                        }
                    });
                }
            } else {
                alert("Please save your current file");
            }
        }
	};


	Jambi.prototype.findVariables = function () {
        var $jsVars = $('#jsVariables');
        $jsVars.empty();

        var tags = [];
        // find all var tags and their names
        var vRegEx = /var(\s)[^(\s)]*(\s?)(;?)[^\s]*/g;
        var listOfTags = jambi.getJambiEditor().getValue().match(vRegEx);


        if(listOfTags !== null) {
                for(var k = 0; k<listOfTags.length; k++) {
                    console.log(listOfTags[k]);
                    var tagName = listOfTags[k].substr(4, listOfTags[k].length);
                    tagName = tagName.match(/[^\s=;]*/g)[0];
                    console.log(tagName);


                    var tagObject = {
                        "name" : tagName
                    }
                    tags.push(tagObject);
                }
                // print that array to the sidebar

                if(tags.length === 1) {
                    $jsVars.prepend(tags.length + " variable found <br><hr>");
                } else {
                    $jsVars.prepend(tags.length + " variables found <br><hr>");
                }

                for(var i = 0; i<tags.length; i++) {
                    $jsVars.append(tags[i].name + "<br>");
                }
                return tags;
        }
        //return null;
	};


};

var jambi = new Jambi();
jambi.menuSetup();