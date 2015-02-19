var jambiModel = function() {
	var jTimer = new jambiTimer('#jambi_timer_secs', '#jambi_timer_mins', '#jambi_timer_hours');
	var programTimer = new jambiTimer('#global_timer_secs', '#global_timer_mins', '#global_timer_hours');
	var currentDocid;
	var globalCounter = 1;
	var activeDocument;
	var activeProject;

	var isEditorOpen = false;


	var Project = Backbone.Model.extend({
        "project": {
    	    "name": "",
        	"root": "",
        	"openfiles": [],
        	"currentfile": {}
        }
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

		/* check that file is not already open */
		var isDocOpen = false;
		var openFile;
		for(var i = 0; i < openDocuments.length; i++) {
			if(fileLocation === openDocuments.at(i).fileLocation) {
				isDocOpen = true;
				openFile = openDocuments.at(i);
			}
		}
		if(!isDocOpen) {
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
		} else {
			changeFileById(openFile);
		}

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
		closeDocument(activeDocument);
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

		$('#sidebar_toggle').on('click', function() {
			jambi.toggleSideMenu();
		});

		$('#newfile_tab').on('click', function() {
			window.location.replace('#/home');
			newDocument();
		});

		$('.file-container').on('click', function() {
			window.location.replace('#/home');
			changeFile($(this));
		});

		$('.close').on('click', function() {
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
                jDoc.fileLocation = directory;

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

	function onDropEvents(){
        window.ondragover = function(e) { e.preventDefault(); return false };
        window.ondrop = function(e) { e.preventDefault(); return false };

        var holder = document.getElementById('fileHoverBar');
        holder.ondragover = function () { return false; };
        holder.ondragleave = function () { return false; };
        holder.ondrop = function (e) {
          e.preventDefault();

          for (var i = 0; i < e.dataTransfer.files.length; ++i) {

            if(e.dataTransfer.files[i].name.indexOf('.') !== -1) {
                var file            = e.dataTransfer.files[i].path;
                var filecontents    = jambi.openFileByDir(file);
                var filename        = e.dataTransfer.files[i].name;
                var filetype        = filename.match(/\.[^.]+$/).toString();

                filetype = filetype.substr(1);
                filename = filename.substring(filename.lastIndexOf('/')+1, filename.indexOf('.'));

                newDocument(filename,filecontents,filetype,checkFileType(filetype),file);
            }
          }
          return false;
        };
    }

    onDropEvents();


    function checkFileType(fileTypeString) {
        switch(fileTypeString) {
            case "html":
                return "htmlmixed";
            case "js":
                return "javascript";
			case "json":
				return "javascript"
        }
    }




    function populateProjects() {
        $('#projects').empty();
        if(Projects.length > 0) {
            var activeProjectIndex = Projects.at(0).attributes.active;
    		// Render Projects into page
    		for(var i = 1; i < Projects.length; i++) {
    			var active = "";
    			if(i === activeProjectIndex) {
    			    activeProject = Projects.at(i).attributes.project;
    				active = "active";
    			}

    			$('#projectsTable > tbody:last').append('<tr class="project" data-name="' + Projects.at(i).attributes.project.name +
    			'" data-projectindex="' + i + '">' +

    			'<td>' + Projects.at(i).attributes.project.name + '</td>' +
    			'<td>' + Projects.at(i).attributes.project.root + '</td>' +
    			'<td>' + '' + '</td>' +

    			'</tr>');



    			/*
$('#projects').append('<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 project" data-projectindex="' +
    			                        i + '"' +
                                        'data-name="' + Projects.at(i).attributes.project.name + '">' +
    									'<div class="card-container">' +
        									'<div class="card project-card">' +
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
*/
    		}

    		$('.projects').append(jambifs.readHTML('public/views/addProjectTemplate.html'));


            $('.project').dblclick(function() {
                var projectIndex = $(this).data("projectindex");
                activeProject = Projects.at(projectIndex).attributes.project;
                openProject($(this).data("name"), activeProject);
            });

    		$(document).on('click', function(event){
    			if(!$(event.target).closest('.card-container').length) {
    				$('.card').removeClass('flipped');
    			}
    		});

    		$('.project-info').on('click', function(){
    			$('.card').removeClass('flipped');
    			$(this).parent().parent().parent().addClass('flipped');
    		});


    		$('#addProject').on('click', function() {
    		    if($('#addProjectName').val() && $('#addProjectLocation').val()) {
                    addProject($('#addProjectName').val(), $('#addProjectLocation').val());
                }
    		});

            $('#closeAddProject').on('click', function() {
               $('#addprojectcard').fadeOut();
    		});

    		$('#addprojectcard').hide();


    		$('#addProject_selectLocation').on('change', function (event) {
                var fileLocation = $(this).val();
                $('#addProjectLocation').val(fileLocation);
            });
		}

    }


    function addProject(name, root) {
        var newProject = new Project({
            "project": {
        	    "name": name,
            	"root": root,
            	"openfiles": [],
            	"currentfile": {}
            }
        });
        Projects.add(newProject);

        var projectsJSON;

        jambifs.readJSON('projects.json', function(err, data){
            projectsJSON = data;
            projectsJSON[Projects.length-1] = newProject.attributes;
            jambifs.writeJSON('projects.json', JSON.stringify(projectsJSON));
        });



        populateProjects();

        /*
var projectID = Projects.length-1;
        var activeProject = Projects.at(projectID).attributes.project;
        openProject($('.project [data-projectindex="' + projectID + '"]').data("name"), activeProject);
*/
    }



    function generateProjectsContextMenu() {
        var gui = jSetup.gui;
        var card_menu = new gui.Menu();
        var project_menu = new gui.Menu();
        var clickedCard;

        card_menu.append(new gui.MenuItem({ label: 'Open' }));
        card_menu.append(new gui.MenuItem({ label: 'Edit...' }));
        card_menu.append(new gui.MenuItem({ label: 'Duplicate' }));
        card_menu.append(new gui.MenuItem({ label: 'Delete...' }));
        card_menu.append(new gui.MenuItem({ type: 'separator' }));
        card_menu.append(new gui.MenuItem({ label: 'Change Image...' }));

        card_menu.items[0].click = function(e) {
            var projectIndex = clickedCard.data("projectindex");
            activeProject = Projects.at(projectIndex).attributes.project;
            openProject(clickedCard.data("name"), activeProject);
            console.log(clickedCard);
        };

        $('#jambi-body').on("contextmenu", '.project-card' ,function(e){
           card_menu.popup(e.pageX, e.pageY);
           clickedCard = $(this).parent().parent();
           return false;
        });


        project_menu.append(new gui.MenuItem({ label: 'Add Project...' }));

        project_menu.items[0].click = function(e) {
           // addProject("Project Test", "./");
           $('#addprojectcard').fadeIn();
        };

        $('#jambi-body').on("contextmenu", function(e){
           project_menu.popup(e.pageX, e.pageY);
           return false;
        });
    }



    var EditorView = Backbone.View.extend({
		el: '#jambi-body',
		render: function(){
			this.$el.html(render('editor', {}));
			$('#jambi-body').off("contextmenu");

			$('#jambiStartTimer').on('click', function(){
				jTimer.startTimer();
			});

			$('#jambiStopTimer').on('click', function(){
				jTimer.stopTimer();
			});

			$('#jshintcode').on('click', function() {
				jambi.jsHint();
			});
			connectToServer();
			$('#jambi-editor').css('font-size', jambi.getFontSize());


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
			$('#jambi-body').off("contextmenu");
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
		isEditorOpen = true;
	});

	router.on('route:projects', function() {
		setActiveDocument();
		if(activeDocument !== undefined) {
			saveCurrentDocument(openDocuments.get(activeDocument));
		}
		projectView.render();
		populateProjects();
		isEditorOpen = false;
		generateProjectsContextMenu();
    });


	router.on('route:showcase', function() {
		setActiveDocument();
		if(activeDocument !== undefined) {
			saveCurrentDocument(openDocuments.get(activeDocument));
		}
		showcaseView.render();

		isEditorOpen = false;
	});



	Backbone.history.start();

	jambi.initCodeMirror();

	// if in project then start home else start project
	window.location.replace("#/project");




	return {
		newFile: function() { newDocument (); },
		openFile: function(a,b,c,d) { openFile(a,b,c,d); },
		closeCurrentDoc: function() { closeCurrentDocument(); },
		closeAllDocs: function() { removeAllDocuments (); },
		getActiveDocument: function() { return openDocuments.get(activeDocument); },
		setDocLocation: function(loc) { openDocuments.get(activeDocument).fileLocation = loc; },
		setDocName: function(name) { openDocuments.get(activeDocument).title = name; populateTopBar(activeDocument); },
		onEditorPage: function() { return isEditorOpen; },
		getActiveProject: function() { return activeProject; }
	};
};

var jModel = new jambiModel();




