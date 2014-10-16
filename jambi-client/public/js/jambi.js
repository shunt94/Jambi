function jambi() {


	function initJambi() {
		$('.editor-container').append('<textarea autocorrect="off" class="jambitextarea" autocapitalize="off" spellcheck="false" tabindex="0"></textarea>');
		$('.editor-container').append('<div id="editor" class="editor" data-linecount="1"><span class="cursor">|</span></div>');
	}

	
	return {
		test: function() {
				
		},	
		init: function() {
			initJambi();
		}
	}		
}