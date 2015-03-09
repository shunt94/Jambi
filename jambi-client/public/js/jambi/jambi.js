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
        var jMenu = jSetup.jambiMenu;


        // File Submenu
        jMenu.file.fileNewSubmenu[0].click = function () {

        };
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
            window.location.replace("#/project");
        };

        jMenu.view.viewEditor.click = function () {
            window.location.replace("#/home");
        };

        jMenu.view.viewShowcase.click = function () {
            window.location.replace("#/showcase");
        };

        jMenu.tools.toolsFlowFlowCode.click = function () {
            if(jModel.getActiveDocument().mode === "javascript" && jModel.getActiveProject()) {
                jambi.initFlow(jModel.getActiveProject().root);
                jambi.flowCode(jModel.getActiveDocument().fileLocation, jModel.getActiveDocument().title);
            }
        };

        jMenu.tools.toolsLess.click = function () {

            if(jModel.getActiveDocument()) {
                var file = jModel.getActiveDocument();
                var fileNameWithoutType = file.title.substr(0, file.title.lastIndexOf('.'));
                jambi.compileLess(file.fileLocation + "/" + fileNameWithoutType + ".css");
            }
        };

        jMenu.tools.toolsBeautifyJS.click = function () {
            var activeDoc = jModel.getActiveDocument();
            if(activeDoc.mode === "javascript") {
                var beautify = require('js-beautify').js_beautify;
                var code = beautify(jambi.getJambiEditor().getValue(), { indent_size: jambi.getJambiEditor().tabSize });
                jambi.getJambiEditor().setValue(code);
            }
        };

        jMenu.tools.toolsBeautifyCSS.click = function () {
            var activeDoc = jModel.getActiveDocument();
            if(activeDoc.mode === "css") {
                var beautify = require('js-beautify').css;
                var code = beautify(jambi.getJambiEditor().getValue(), { indent_size: jambi.getJambiEditor().tabSize });
                jambi.getJambiEditor().setValue(code);
            }
        };

        jMenu.tools.toolsBeautifyHTML.click = function () {
            var activeDoc = jModel.getActiveDocument();
            if(activeDoc.mode === "htmlmixed") {
                var beautify = require('js-beautify').html;
                var code = beautify(jambi.getJambiEditor().getValue(), { indent_size: jambi.getJambiEditor().tabSize });
                jambi.getJambiEditor().setValue(code);
            }
        };



        // Themes

        jMenu.settings.settingsTheme.click = function () {
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
            name: "htmlmixed"
        };

        function betterTab(cm) {
            if (cm.somethingSelected()) {
                cm.indentSelection("add");
            } else {
                cm.replaceSelection(cm.getOption("indentWithTabs")? "\t":
                Array(cm.getOption("indentUnit") + 1).join(" "), "end", "+input");
            }
        }








        var dummy = {
        attrs: {
          color: ["red", "green", "blue", "purple", "white", "black", "yellow"],
          size: ["large", "medium", "small"],
          description: null
        },
        children: []
      };

      var tags = {
        "!top": ["top"],
        "!attrs": {
          id: null,
          class: ["A", "B", "C"]
        },
        top: {
          attrs: {
            lang: ["en", "de", "fr", "nl"],
            freeform: null
          },
          children: ["animal", "plant"]
        },
        animal: {
          attrs: {
            name: null,
            isduck: ["yes", "no"]
          },
          children: ["wings", "feet", "body", "head", "tail"]
        },
        plant: {
          attrs: {name: null},
          children: ["leaves", "stem", "flowers"]
        },
        wings: dummy, feet: dummy, body: dummy, head: dummy, tail: dummy,
        leaves: dummy, stem: dummy, flowers: dummy
      };

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
            }
        };

        jambi.renderEditor();





        // Instas


        jambi.setListeners();
    };

    Jambi.prototype.updateCursorPosition = function () {
        var cursorPos = jambiEditor.getCursor();
        $('#jambiLine').text(cursorPos.line + 1);
        $('#jambiColumn').text(cursorPos.ch + 1);
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

        jambiEditor.on("cursorActivity", function(e) {
            jambi.updateCursorPosition();
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


        function generateJambiContextMenus() {

            function doesFileExsit (tempfileLoc) {
                try { fs.statSync(tempfileLoc); return true }
                catch (er) { return false }
            }

            var code_menu = new gui.Menu();
            var clickedCard;

            code_menu.append(new gui.MenuItem({ label: 'Cut' }));
            code_menu.append(new gui.MenuItem({ label: 'Copy' }));
            code_menu.append(new gui.MenuItem({ label: 'Paste' }));
            code_menu.append(new gui.MenuItem({ type: 'separator' }));
            code_menu.append(new gui.MenuItem({ label: 'Goto this file' }));
            code_menu.append(new gui.MenuItem({ label: 'Generate all files'}));

            code_menu.items[4].click = function(e) {
                var selection = jambi.getJambiEditor().getSelection();
                if(jModel.getActiveDocument()) {
                    if(selection.match(/((\/)?)(\w)*(\/)(\w)*(.)(\w)*/) || selection.match(/(\w)*(-)?(\w)*(\.)(\w{1,4})/)) {
                        var filename = selection.substr(selection.lastIndexOf("/")+1, selection.length);
                        var fileLoc = jModel.getActiveDocument().fileLocation + selection.substr(0, selection.lastIndexOf("/"));
                        var filetype = jModel.checkFileTypes(filename.substr(filename.lastIndexOf(".")+1, filename.length));
                        var contents = "";
                        if(doesFileExsit(fileLoc + "/" + filename)) {
                            contents = jambi.openFileByDir(fileLoc + "/" + filename);
                        }

                        jModel.openFile(filename, contents, filetype, fileLoc + "/");
                    }
                } else {
                    var filename = selection.substr(selection.lastIndexOf("/")+1, selection.length);
                    var filetype = jModel.checkFileTypes(filename.substr(filename.lastIndexOf(".")+1, filename.length));
                    jModel.openFile(filename, "", filetype);
                }
            };


            code_menu.items[5].click = function (){
                var value = jambi.getJambiEditor().getValue();
                var files = value.match(/((\/)*?(-)?(\w))*(\.)(\w)*/g);

                for(var i = 0; i < files.length; i++) {
                    console.log(files[i]);
                }
            };




            $('#jambi-body').off("contextmenu");
            $('#jambi-body').on("contextmenu", '.editor-container' ,function(e){
               code_menu.popup(e.pageX, e.pageY);
               clickedCard = $(this);
               return false;
            });

        }

        generateJambiContextMenus();


        jambiAC.setMenuContext('html');

        var instaReady = false;


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

        jambiEditor.on("change", function(keyevent) {
            jambi.updateCursorPosition();
            setTimeout(function(){
                var currentActiveDoc = jModel.getActiveDocument();
                if(currentActiveDoc) {
                    if(currentActiveDoc.isSaved) {
                        //$('.file.active .filesaved i').removeClass("fa-circle-o").addClass("fa-circle");
                        //jModel.getActiveDocument().isSaved = false;
                        if(jModel.getActiveProject().flowInitialised && currentActiveDoc.mode === "javascript") {
                           delay(function(){
                                jambi.flowCode(currentActiveDoc.fileLocation, currentActiveDoc.title);
                                jambi.jsHint();

                            }, 700);
                        }
                    }
                }
            }, 500);


        });




       /*
 jambiEditor.on('keyup', function(editor, keyevent){
           if (!popupKeyCodes[(keyevent.keyCode || keyevent.which).toString()] && isNaN(String.fromCharCode(keyevent.which))) {
                if(jambiEditor.mode !== 'htmlmixed' || jambiEditor.mode !== 'xml') {
                    delay(function(){jambiEditor.showHint(keyevent);}, 800);
                }
            }
        });
*/

        jambiEditor.on("keydown", function(editor, keyevent) {
            var code = keyevent.keyCode;
            // if insta has been init then build string
            checkInstas(code, keyevent);




        });


    };


    Jambi.prototype.insertAtCursor = function (text) {
        jambi.getJambiEditor().replaceSelection(text);
    }



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
                    console.log("Error at line: " + err.line + " - " + err.reason);
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
                        if(false) { // if SFTP/ FTP then show
                            jambi.showNotification('Jambi', 'Successfully uploaded to server');
                        }
                        if(false) { //if less and auto compile is on
                            var fileNameWithoutType = file.title.substr(0, file.title.lastIndexOf('.'));
                            jambi.compileLess(file.fileLocation + fileNameWithoutType + ".css");
                        }
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



                        // save animation
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
            }
        );
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

    Jambi.prototype.flowCode = function (fileLocation, filename) {
        var oldText = jambi.getJambiEditor().getValue();
        if(fileLocation && filename) {
            if(!oldText.match(/(\/)(\*)(\s)(@flow)(\s)(\*)(\/)/)) {
                jambi.getJambiEditor().setValue("/* @flow */\n" + oldText);
            }
        }
        jambi.saveFile();
        if(fileLocation && filename) {
            var command = 'cd ' + '"' + fileLocation + '"' + ' && /usr/local/bin/flow ' + filename;
            shell.exec(command, function(code, output) {
                var flowResults = output.match(/(\:)(\d)*(\:)(\d)*(\,)(\d)*(\:)(\s)*((\w)*(\s)*)*/g);
                var flowFile = output.match(/(\/)(\w)*(.)(\w)*(:)/g);
                var errorType = "";
                var errorCol1;
                var errorCol2;
                var errorLine;
                var errorMessage;
                $('#flowcontent').empty();
                jambiEditor.clearGutter('test1');
                try{
                    if(flowResults.length > 1) {
                        for(var i=0; i<flowResults.length; i++) {

                            flowFile[i] = flowFile[i].substr(1, flowFile[i].length-2);

                            if(flowFile[i] === filename) {
                                var temp = flowResults[i].substr(1, flowResults[i].length);
                                var flowLine = temp.substr(0, temp.indexOf(":"));

                                var flowCol1 = temp.match(/(\d)*(\,)(\d)*/g)[0];

                                var col1 = flowCol1.substr(0, flowCol1.indexOf(","));
                                var col2 = flowCol1.substr(flowCol1.indexOf(",")+1, flowCol1.length);

                                try{
                                    var errorString = temp.match(/(:)(\s)(\w*)(\s)?((\w)*)?/)[0];
                                } catch(err){
                                    var errorString = "Error";
                                }

                                errorString = errorString.substr(1, errorString.length);


                                if(i % 2 === 0) {

                                    errorMessage = temp.match(/(\n)((\w)*(\s)*)*/g);
                                    errorType = errorString;
                                    errorCol1 = col1;
                                    errorCol2 = col2;
                                    errorLine = flowLine;
                                }

                                if(i % 2 === 1) {
                                   $('#flowcontent').append("Line " + errorLine + " Column " + errorCol1 + ", " +
                                                    errorCol2 + errorType + " - " + errorMessage  + " - " + errorString + '<br>');

                                    var from = {'line': parseInt(errorLine)-1, 'ch': parseInt(errorCol1) };
                                    var to = {'line': parseInt(errorLine)-1, 'ch': parseInt(errorCol2) };


                                    //jambiEditor.markText(from, to, {'css': "color: #fff"});
                                    //jambiEditor.addLineClass(errorLine-1, "background", "test");
                                    var gutterLine = parseInt(errorLine-1);

                                    var flowErrorMessage = "Line " + errorLine + " Column " + errorCol1 + ", " + errorCol2 +
                                        errorType + " - " + errorMessage  + " - " + errorString + '<br>';

                                    jambiEditor.setGutterMarker(gutterLine, "test1", makeMarker(flowErrorMessage));

                                    function makeMarker(error) {
                                      var marker = document.createElement("div");
                                      marker.className = "test";
                                      marker.setAttribute('data-error', error);
                                      marker.style.color = "#ff0000";
                                      marker.innerHTML = '<i class="fa fa-exclamation-circle"></i>';
                                      return marker;
                                    }
                                    jambiEditor.refresh();
                                }
                            }
                        }
                    }
                } catch(err) {
                    jambi.showNotification("Jambi Error", "Flow Error");
                }

                if($('#flowcontent').is(':empty')) {
                    $('#flowcontent').html("No Flow Errors!");
                }

                $('.test').off();
                $('.test').on('mouseover', function(){
                    alert($(this).data('error'));
                });
            });

        }
    };


    Jambi.prototype.vcStatus = function(div, vcType) {
        var command;
        var root = jModel.getActiveDocument().fileLocation;
        if(vcType === "git") {
            command = 'cd ' + root + ' &&  git status';
        }
        if(vcType === "hg") {
            command = 'cd ' + root + ' &&  hg status';
        }

        shell.exec(command, function(code, output) {
            console.log(output);
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
        if(vcType === "git") {
            command = 'cd ' + root + ' && git push';
        }
        if(vcType === "hg") {
            command = 'cd ' + root + ' && hg push';
        }

        shell.exec(command, function(code, output) {
            if(output){
                console.log(output);
                jambi.showNotification("Jambi VC", "Successfully Pushed");
            }
        });
    };


    Jambi.prototype.vcCommit = function (vcType, commitMsg) {
        var command;
        jambi.saveFile();
        var root = jModel.getActiveDocument().fileLocation;
        if(commitMsg) {
            if(vcType === "git") {
                command = 'cd ' + root + ' && git add ' + root + ' && git commit -m ' + '"' + commitMsg + '"';
            }
            if(vcType === "hg") {
                command = 'cd ' + root + ' && hg add ' + root + ' &&  hg commit -m ' + '"' + commitMsg + '"';
            }
        }
        else {
            if(vcType === "git") {
                command = 'cd ' + root + ' && git add ' + root + ' &&  git commit -m "Commiting changes to ' + jModel.getActiveDocument().title + '"';
            }
            if(vcType === "hg") {
                command = 'cd ' + root + ' && hg add ' + root + ' &&  hg commit -m "Commiting changes to ' + jModel.getActiveDocument().title + '"';
            }
        }

        shell.exec(command, function(code, output) {
            if(output){
                console.log(output);
                jambi.showNotification("Jambi VC", "Files Commited");
            }
        });
    };

    Jambi.prototype.vcClone = function (url, vcType) {
        var command;
        var root = jModel.getActiveProject().root;
        if(url) {
            if(vcType === "git") {
                command = 'cd ' + root + ' && git clone ' + url;
            }
            if(vcType === "hg") {
                command = 'cd ' + root + ' && git clone ' + url;
            }
        }

        shell.exec(command, function(code, output) {
            console.log(output);
        });
    };




    /* SASS/SCSS */
    Jambi.prototype.sass = function () {
        var sass = require('node-sass');
        var currentFile = jModel.getActiveDocument();
        var fileName = currentFile.fileLocation;
        sass.render({
            file: fileName,
            success: function(result) {
                // result is an object: v2 change
                console.log(result.css);
                console.log(result.stats);
                console.log(result.map)
            },
            error: function(error) {
                // error is an object: v2 change
                console.log(error.message);
                console.log(error.code);
                console.log(error.line);
                console.log(error.column); // new in v2
            },
            outputStyle: 'nested'
        });
    };


	Jambi.prototype.templateTest = function () {

	};


};

var jambi = new Jambi();
jambi.menuSetup();