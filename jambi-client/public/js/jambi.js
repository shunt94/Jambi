var Jambi = function() {
	
	var jSetup = new jambiSetup();
	var jambiEditor;
	
	var currentFileDir;
	
	var fs = require('fs');
	
	
	Jambi.prototype.menuSetup = function() {
		jSetup.jambiMenu.file.fileSave.click = function() {
			jambi.saveFile();
		}
		jSetup.jambiMenu.file.fileSaveAs.click = function() {
			jambi.saveFileAs();
		}	
		jSetup.jambiMenu.file.fileOpen.click = function() {
			jambi.openFile();
		}
		jSetup.jambiMenu.file.fileNewSubmenu[0].value.click = function() {
			jambi.newFile();
		}
		jSetup.jambiMenu.file.fileClearSettings.click = function() {
			storedb('userSettings').remove();
		}		
	}
	
	
	Jambi.prototype.initCodeMirror = function() {
		// User Settings
		var codeMirrortheme;
		var currentProject;
		
		
		// Find user settings using storeDB
		storedb('userSettings').find({"setting":"theme"},function(err,result){
		  if(err){
		  	console.log("Could not find theme");
		  	codeMirrortheme = "ambiance";
		  } else {
			  codeMirrortheme = result[0].setTo;
			  var newTheme = eval(' result[0].setTo '); // CHANGE THIS ASAP - IT's HORRIBLE!!!!
			  $("#themeselector option").filter(function() {
				    return $(this).text() == newTheme; 
			  }).prop('selected', true);
		  }
		});
	
		
		// Create code mirror
		var mixedMode = {
		    name: "htmlmixed",
		    scriptTypes: [{matches: /\/x-handlebars-template|\/x-mustache/i,
		       mode: null},
		      {matches: /(text|application)\/(x-)?vb(a|script)/i,
		       mode: "vbscript"}]
		  };
		  
		var foldLine = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
		jambiEditor = CodeMirror(document.getElementById('jambi-editor'), {
		  mode:  mixedMode,
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
		jambiEditor.on("keyup", function(e){
//			jambiEditor.showHint(e);
		});
		jambiEditor.focus();
		

		
		// Instas
		
		// if $ is detected then init Insta
		


		
		function insertAtCursor(text) {
			jambiEditor.replaceSelection(text);
		}
		
		
		
		
		
		
		
		
		/*
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
		*/
		
		

		
		
		
		$('#themeselector').on('change', function() {
			var theme = $('#themeselector option:selected').text();
			jambiEditor.setOption("theme", theme);
			
			storedb('userSettings').remove({"setting":"theme"},function(err){});
			
			storedb('userSettings').insert({"setting":"theme","setTo": theme},function(err,result){
			  if(err){
			    console.log("User Settings could not be saved..");
			    console.log(err);
			  } else {
				console.log("User Settings Saved.. Deleting old data");  
			  }
			});
			
		});
		
		
		$('#modeSelector').on('change', function() {
			var mode = $( "#modeSelector option:selected" ).attr('data-mode');
			jambiEditor.setOption("mode", mode);
		});
	}
	
	Jambi.prototype.newFile = function() {
		console.log("Adding new file");
		
		// Create new instance of Editor
		
	
		
		// Set Editor to visible and others to hidden
		
	
		
		// Add new file tab to top bar
		
	}
	
	
	
	
	Jambi.prototype.openFile = function() {
		$('#fileDialog').change(function(evt) {
			fs.readFile($(this).val(), "utf8", function(error, data) {
				if(error) {
					alert(error);
				}
				else{ 
					jambiEditor.doc.setValue(data);
				}
			});
		});
		$('#fileDialog').trigger('click'); 	
	}
	
	Jambi.prototype.saveFile = function(fileName) {
		if(currentFileDir) {
			fileName = currentFileDir;
			fs.writeFile(fileName, jambiEditor.doc.getValue(), function(err) {
			    if(err) {
			        alert(err);
			    } else {
			        console.log("The file was saved!");
			    }
			}); 
		}
		else {
			this.saveFileAs();
		}
	}
	
	Jambi.prototype.saveFileAs = function() {
		var textToWrite = jambiEditor.doc.getValue();
		var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
		
		// If file already has a name, use that, else use untitled
		var fileNameToSaveAs = "untitled.html";
	
		var downloadLink = document.createElement("a");
		downloadLink.download = fileNameToSaveAs;
//		currentFileDir = fileNameToSaveAs;
		downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
		console.log(downloadLink);
		downloadLink.click();
	}
	
	Jambi.prototype.saveUserSetting = function(setting, value) {
			
	}

}


