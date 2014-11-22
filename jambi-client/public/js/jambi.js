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
	}
	
	
	Jambi.prototype.initCodeMirror = function() {
	
		
	
		
		// Create code mirror
		var mixedMode = {
		    name: "htmlmixed",
		    scriptTypes: [{matches: /\/x-handlebars-template|\/x-mustache/i,
		       mode: null},
		      {matches: /(text|application)\/(x-)?vb(a|script)/i,
		       mode: "vbscript"}]
		  };
		
		jambiEditor = CodeMirror(document.getElementById('jambi-editor'), {
		  mode:  mixedMode,
		  theme: "monokai",
		  lineWrapping: true,
		  lineNumbers: true,
		  tabSize: 4,
		  indentUnit: 4,
		  indentWithTabs: true,
		  autoCloseTags: true
		});
		
		jambiEditor.focus();
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

}


