// To do: Move most of the multi-file code into Jambi.js and call from here, passing in params... clean up code

(function() {
var jTimer = new jambiTimer();
var currentDocid;
var globalCounter = 1;

var Project = Backbone.Model.extend({
	projectLocation: "/",
	files: []
});

var JambiDocument = Backbone.Model.extend({
    id: 1,
	text: "",
	type: "html",
	line: 1,
	col: 1,
	mode: "htmlmixed",
	title: "untitlted",
	fileLocation: "",
	
	initialize: function () {
        this.set('id', globalCounter);
        globalCounter += 1;
    }
});


var AllDocuments = Backbone.Collection.extend({
     model: JambiDocument
});

var Projects = Backbone.Collection.extend({
   model: Project 
});

var documentToBeRendered;
var document1 = new JambiDocument();
var openDocuments = new AllDocuments();
openDocuments.add(document1);
populateTopBar();
fileEventHandlers();

// This function is taken from StackOverflow - http://stackoverflow.com/questions/8366733/external-template-in-underscore
function render(tmpl_name, tmpl_data) {
    if ( !render.tmpl_cache ) { 
        render.tmpl_cache = {};
    }
    if ( ! render.tmpl_cache[tmpl_name] ) {
        var tmpl_dir = 'public/views';
        var tmpl_url = tmpl_dir + '/' + tmpl_name + '.html';
        var tmpl_string;
        $.ajax({
            url: tmpl_url,
            method: 'GET',
            dataType: 'html',
            async: false,
            success: function(data) {
                tmpl_string = data;
            },
            error: function(e) {
				console.log(e);
            }
		});
        render.tmpl_cache[tmpl_name] = _.template(tmpl_string);
    }
    return render.tmpl_cache[tmpl_name](tmpl_data);
}


function saveCurrentDocument(documentModel) {
	documentModel.text = jambi.getJambiEditor().getValue();
	documentModel.line = jambi.getJambiEditor().getCursor().line;
	documentModel.col = jambi.getJambiEditor().getCursor().ch;
	documentModel.mode = jambi.getJambiEditor().getOption('mode');
}

function newDocument () {
    var jDoc = new JambiDocument();
    openDocuments.add(jDoc);
    
    $('.file').removeClass('active');
    var fileName = jDoc.title + '.' + jDoc.type;
    var appendedHTML =  '<li class="file-container" data-modelid=' + jDoc.id + '>' +
    						'<div class="file active">' +
    							'<span class="filename">' + fileName + '</span>' +
    							'<span class="close"><i class="fa fa-times-circle"></i></span>' +
    						'</div>' +
    					'</li>';
                        
						
    $('#file_ul').append(appendedHTML);
    currentDocid = $('.file.active').parents('.file-container').data("modelid");
    saveCurrentDocument(openDocuments.get(openDocuments.get(currentDocid)));
    jambi.getJambiEditor().setValue(jDoc.text);
    jambi.getJambiEditor().setOption("mode", jDoc.mode);
    
    fileEventHandlers();
}

function closeDocument(fileToClose) {
    openDocuments.remove(openDocuments.get(fileToClose.parents(".file-container").data('modelid')));
    fileToClose.parents(".file-container").remove();
    
    if($('.file-container').length !== 0) {
        var fileToChange = $('.file-ul .file-container').last();
        fileToChange.find('.file').addClass('active');
        var currentDoc = openDocuments.get(openDocuments.get(fileToChange.data('modelid')));
        jambi.getJambiEditor().setValue(currentDoc.text);
        jambi.getJambiEditor().focus();
        setDocOptions(currentDoc);
        fileEventHandlers();
    }
    else {
        window.location.replace('#/project');
    }

}

function changeFile(fileToChange) {
    currentDocid = $('.file.active').parents('.file-container').data("modelid");
    $('.file').removeClass('active');
    fileToChange.find('.file').addClass('active');
    saveCurrentDocument(openDocuments.get(openDocuments.get(currentDocid)));
    openDocuments.get(openDocuments.get(currentDocid)).text = jambi.getJambiEditor().getValue();
    var currentDoc = openDocuments.get(openDocuments.get(fileToChange.data('modelid')));
    jambi.getJambiEditor().setValue(currentDoc.text);
    jambi.getJambiEditor().focus();
    setDocOptions(currentDoc);
}





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
			if(data.jambi.version !== jambi.getVersion()) {
				alert("Your version of Jambi is Out of Date");
			}
		},
		error: function(e) {
			$('#jambiStatus').html("Failed to connect to Jambi Server - " + e.statusText);
		}
	});
	setTimeout(function(){connectToServer();},3600000);
}


function populateTopBar() {
    var modelCount = openDocuments.length;
    var first = true;
    for(var i = 0; i < modelCount; i++) {
        var active = "";
        if(first) {
            active = "active";
            first = false;
        }
         var jDoc = openDocuments.at(i);
         var fileName = jDoc.title + '.' + jDoc.type;
         var appendedHTML =  '<li class="file-container" data-modelid=' + jDoc.id + '>' +
    						'<div class="file ' + active + '">' +
    							'<span class="filename">' + fileName + '</span>' +
    							'<span class="close"><i class="fa fa-times-circle"></i></span>' +
    						'</div>' +
    					'</li>';
       $('#file_ul').append(appendedHTML); 
    }
}

function fileEventHandlers() {
    $('#newfile_tab').unbind('click');
    $('#sidebar_toggle').unbind('click');
    $('.file-container').unbind('click');
    $('.close').unbind('click');
    
    $('#sidebar_toggle').click(function() {
        jambi.toggleSideMenu();  
    });

    $('#newfile_tab').click(function() {
        newDocument();
    });
    
    $('.file-container').click(function() {
        window.location.replace('#/home');
        documentToBeRendered = $(this);
        changeFile(documentToBeRendered);
    });
    
    $('.close').click(function() {
        closeDocument($(this));
    });
}

var EditorView = Backbone.View.extend({
	el: '#jambi-body',
	render: function(){
		this.$el.html(render('editor', {}));
	
		$('#jambiStartTimer').click(function(){
			jTimer.startTimer();
		});
		
		$('#jambiStopTimer').click(function(){
			jTimer.stopTimer();
		});
		
		
		$('#jshintcode').click(function() {
			jambi.jsHint();
		});
		connectToServer();

	}
});

var ProjectView = Backbone.View.extend({
	el: '#jambi-body',
	render: function(){
		this.$el.html(render('projects', {}));
	}
});

var ShowcaseView = Backbone.View.extend({
	el: '#jambi-body',
	render: function(){
		this.$el.html(render('showcase', {}));
	}
});

var firstLoad = true;
		
		
function setDocOptions(model) {
    jambi.getJambiEditor().setValue(model.text);
	jambi.getJambiEditor().setCursor(model.line, model.col);
	jambi.getJambiEditor().setOption("mode", model.mode);
	jambi.getJambiEditor().scrollIntoView();
}




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
	jambi.searchWeb();
	if(firstLoad) {
		jambi.initCodeMirror();
		firstLoad = false;
	}
	else {
		jambi.renderEditor();
		setDocOptions(document1);
	}
	
});

router.on('route:projects', function() {
	saveCurrentDocument(document1);
	projectView.render();
});

router.on('route:showcase', function() {
	saveCurrentDocument(document1);
	showcaseView.render();
});

Backbone.history.start();

window.location.replace("#/home");


})();