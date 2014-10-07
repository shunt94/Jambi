function countLines() {
	return $(".editor").data("linecount");
}

function incrementLine() {
	var lines = countLines();
	lines++;
	$(".editor").data("linecount", lines);
}

function decrementLine() {
	var lines = countLines();
	lines--;
	$(".editor").data("linecount", lines);
}

function divCount() {
	var length = $(".editor").children('br, p, div').length;
	if ($(".editor").html().length && !length) {
		length = 1;
	}
	var i;
	$(".line-counter").html("1 <br>")
	for (i = 2; i <= length; i++) {
		$(".line-counter").append(i + "<br>")
	}
}