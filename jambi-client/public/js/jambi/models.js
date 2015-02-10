// To do: Move most of the multi-file code into Jambi.js and call from here, passing in params... clean up code

// Store the current document as a global variable in jambiModel, then you can save and change file without getting active file in DOM

// Projects stored with the write json plugin?
var jambiModel = function() {
	var jTimer = new jambiTimer('#jambi_timer_secs', '#jambi_timer_mins', '#jambi_timer_hours');
	var programTimer = new jambiTimer('#global_timer_secs', '#global_timer_mins', '#global_timer_hours');
	var currentDocid;
	var globalCounter = 1;
	var activeDocument;
	var activeProject;
	var json = require('json-update');
	var path = require('path');
	

	var Project = Backbone.Model.extend({
        url: 'projects.json'
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
		history_object: {},

		initialize: function () {
			this.set('id', globalCounter);
			globalCounter += 1;
		}
	});


	var AllDocuments = Backbone.Collection.extend({
		model: JambiDocument
	});

	var ProjectsCollection = Backbone.Collection.extend({
		model: Project,
		url: "projects.json"
	});

	var Projects = new ProjectsCollection();


	$.ajaxSetup({
		async: false
	});
	Projects.fetch({  
		success: function() {
//			console.log("JSON file load was successful", Projects);
		},
		error: function(){
			alert("Error! - Could not fetch project list!");
		}
	});
	$.ajaxSetup({
		async: true
	});




	programTimer.startTimer();

	var openDocuments = new AllDocuments();


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
	    documentModel.history_object = $.extend({}, document.hisotry_object, jambi.getJambiEditor().getHistory());
		documentModel.text = jambi.getJambiEditor().getValue();
		documentModel.line = jambi.getJambiEditor().getCursor().line;
		documentModel.col = jambi.getJambiEditor().getCursor().ch;
		documentModel.mode = jambi.getJambiEditor().getOption('mode');
	}

	function newDocument (filename, filecontents, filetype, filemode, fileLocation) {
		goToEditor();
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
		if(fileLocation) {
			jDoc.fileLocation = fileLocation;
		}


		populateTopBar(jDoc.id);  

		jambi.getJambiEditor().setValue(jDoc.text);
		jambi.getJambiEditor().setOption("mode", jDoc.mode);
		setDocOptions(jDoc);
		setActiveDocument();
		fileEventHandlers();

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
				populateTopBar(activeDocument);
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
		newDocument (filename, filecontents, filetype, filemode);
	}

	function setDocOptions(model) {
		if(model) {
		    jambi.getJambiEditor().setValue(model.text);
		    jambi.getJambiEditor().clearHistory();
		    if(!($.isEmptyObject(model.history_object))) {
		        jambi.getJambiEditor().setHistory(model.history_object);
		    }
			jambi.getJambiEditor().focus();
			jambi.getJambiEditor().setCursor(model.line, model.col);
			jambi.getJambiEditor().setOption("mode", model.mode);
			jambi.getJambiEditor().scrollIntoView();
		}
	}
	
	
	function openProject(name, projectData) {
	    if(projectData) {
        	// if project open save all open files
        	if(activeProject !== 0) {
                // Save all files to disk...
        	}
        	
        	// else 
        	// close all current docuements, asking to save them first... make a new method (if unsaved/ isSaved() )
            for(var i = 0; i<= openDocuments.length; i++) {
        	    openDocuments.pop();
        	}
            
            var projectActiveDocument;
    
        	// For loop through all open files in that project 
        	for(var k = 0; k < projectData.openfiles.length; k++) {
            	// add files to openDocuments collection
            	var jDoc = new JambiDocument();
                var directory = projectData.root + projectData.openfiles[k].root;
                
                openDocuments.add(jDoc);
                
                
                jDoc.text = jambi.openFileByDir(directory);
                jDoc.title = projectData.openfiles[k].name;
                jDoc.mode = projectData.openfiles[k].mode;
                jDoc.line = projectData.openfiles[k].line;
                jDoc.col = projectData.openfiles[k].col;
                
                if(projectData.openfiles[k].active) {
                    projectActiveDocument = k;
                }
            
            }
            
        	// populate top bar 
        	if(projectActiveDocument !== undefined) {
        	    populateTopBar(openDocuments.at(projectActiveDocument).id);
        	    setDocOptions(openDocuments.at(projectActiveDocument));
        	}
        	else {
            	var jDoc = new JambiDocument();
            	openDocuments.add(jDoc);
            	populateTopBar(openDocuments.at(0).id);
        	}
        	goToEditor();
    	}
	}



    function populateProjects() {
        if(Projects.length > 0) {
            var activeProjectIndex = Projects.at(0).attributes.active;
    		// Render Projects into page
    		for(var i = 1; i < Projects.length; i++) {
    			var active = "";
    			if(i === activeProjectIndex) {
    			    activeProject = Projects.at(i).attributes.project;
    				active = "active";
    			}
    			
    			// Make project file list html
    			//var openFilesHTML = "";
    
    /*
    			
    			for(var k = 0; k < Projects.at(i).attributes.project.openfiles.length; k++) {
        			openFilesHTML = openFilesHTML + 
        			'<div class="project-file"' +
        			    'data-projectindex="' + i + 
            			'" data-fileindex="' + k + 
                        '">' + 
            			Projects.at(i).attributes.project.openfiles[k].name + '</div>';
    			}
    			
    */
    			$('#projects').append('<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 project" data-projectindex="' +
    			                        i + '"' +
                                        'data-name="' + Projects.at(i).attributes.project.name + '">' +
    									'<div class="card-container">' +
        									'<div class="card">' +
            									'<div class="face front">' +
            									    '<div class="project-image"></div>' + 
            									    '<div class="project-name">' + Projects.at(i).attributes.project.name + 
            									        ' <i class="fa fa-info-circle project-info"></i></div>' +
            									'</div>' +
            									'<div class="face back">' +
    
            									'</div>' +
            									'</div>' + 
        									'</div>' +
    									'</div>');
    		}
    		
    		$('#projects').append('<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 project">' +
        		'<div class="card-container">' +
            		'<div class="card">' +
                		'<div class="face front">' +
                            '<div class="add-project"><i class="fa fa-plus"></i></div>' +
                            '<div class="project-name">Add Project</div>' +
                		'</div>' +
                        '<div class="face back">' +
                    		'Project Details' +
                		'</div>' +
                		'</div>' + 
            		'</div>' +
        		'</div>');
        		
        		
            $('.project').dblclick(function() {
                var projectIndex = $(this).data("projectindex");
                activeProject = Projects.at(projectIndex).attributes.project;
                openProject($(this).data("name"), activeProject);
            });
    		
    		$(document).click(function(event){
    			if(!$(event.target).closest('.card-container').length) {
    				$('.card').removeClass('flipped');
    			}
    		});
    		
    		$('.project-info').click(function(){
    			$('.card').removeClass('flipped');
    			$(this).parent().parent().parent().addClass('flipped');       
    		});
		}

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






    // Routers

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
		jambi.renderEditor();
		setActiveDocument();
		populateTopBar(activeDocument);
		setDocOptions(openDocuments.get(activeDocument));
	});

	router.on('route:projects', function() {
		setActiveDocument();
		if(activeDocument !== undefined) {
			saveCurrentDocument(openDocuments.get(activeDocument));
		}
		projectView.render();
		populateProjects();
    });


	router.on('route:showcase', function() {
		setActiveDocument();
		if(activeDocument !== undefined) {
			saveCurrentDocument(openDocuments.get(activeDocument));
		}
		showcaseView.render();
	});



	Backbone.history.start();

	jambi.initCodeMirror();

	// if in project then start home else start project
	window.location.replace("#/editor");


	return {
		newFile: function() { newDocument (); },
		openFile: function(a,b,c,d) { openFile(a,b,c,d); },
		closeCurrentDoc: function() { closeCurrentDocument(); },
		closeAllDocs: function() { removeAllDocuments (); }
	};
};

var jModel = new jambiModel();