var jSetup = new jambiSetup();
var Jambi = function () {

    var fs = require('fs');
    var terminal = require('child_process');
    var shell = require('shelljs');
    var jambiEditor;
    var jambiEditorConfig;
    var currentFileDir;
    var version;
    var widgets = [];
    var areFilesUnsaved = false;

    var editorFontSize = 14;

    readJambiSettings();


    function readJambiSettings() {
        jambifs.readJSON('jambi.json', function(err, data) {
            if(err) {
                alert("Failed to read Jambi settings");
                version = "1.0";
            }
            else {
                version = data.version;
                editorFontSize = data.editor_settings.fontsize;
            }
        });
    }

    /*
		Function used to setup all of the menu bar - Action listeners and populators
	*/
    Jambi.prototype.menuSetup = function () {

        // File Submenu
        jSetup.jambiMenu.file.fileNewSubmenu[0].click = function () {

        };
        jSetup.jambiMenu.file.fileSave.click = function () {
            jambi.saveFile();
        };
        jSetup.jambiMenu.file.fileSaveAs.click = function () {
            jambi.saveFileAs();
        };
        jSetup.jambiMenu.file.fileOpen.click = function () {
            jambi.openFile();
        };
        jSetup.jambiMenu.file.fileNewSubmenu[0].value.click = function () {
            jambi.newFile();
        };
        jSetup.jambiMenu.file.fileClose.click = function () {
            jambi.closeCurrentFile();
        };
        jSetup.jambiMenu.file.fileCloseAll.click = function () {
            jambi.closeAllFiles();
        };
        jSetup.jambiMenu.file.fileClearSettings.click = function () {
            function modalFunction() {
                storedb('userSettings').remove();
            }
            jambi.createModal("Remove user settings",
                              "Are you sure you want to remove user settings?",
                              "This will delete all custom settings you may have made",
                              "Remove Settings",
                              modalFunction);
        };

        jSetup.jambiMenu.view.viewProjects.click = function () {
            window.location.replace("#/project");
        };

        jSetup.jambiMenu.view.viewEditor.click = function () {
            window.location.replace("#/home");
        };

        jSetup.jambiMenu.view.viewShowcase.click = function () {
            window.location.replace("#/showcase");
        };


        // Themes

        jSetup.jambiMenu.settings.settingsTheme.click = function () {
            function modalFunction() {

            }
            var modalContent;
             $.ajax({
                 dataType : "html",
                 url : "public/views/modal/theme.html",
                 success : function(results) {
                     modalContent = results;
                     jambi.createModal("Select Theme", "", modalContent, "Ok", modalFunction);
                 }
            });
        };


        // Version Control

        jSetup.jambiMenu.vc.vc.click = function () {
            function modalFunction() {

            }
            jambi.createModal("Setup Version Control", "", "<p>VC test</p>", "Ok", modalFunction);
        };

        if(true) { // Change this to if VC is setup
            jSetup.jambiMenu.vc.vcPull.enabled = false;
            jSetup.jambiMenu.vc.vcPush.enabled = false;
            jSetup.jambiMenu.vc.vcCommit.enabled = false;
        }


        jSetup.gui.Window.get().on('close', function () {
            // show warning if you want
            jambi.createModal("Are you sure you want to quit", "You have unsaved files", "Unsaved files", "Quit", function(){});
            jambi.openModal();
            this.close(true);
        });
    };

    Jambi.prototype.getVersion = function () {
        return version;
    };

    Jambi.prototype.getFontSize = function () {
        return editorFontSize;
    }

    Jambi.prototype.getJambiEditor = function () {
        return jambiEditor;
    };

    Jambi.prototype.initCodeMirror = function () {
        // User Settings
        var codeMirrortheme = "ambiance";

        // Find user settings using storeDB
        storedb('userSettings').find({ "setting": "theme" }, function (err, result) {
            if (err) {
                console.log("Could not find theme");
            } else if (result[0] !== null) {
                codeMirrortheme = result[0].setTo;
            }

            $("#themeselector option").filter(function () {
                return $(this).text() == codeMirrortheme;
            }).prop('selected', true);
        });


        // Create code mirror
        var mixedMode = {
            name: "htmlmixed",
            scriptTypes: [{
                matches: /\/x-handlebars-template|\/x-mustache/i,
                mode: null
            },
                          {
                              matches: /(text|application)\/(x-)?vb(a|script)/i,
                              mode: "vbscript"
                          }]
        };

        function betterTab(cm) {
            if (cm.somethingSelected()) {
                cm.indentSelection("add");
            } else {
                cm.replaceSelection(cm.getOption("indentWithTabs")? "\t":
                                    Array(cm.getOption("indentUnit") + 1).join(" "), "end", "+input");
            }
        }


        var foldLine = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
        jambiEditorConfig = {
            mode: mixedMode,
            theme: codeMirrortheme,
            lineWrapping: true,
            lineNumbers: true,
            tabSize: 4,
            indentUnit: 4,
            indentWithTabs: true,
            autoCloseTags: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            matchTags: true,
            foldGutter: true,
            highlightSelectionMatches: true,
            styleActiveLine: true,
            extraKeys: { Tab: betterTab }
        };

        jambi.renderEditor();

        function updateCursorPosition() {
            var cursorPos = jambiEditor.getCursor();
            $('#jambiLine').text(cursorPos.line + 1);
            $('#jambiColumn').text(cursorPos.ch + 1);
        }



        // Instas

        // if $ is detected then init Insta
        function insertAtCursor(text) {
            jambiEditor.replaceSelection(text);
        }

        jambi.setListeners();
    };


    Jambi.prototype.setListeners = function () {
        // Changed the theme of the editor
        $('#themeselector').on('change', function () {
            var theme = $('#themeselector option:selected').text();
            jambiEditor.setOption("theme", theme);

            storedb('userSettings').remove({
                "setting": "theme"
            }, function (err) {});

            storedb('userSettings').insert({
                "setting": "theme",
                "setTo": theme
            }, function (err, result) {
                if (err) {
                    console.log("User Settings could not be saved..");
                    console.log(err);
                } else {
                    console.log("User Settings Saved.. Deleting old data");
                }
            });

        });

        // Activates the JSHint-ing button on Javascript mode
        $('#modeSelector').on('change', function () {
            var mode = $("#modeSelector option:selected").attr('data-mode');
            var $jsHintCode = $('#jshintcode');
            jambiEditor.setOption("mode", mode);
            if(mode === "javascript") {
                jambi.jsHint();
                $jsHintCode.removeClass("hidden");
            }
            else {
                jambi.stopJSHint();
                $jsHintCode.addClass("hidden");
            }
        });
    };

    /*
		Renders the same editor when the editor view is called - Used when the editor view is called and when the initial editor is made

	*/
	var instaStarted = false;
    Jambi.prototype.renderEditor = function () {

        jambiEditor = CodeMirror(document.getElementById('jambi-editor'), jambiEditorConfig);
        jambiEditor.focus();

        jambiEditor.off("cursorActivity");
        jambiEditor.off("change");
        jambiEditor.off("keyup");
        jambiEditor.off("gutterClick");

        jambiEditor.on("change", function(e) {
            updateCursorPosition();
        });

        jambiEditor.on("cursorActivity", function(e) {
            updateCursorPosition();
        });
        var foldLine = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
        jambiEditor.on("gutterClick", foldLine);

        var timeout;
         var popupKeyCodes = {
            "9": "tab",
            "13": "enter",
            "27": "escape",
            "33": "pageup",
            "32": "space",
            "8": "backspace",
            "91": "unknown",
            "34": "pagedown",
            "35": "end",
            "36": "home",
            "38": "up",
            "40": "down"
        }


        jambiAC.setMenuContext('html');

        var instaArray = ["html", "bootstrap_basic"];
        jambiEditor.on("keyup", function(editor, keyevent) {
            // dollar sign ready for instas
            if(keyevent.shiftKey && keyevent.keyCode === 52) {
                jambi.destroyBuiltWord();
                instaStarted = true;
                alert("insta started");
            }
            else {
                if(instaStarted) {
                    jambi.createBuiltWord(String.fromCharCode(keyevent.keyCode).toLowerCase());

                    for(var i = 0; i < instaArray.length; i++) {
                        console.log(builtWord + "===" + instaArray[i]);
                        console.log(builtWord === "html");
                        if(builtWord === instaArray[i]) {
                            alert("Insta caught: " + instaArray[i]);
                        }
                    }
                }
                else if(!popupKeyCodes[(keyevent.keyCode || keyevent.which).toString()] && !editor.state.completionActive) {
                    jambi.createBuiltWord(String.fromCharCode(keyevent.keyCode).toLowerCase());
                    jambiAC.filterResults(builtWord);

                    if(timeout) clearTimeout(timeout);
                    timeout = setTimeout(function() {
                        jambiAC.show();
                    }, 200);
                }
                else {
                    jambiAC.hide();
                    jambi.destroyBuiltWord();
                    instaStarted = false;
                }

            }



        });



        function updateCursorPosition() {
            jambiAC.hide();
            var cursorPos = jambiEditor.getCursor();
            $('#jambiLine').text(cursorPos.line + 1);
            $('#jambiColumn').text(cursorPos.ch + 1);
        }
    };

    var builtWord = "";

    Jambi.prototype.createBuiltWord = function (letter) {
        builtWord = builtWord + letter;
    };

    Jambi.prototype.getBuiltWord = function () {
        return builtWord;
    };

    Jambi.prototype.destroyBuiltWord = function () {
        builtWord = "";
    };






    /*
		Handler for the JSHint function for the Javascript mode in the editor
	*/
    Jambi.prototype.jsHint = function () {
        function updateHints() {
            jambiEditor.operation(function(){
                for (var i = 0; i < widgets.length; ++i)
                    jambiEditor.removeLineWidget(widgets[i]);
                while (widgets.length) { widgets.pop(); }

                JSHINT(jambiEditor.getValue());
                $('#jsErrors').empty();
                for (var x = 0; x < JSHINT.errors.length; ++x) {
                    var err = JSHINT.errors[x];
                    if (!err) continue;

                    console.log("Error at line: " + err.line + " - " + err.reason);
                    $('#jsErrors').append("Error at line: " + err.line + " - " + err.reason);
                }
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
                console.log(data);
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
        return fs.readFileSync(dir,{"encoding":'utf8'});
    };


    Jambi.prototype.openFile = function () {
        $('#fileDialog').change(function (evt) {
            fs.readFile($(this).val(), "utf8", function (error, data) {
                if (error) {
                    alert(error);
                } else {
                    jModel.openFile("file" ,data, "html", "htmlmixed");
                }
            });
        });
        $('#fileDialog').trigger('click');
    };

    Jambi.prototype.saveFile = function () {
        if(jModel.onEditorPage()){
            var file = jModel.getActiveDocument();
            var fileLocation = jModel.getActiveDocument().fileLocation;
            if (fileLocation) {
                fs.writeFile(fileLocation, jambiEditor.doc.getValue(), function (err) {
                    if (err) {
                        alert(err);
                    } else {
                        // save animation
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
                        jModel.setDocLocation(fileLocation);

                        var filename = fileLocation.replace(/^.*[\\\/]/, '');
                        jModel.setDocName(filename);


                        var sysString = "/";
                        if(process.platform == "win32" || process.platform == "win64" ) {
                    		sysString = "\\";
                    	}
                        fileLocation = fileLocation.substring(0,fileLocation.lastIndexOf(sysString)+1);
                        $('#saveDialog').attr('nwworkingdir', fileLocation);

                        // save animation
                    }
                });
            });
        }
    };

    Jambi.prototype.saveUserSetting = function (setting, value) {

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

    /*
		Function made to populate the modal in Jambi
		There is one modal markup that gets populated via this function
	*/
    Jambi.prototype.createModal = function (modalTitle, modalSubtitle, modalContent, modalType, modalFunc, modalWidth) {
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

        // Open the modal
        jambi.openModal();

        // Set the click function of the modal to the function given in the parameters
        $('#modalButtonRight').click(function () {
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




    // Facebook Flow

    Jambi.prototype.runCommand = function(command) {
/*
        var ls = terminal.spawn(command, [])
        ls.stdout.on('data', function (data) {
            console.log(data.toString());
            return data.toString();
        });
*/
        shell.exec(command, function(code, output) {
            if(code !== 0) {
                console.log('Exit code:', code);
            }
            console.log(output);
            return output;
        });
    };


    Jambi.prototype.initFlow = function (projectLocation) {
        runCommand('cd ' + projectLocation);
        runCommand('/usr/local/bin/flow init');
    };

    Jambi.prototype.flowCode = function (fileLocation) {
        var filename = "jambi.fs";
        runCommand('cd ' + fileLocation);
        var reporting = runCommand('/usr/local/bin/flow ' + filename);
        return reporting;
    };




};

var jambi = new Jambi();
jambi.menuSetup();