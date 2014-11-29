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



var EditorView = Backbone.View.extend({
	el: '#jambi-body',
	render: function(){
		var template = _.template($('#user-edit-template').html(), {});
		this.$el.html(template);
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