(function() {
	
var Project = Backbone.Model.extend({
	projectLocation: "/",
	files: []
});

var File = Backbone.Model.extend({
	fileName: "untitled",
	fileType: ".test",
	fileLoc: "/"
});

var JambiDocument = Backbone.Model.extend({
	text: "",
	type: ""
});


function connectToServer() {
	$('#jambiStatus').html('Connecting <i class="fa fa fa-spinner fa-spin"></i>');
	$.ajax({
		type: 'GET',
		url: "http://jambi.herokuapp.com/api/jambi",
		async: true,
		contentType: "application/json",
		dataType: 'json',
		success: function(data) {
			$('#jambiStatus').html(data.jambi.status);
		},
		error: function(e) {
			$('#jambiStatus').html("Failed to connect to Jambi Server");
		}
	});
	setTimeout(function(){connectToServer()},3600000);
}



var EditorView = Backbone.View.extend({
	el: '#jambi-body',
	render: function(){
		var template = _.template($('#user-edit-template').html(), {});
		this.$el.html(template);
		
		
		var jTimer = new jambiTimer();
	
		$('#jambiStartTimer').click(function(){
			jTimer.startTimer();
		});
		
		$('#jambiStopTimer').click(function(){
			jTimer.stopTimer();
		});
		
		function startTime() {
		    var today=new Date();
		    var h=today.getHours();
		    var m=today.getMinutes();
		    m = checkTime(m);
		    $('#jambiClock').html(h+"<span id='jambiClockColon'>:</span>"+m);
		    var t = setTimeout(function(){startTime()},6000);
		}
		
		function checkTime(i) {
		    if (i<10) {i = "0" + i};  // add zero in front of numbers < 10
		    return i;
		}
		
		startTime();
		connectToServer();
		
		
		
	}
});

var ProjectView = Backbone.View.extend({
	el: '#jambi-body',
	render: function(){
		var template = _.template($('#projects-template').html(), {});
		this.$el.html(template);
	}
});

var ShowcaseView = Backbone.View.extend({
	el: '#jambi-body',
	render: function(){
		var template = _.template($('#showcase-template').html(), {});
		this.$el.html(template);
	}
});

var firstLoad = true;
		
		
// Backbone




var Router = Backbone.Router.extend({
	routes: {
		'home': 'home',
		'project': 'projects',
		'showcase': 'showcase'
	}
});


var editorView = new EditorView();
var projectView = new ProjectView();
var showcaseView = new ShowcaseView();

var router = new Router();
router.on('route:home', function() {
	editorView.render();
	if(firstLoad) {
		jambi.initCodeMirror();
		firstLoad = false;
	}
});

router.on('route:projects', function() {
	projectView.render();
});

router.on('route:showcase', function() {
	showcaseView.render();
});

Backbone.history.start();

window.location.replace("#/home");


})();