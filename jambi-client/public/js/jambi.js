function Jambi() {

	function initJambi() {
		//setCursorBlink();
		lineCounter();
		loadSettings();
		Insta();
	}
	
	// Get user settings
	function loadSettings() {
		// ...
		// ...
		$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'public/css/user.css') );
	}
	
	// Instas - Change Code
	function Insta() {
		var textarea = document.getElementById("codeArea");
		var snippets = {
		    '$html': '<!DOCTYPE html>\n<html>\n<head>\n    <title></title>\n</head>\n<body>\n\n</body>\n</html>'
		}
		
		
		var checkCaps = function(e){
		  if (e.keyCode != 13) return;
		  //e.preventDefault();
		  var prepend = "";
		  var string = "";
		  var pos = textarea.selectionStart;
		  var text = textarea.value.split("");
		  while (pos) {
		    char = text.splice(pos-1,1);
		    
		      if (char == " " || char == "\n") {
		          prepend = char;
		          break;
		      }
		    string += char 
		    pos -= 1;
		  }
		  if (snippets[string.reverse()]) {
		      var start = text.splice(0, pos);
		      var end = text.splice(pos + string.length);
		      
		      textarea.value = start.join("") + prepend + snippets[string.reverse()] + prepend + text.join("") + end.join("");
		  }
		}
		
		
		textarea.addEventListener("keydown", checkCaps, false);
		    
		String.prototype.reverse=function(){return this.split("").reverse().join("");}


	}
	
	function loadInstas() {
		
	}
	
	function insertInsta() {

	}
	

	
	function setCursorBlink() {
	    var elem = $('#jambi-cursor');
	    setInterval(function() {
	        if (elem.css('visibility') == 'hidden') {
	            elem.css('visibility', 'visible');
	        } else {
	            elem.css('visibility', 'hidden');
	        }    
	    }, 500);
	};
	
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
	
	 
		
	
	function lineCounter() {		  
		  $('#codeArea').keydown(function(event) {
		    var $t = $(this);
		    // Tab
		  	if(event.keyCode == 9) { 
		 		event.preventDefault(); 	
		 		insertAtCursor(this, '    ');
		 	}
			lineNumbers(); 
		  });
		  
		  $('#codeArea').keyup(function() {
			  lineNumbers(); 
		  });
		  
		  // line numbers 
		  function lineNumbers() {
		  			  
		  	  var rows = $('#codeArea').val().split("\n").length + 1;

			  var i = rows;
			  $('#linecounter').empty();
			  if(i <=1) {
				  $('#linecounter').append('1<br>');
			  }
			  else {
				  for(var k = 1; k<i; k++) {
					  $('#linecounter').append(k + '<br>');
				  }
			  }
		  }
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	return {
		init: function() {
			initJambi();
		}
	}
	
}