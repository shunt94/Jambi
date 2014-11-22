var Jambi = function() {
	
	
	Jambi.prototype.menuSetup = function() {
		var jSetup = new jambiSetup();	
		jSetup.jambiMenu.file.fileSave.click = function() {
			jambi.saveFile();
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
		
		var jambiEditor = CodeMirror(document.getElementById('jambi-editor'), {
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
	
	
	
	Jambi.prototype.saveFile = function() {
		var textToWrite = $('#jambiEditor').val();
		var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
		var fileNameToSaveAs = "untitled.html";
	
		var downloadLink = document.createElement("a");
		downloadLink.download = fileNameToSaveAs;
		downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
		downloadLink.click();
	}

}


