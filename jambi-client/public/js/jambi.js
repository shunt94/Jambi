function Jambi() {

	function initJambi() {
		//setCursorBlink();
		setEventListeners();
		initScrollers();
		loadSettings();
		$('#jambiEditor').focus();
	}
	
	
	// Load user settings
	function loadSettings() {
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'public/css/user.css') );
	}
	

	
	// Input text at cursor position
	function insertAtCursor(texteditor, textInsert) {
	    if (texteditor.selectionStart || texteditor.selectionStart == '0') {
	        var startPos = texteditor.selectionStart;
	        var endPos = texteditor.selectionEnd;
	        texteditor.value = texteditor.value.substring(0, startPos)+ textInsert + texteditor.value.substring(endPos, texteditor.value.length);
	        texteditor.selectionStart = startPos + textInsert.length;
	        texteditor.selectionEnd = startPos + textInsert.length;
	    } else {
	        texteditor.value += textInsert;
	    }
	}
	
	 
	// Work around for scrollers	
	function initScrollers() {
		$('#jambiEditor').on('scroll', function () {
			updatePosition();
		});
	}	
	

	  // line numbers 
	  function lineNumbers() {
	  	  var rows = $('#jambiEditor').val().split("\n").length + 1;
		  $('#linecounter').empty();
		  if(rows <=1) {
			  $('#linecounter').append('1<br>');
		  }
		  else {
			  for(var k = 1; k<rows; k++) {
				  $('#linecounter').append(k + '<br>');
			  }
		  }
	  }
	
	// Update positions of document
	function updatePosition() {
		var scrollPos = document.getElementById('jambiEditor').scrollTop;
		$('#linecounter').scrollTop(scrollPos);
		$('#syntax-area').scrollTop(scrollPos);
	}
	
	
	// Set event listeners, all events should go in here
	function setEventListeners() {
		$('#jambiEditor').keydown(function(event) {
		   
		    // Tab
		  	if(event.keyCode == 9) { 
		 		event.preventDefault(); 	
		 		insertAtCursor(this, '    ');
		 	}
			lineNumbers(); 			
			updatePosition()
			getRowandCol();
			
		});
		 $('#jambiEditor').keyup(function(event) {
			  lineNumbers();
			  updatePosition();
			  getRowandCol();
			  
			  $('#syntax-area').text($('#jambiEditor').val()) 
			  Highlighter.highlight(document.getElementById('syntax-area'));
			  
		 });
	}
	
	
	
	// Row and Col
	function getRowandCol() {
		var editor = document.getElementById('jambiEditor');
	    var pos = 0;
	    if (editor.selectionStart) {
	        pos = editor.selectionStart;
	    } else if (document.selection) {
	        editor.focus();
	
	        var r = document.selection.createRange();
	        if (r == null) {
	            pos = 0;
	        } else {
	
	            var re = editor.createTextRange(),
	            rc = re.duplicate();
	            re.moveToBookmark(r.getBookmark());
	            rc.setEndPoint('EndToStart', re);
	
	            pos = rc.text.length;
	        }
	    }
	    $('#jambi-row').html(editor.value.substr(0, pos).split("\n").length);
	}

	
	
	
	
	
	
	
	return {
		init: function() {
			initJambi();
		}
	}
	
}