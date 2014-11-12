function addSpan(txt, spanType) {
	$('#test').append("<span class="+spanType+">"+txt+"</span>");
}; 



function lex()  {
	var strReg1 = /"(.*?)"/g,
	    strReg2 = /'(.*?)'/g,
	    specialReg = /\b(new|var|if|do|function|while|switch|for|foreach|in|continue|break)(?=[^\w])/g,
	    specialJsGlobReg = /\b(document|window|Array|String|Object|Number|\$)(?=[^\w])/g,
	    specialJsReg = /\b(getElementsBy(TagName|ClassName|Name)|getElementById|typeof|instanceof)(?=[^\w])/g,
	    specialMethReg = /\b(indexOf|match|replace|toString|length)(?=[^\w])/g,
	    specialPhpReg  = /\b(define|echo|print_r|var_dump)(?=[^\w])/g,
	    specialCommentReg  = /(\/\*.*\*\/)/g,
	    inlineCommentReg = /(\/\/.*)/g;
	
	var htmlTagReg = /(&lt;[^\&]*&gt;)/g;
	
	var sqlReg = /\b(CREATE|ALL|DATABASE|TABLE|GRANT|PRIVILEGES|IDENTIFIED|FLUSH|SELECT|UPDATE|DELETE|INSERT|FROM|WHERE|ORDER|BY|GROUP|LIMIT|INNER|OUTER|AS|ON|COUNT|CASE|TO|IF|WHEN|BETWEEN|AND|OR)(?=[^\w])/g;
	

	    var string = $('.editor').html(),
	    parsed = string.replace(strReg1,'<span class="string">"$1"</span>');
	    parsed = parsed.replace(strReg2,"<span class=\"string\">'$1'</span>");
	    parsed = parsed.replace(specialReg,'<span class="special">$1</span>');
	    parsed = parsed.replace(specialJsGlobReg,'<span class="special-js-glob">$1</span>');
	    parsed = parsed.replace(specialJsReg,'<span class="special-js">$1</span>');
	    parsed = parsed.replace(specialMethReg,'<span class="special-js-meth">$1</span>');
	    parsed = parsed.replace(htmlTagReg,'<span class="special-html">$1</span>');
	    parsed = parsed.replace(sqlReg,'<span class="special-sql">$1</span>');
	    parsed = parsed.replace(specialPhpReg,'<span class="special-php">$1</span>');
	    parsed = parsed.replace(specialCommentReg,'<span class="special-comment">$1</span>');
	    parsed = parsed.replace(inlineCommentReg,'<span class="special-comment">$1</span>');
		console.log(string);
	    $('.editor').html(parsed);


}