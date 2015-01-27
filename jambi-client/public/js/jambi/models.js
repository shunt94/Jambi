// To do: Move most of the multi-file code into Jambi.js and call from here, passing in params... clean up code

// Store the current document as a global variable in jambiModel, then you can save and change file without getting active file in DOM

// Projects stored with the write json plugin?
var jambiModel = function() {
    var jTimer = new jambiTimer();
    var currentDocid;
    var globalCounter = 1;
    var activeDocument;
    var json = require('json-update');
    var projectOpen = false;
    
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
    
    function newDocument (filename, filecontents, filetype, filemode) {
        if(openDocuments.length !== 0) {
            currentDocid = $('.file.active').parents('.file-container').data("modelid");
            saveCurrentDocument(openDocuments.get(openDocuments.get(currentDocid)));
        }
        var jDoc = new JambiDocument();
        openDocuments.add(jDoc);
        
        
        // Set contents 
        if(filename) {
            jDoc.title = filename;
        }
        if(filecontents) {
            jDoc.text = filecontents;
        } 
        if(filetype) {
            jDoc.type = filetype;
        }
        if(filemode) {
            jDoc.mode = filemode;
        }
        
        
        populateTopBar(jDoc.id);    

        jambi.getJambiEditor().setValue(jDoc.text);
        jambi.getJambiEditor().setOption("mode", jDoc.mode);
        setActiveDocument();
        fileEventHandlers();
        goToEditor();
    }
    
    function closeDocument(docID) {
        setActiveDocument();
        saveCurrentDocument(openDocuments.get(activeDocument));
        var index = openDocuments.indexOf(openDocuments.get(docID));
        openDocuments.remove(openDocuments.get(docID));
        if(openDocuments.length >= 1) {
            if(activeDocument === docID) {
                if(index < 1) {
                    populateTopBar(openDocuments.at(index).id);
                } else {
                    if((index + 1) <= openDocuments.length) {
                        populateTopBar(openDocuments.at(index).id);                
                    }
                    else {
                        populateTopBar(openDocuments.at(index - 1).id);
                    }
                }
            }
            else {
                populateTopBar(activeDocument)
            }
            setActiveDocument();
            setDocOptions(openDocuments.get(activeDocument));
        }
        else {
            populateTopBar();
            goToProjects();
        }
    }
    
    function removeAllDocuments () {
        openDocuments.reset();
        populateTopBar();
        goToProjects();
    }
    
    function goToProjects() {
        window.location.replace('#/project');
    }
    
    function goToEditor() {
        window.location.replace('#/home');
    }
    
    function closeCurrentDocument() {
        setActiveDocument();
        saveCurrentDocument(openDocuments.get(activeDocument));
        openDocuments.remove(activeDocument);
        populateTopBar(findClosestDocument().data('modelid'));
    }
    
    function setActiveDocument() {
        activeDocument = $('.file.active').parents('.file-container').data("modelid");
    }
    
    function changeFile(fileToChange) {
        saveCurrentDocument(openDocuments.get(openDocuments.get(activeDocument)));
        var currentDoc = openDocuments.get(openDocuments.get(fileToChange.data('modelid')));
        populateTopBar(currentDoc.id);
        setDocOptions(currentDoc);
        setActiveDocument();
    }
    
    function changeFileById(file) {
        if(activeDocument || openDocuments.length > 1) {
            alert(openDocuments.length + " " + activeDocument);
            saveCurrentDocument(openDocuments.get(openDocuments.get(activeDocument)));
        }
        setDocOptions(file);
        populateTopBar(file.id);
        setActiveDocument();
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
    
    function populateTopBar(activeDocID) {
        var modelCount = openDocuments.length;
        var first;
        if (!activeDocID) {
            first = true;
        }
        $('.file-container').remove();
        for(var i = 0; i < modelCount; i++) {

            var jDoc = openDocuments.at(i);
            var active = "";
            if(jDoc.id === activeDocID || modelCount <= 1 || first) {
                active = "active";
                first = false;
            }
             var fileName = jDoc.title + '.' + jDoc.type;
             var appendedHTML =  '<li class="file-container" data-modelid=' + jDoc.id + '>' +
        						'<div class="file ' + active + '">' +
        							'<span class="filename">' + fileName + '</span>' +
        							'<span class="close"><i class="fa fa-times-circle"></i></span>' +
        						'</div>' +
        					'</li>';
           $('#file_ul').append(appendedHTML); 
        }
        fileEventHandlers();
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
            window.location.replace('#/home');
            newDocument();
        });
        
        $('.file-container').click(function() {
            window.location.replace('#/home');
            changeFile($(this));
        });
        
        $('.close').click(function() {
            closeDocument($(this).parents(".file-container").data('modelid'));
        });
    }
    
    function openFile(filename, filecontents, filetype, filemode) { 
        /*
if(openDocuments.length > 0) {
            alert(openDocuments.length);
            setActiveDocument();
        }
        var jDoc = new JambiDocument();
        
        
        openDocuments.add(jDoc);
        populateTopBar(jDoc.id);
        changeFileById(jDoc);
        goToEditor();
*/
        
        newDocument (filename, filecontents, filetype, filemode);
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
    
    
    function setDocOptions(model) {
        if(model) {
            jambi.getJambiEditor().focus();
            jambi.getJambiEditor().setValue(model.text);
        	jambi.getJambiEditor().setCursor(model.line, model.col);
        	jambi.getJambiEditor().setOption("mode", model.mode);
        	jambi.getJambiEditor().scrollIntoView();
    	}
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
    var firstLoad = true;
    
    router.on('route:home', function() {
    	editorView.render();
    	jambi.searchWeb();
    	if(firstLoad) {
    		jambi.initCodeMirror();
    		firstLoad = false;
    		setActiveDocument();
    	}
    	else {
    		jambi.renderEditor();
    		setDocOptions(document1);
    		setActiveDocument();
    	}
    });
    
    router.on('route:projects', function() {
        setActiveDocument();
        if(activeDocument !== undefined) {
    	    saveCurrentDocument(openDocuments.get(activeDocument));
        }
    	projectView.render();
    });
    
    router.on('route:showcase', function() {
        setActiveDocument();
        if(activeDocument !== undefined) {
            saveCurrentDocument(openDocuments.get(activeDocument));
        }
    	showcaseView.render();
    });
    
    Backbone.history.start();
    
    // if in project then start home else start project
    window.location.replace("#/home");
    
    
    return {
        newFile: function() { newDocument (); },
        openFile: function(a,b,c,d) { openFile(a,b,c,d); },
        closeCurrentDoc: function() { closeCurrentDocument(); },
        closeAllDocs: function() { removeAllDocuments (); }
    }
};

var jModel = new jambiModel();