var Jambi = function () {

	var fs = require('fs');
	var json = require('json-update');
	var jambiEditor;
	var currentFileDir;
	var version;
	

	readJambiSettings();


	function readJambiSettings() {
		json.load('jambi.json', function(err, data) {
			if(err) {
				alert("Failed to read Jambi settings");
				version = "1.0";
			}
			else {
				version = data.version;
			}
		});
	}


	Jambi.prototype.menuSetup = function () {
		var jSetup = new jambiSetup();
		
		jSetup.jambiMenu.file.fileSave.click = function () {
			jambi.saveFile();
		}
		jSetup.jambiMenu.file.fileSaveAs.click = function () {
			jambi.saveFileAs();
		}
		jSetup.jambiMenu.file.fileOpen.click = function () {
			jambi.openFile();
		}
		jSetup.jambiMenu.file.fileNewSubmenu[0].value.click = function () {
			jambi.newFile();
		}
		jSetup.jambiMenu.file.fileClearSettings.click = function () {
			function modalFunction() {
				storedb('userSettings').remove();
			}
			jambi.createModal("Remove user settings",
				"Are you sure you want to remove user settings?",
				"This will delete all custom settings you may have made",
				"Remove Settings",
				modalFunction)
		}
	}

	Jambi.prototype.getVersion = function () {
		return version;
	}

	Jambi.prototype.initCodeMirror = function () {
		// User Settings
		var codeMirrortheme = "ambiance";

		// Find user settings using storeDB
		storedb('userSettings').find({ "setting": "theme" }, function (err, result) {
			if (err) {
				console.log("Could not find theme");
			} else if (result[0] != null) {
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

		var foldLine = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
		jambiEditor = CodeMirror(document.getElementById('jambi-editor'), {
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
			styleActiveLine: true
		});

		jambiEditor.on("gutterClick", foldLine);
		jambiEditor.on("keyup", function (e) {
			//			jambiEditor.showHint(e);
		});
		
		jambiEditor.on("change", function(e) {
			updateCursorPosition();
		});
		
		jambiEditor.on("cursorActivity", function(e) {
			updateCursorPosition();
		});
		
		
		
		function updateCursorPosition() {
			var cursorPos = jambiEditor.getCursor();
			$('#jambiLine').text(cursorPos.line + 1);
			$('#jambiColumn').text(cursorPos.ch + 1);
		}
		
		jambiEditor.focus();



		// Instas

		// if $ is detected then init Insta




		function insertAtCursor(text) {
			jambiEditor.replaceSelection(text);
		}








		






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


		$('#modeSelector').on('change', function () {
			var mode = $("#modeSelector option:selected").attr('data-mode');
			jambiEditor.setOption("mode", mode);
		});
	}
	
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
		
	}

	Jambi.prototype.newFile = function () {
		console.log("Adding new file");

		// Create new instance of Editor



		// Set Editor to visible and others to hidden



		// Add new file tab to top bar

	}




	Jambi.prototype.openFile = function () {
		$('#fileDialog').change(function (evt) {
			fs.readFile($(this).val(), "utf8", function (error, data) {
				if (error) {
					alert(error);
				} else {
					jambiEditor.doc.setValue(data);
				}
			});
		});
		$('#fileDialog').trigger('click');
	}

	Jambi.prototype.saveFile = function (fileName) {
		if (currentFileDir) {
			fileName = currentFileDir;
			fs.writeFile(fileName, jambiEditor.doc.getValue(), function (err) {
				if (err) {
					alert(err);
				} else {
					console.log("The file was saved!");
				}
			});
		} else {
			this.saveFileAs();
		}
	}

	Jambi.prototype.saveFileAs = function () {
		var textToWrite = jambiEditor.doc.getValue();
		var textFileAsBlob = new Blob([textToWrite], {
			type: 'text/plain'
		});

		// If file already has a name, use that, else use untitled
		var fileNameToSaveAs = "untitled.html";

		var downloadLink = document.createElement("a");
		downloadLink.download = fileNameToSaveAs;
		//		currentFileDir = fileNameToSaveAs;
		downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
		console.log(downloadLink);
		downloadLink.click();
	}

	Jambi.prototype.saveUserSetting = function (setting, value) {

	}

	Jambi.prototype.createModal = function (modalTitle, modalSubtitle, modalContent, modalType, modalFunc) {
		if (modalType === undefined || modalType === null) {
			modalType = "Save";
		}
		if (modalFunc === undefined || modalFunc === null) {
			modalFunc = function () {
				alert("Modal has no function");
			}
		}
		
		$('#modalButtonRight').html(modalType);
		$('#modalTitle').html(modalTitle);
		$('#modalSubtitle').html(modalSubtitle);
		$('#modalContent').html(modalContent);
		

		location.href = "#jambiModal";

		$('#modalButtonRight').click(function () {
			modalFunc();
		});

	}
}