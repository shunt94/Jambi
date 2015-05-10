/* @flow */
/*
    Class: JambiModel
    Purpose: contains all of the methods needed to store documents, projects and has methods used for general model editing
*/
var jambiModel = function() {
    // set up variables

    // timers
	var jTimer = new jambiTimer('#jambi_timer_secs', '#jambi_timer_mins', '#jambi_timer_hours');
	var programTimer = new jambiTimer('#global_timer_secs', '#global_timer_mins', '#global_timer_hours');

	// set up global document vars
	var currentDocid;
	var globalCounter = 1;
	var activeDocument;
	var activeProject;

    // set editor open to false
	var isEditorOpen = false;

    // backbone base project model
	var Project = Backbone.Model.extend({
		"project": {
			"name": "",
			"root": "",
			"openfiles": [],
			"currentfile": {},
			"flowInitialised": false,
			"vc": {
				"vcInitialised": false,
				"vcType": "git",
				"vcURL": "",
				"vcUser": ""
			},
			"jTemplate": false,
			"ssh":  {
    		    "enabled" :	false,
    		    "server": "",
    		    "port": 22,
    		    "username": "",
    		    "password": ""
            }
		}
	});

    // backbone base document model
	var JambiDocument = Backbone.Model.extend({
		id: 1,
		text: "",
		line: 1,
		col: 1,
		mode: "htmlmixed",
		title: "untitlted.html",
		fileLocation: "",
		history_object: {},
		flowInitialised: false,
		isSaved: true,
		initialize: function () {
			this.set('id', globalCounter);
			globalCounter += 1;
		}
	});

    // set up a collection of all open documents
	var AllDocuments = Backbone.Collection.extend({
		model: JambiDocument
	});
    // set up a collection of projects from a json file
	var ProjectsCollection = Backbone.Collection.extend({
		model: Project,
		url: "projects.json"
	});
    // make new instance of projects
	var Projects = new ProjectsCollection();


	// Check to see if projects json exists
	$.ajaxSetup({
		async: false
	});
	Projects.fetch({
		success: function() {

		},
		error: function(){
			jambi.showNotification('Jambi - Error', 'Could not fetch projects');
		}
	});
	$.ajaxSetup({
		async: true
	});



    // start the Jambi timer
	programTimer.startTimer();

	// new instance of open documents
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

    /*
        Method: saveCurrentDocument
        Purpose: saves the current document state
    */
	function saveCurrentDocument(documentModel) {
    	try{
    		documentModel.history_object = $.extend({}, document.hisotry_object, jambi.getJambiEditor().getHistory());
    		documentModel.text = jambi.getJambiEditor().getValue();
    		documentModel.line = jambi.getJambiEditor().getCursor().line;
    		documentModel.col = jambi.getJambiEditor().getCursor().ch;
    		documentModel.mode = jambi.getJambiEditor().getOption('mode');
		} catch(e) {

		}
	}


    /*
        Method: newDocument
        Purpose: creates a new document and opens it
    */
	function newDocument (filename, filecontents, filemode, fileLocation) {
		goToEditor();

		/* check that file is not already open */
		var isDocOpen = false;
		var openFile;
		for(var i = 0; i < openDocuments.models.length; i++) {
			if(fileLocation === openDocuments.at(i).fileLocation && filename === openDocuments.at(i).title) {
				isDocOpen = true;
				openFile = openDocuments.at(i);
			}
		}
        // if not open
		if(!isDocOpen) {
			if(openDocuments.length !== 0) {
				currentDocid = $('.file.active').parents('.file-container').data("modelid");
				saveCurrentDocument(openDocuments.get(openDocuments.get(currentDocid)));
			}
			// new Jambi Document
			var jDoc = new JambiDocument();
			// add document to open documents
			openDocuments.add(jDoc);


			// Set contents
			if(filename) {
				jDoc.title = filename;
			}
			if(filecontents) {
				jDoc.text = filecontents;
			}
			if(filemode) {
				jDoc.mode = filemode;
			}
			if(fileLocation) {
				jDoc.fileLocation = fileLocation;
			}


			populateTopBar(jDoc.id);
			setDocOptions(jDoc);
			setActiveDocument();
			fileEventHandlers();

            // append to project if open
			if(activeProject) {
				var isFileInProject = false;
				for(var k = 0; k < activeProject.openfiles.length; k++) {
					if(fileLocation === activeProject.openfiles[k].root && filename === activeProject.openfiles[k].name) {
						isFileInProject = true;
					}
				}
				if(!(isFileInProject)) {
    				// add project to projects.json
					addFileToProjectJSON(filename, fileLocation, filemode);
				}
			}
		} else {
            // else go to that file
			changeFileById(openFile);
		}

		if(jDoc) {
		    return true;
		}
	}

    /*
        Method: addFileToProjectJSON
        Purpose: adds a file to projects.json
    */
	function addFileToProjectJSON(filename, fileLocation, filemode) {
		activeProject.openfiles.push(
			{"name": filename,"root":fileLocation,"mode":filemode,"col":0,"line":0,"active":true}
		);
		// save the json object
		saveProjectsJSON();
	}

    /*
        Method: closeDocument
        Purpose: closes the document given a document ID
    */
	function closeDocument(docID) {
    	// set active doc
		setActiveDocument();
		// save doc state
		saveCurrentDocument(openDocuments.get(activeDocument));
		// get index
		var index = openDocuments.indexOf(openDocuments.get(docID));
		if(activeProject) {
    		// remove doc from open docs in project.json
			for(var i = 0; i < activeProject.openfiles.length; i++) {
				if(activeProject.openfiles[i].root === openDocuments.get(docID).fileLocation &&
					activeProject.openfiles[i].name === openDocuments.get(docID).title) {
					activeProject.openfiles.splice(i, 1);
				}
			}
			// save projects.json
			saveProjectsJSON();
		}
        // remove document from open documents
		openDocuments.remove(openDocuments.get(docID));
		if(openDocuments.length >= 1) {
    		// populate top bar with doc ids - used for Jambi to know which doc to change to
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
    		// if no documents open, go to projects page
			populateTopBar();
			goToProjects();
		}
	}

    /*
        Method: removeAllDocuments
        Purpose: removes all open documents
    */
	function removeAllDocuments () {
    	// remove all the documents
		openDocuments.reset();
		// re populate the top bar
		populateTopBar();
		// go to project page
		goToProjects();
	}

    /*
        Method: goToProjects
        Purpose: navigate the browser to the projects page
    */
	function goToProjects() {
		window.location.replace('#/project');
	}

    /*
        Method: goToEditor
        Purpose: navigate to the editor page
    */
	function goToEditor() {
		window.location.replace('#/home');
	}

    /*
        Method: closeCurrentDocument
        Purpose: closes the active Document
    */
	function closeCurrentDocument() {
		closeDocument(activeDocument);
	}

    /*
        Method: setActiveDocument
        Purpose: sets the global active document
    */
	function setActiveDocument() {
    	// get the active document from the top bar
		activeDocument = $('.file.active').parents('.file-container').data("modelid");
		// if there is an active project with an active document
		if(activeProject && activeDocument) {
    		// and the active project has open files
			if(activeProject.openfiles.length > 0) {
				var activeIndex = -1;
				// set the projects active documents attributes
				for(var i = 0; i < activeProject.openfiles.length; i++){
					activeProject.openfiles[i].active = false;
					if(openDocuments.get(activeDocument).fileLocation === activeProject.openfiles[i].root &&
					   openDocuments.get(activeDocument).title === activeProject.openfiles[i].name) {
						activeIndex = i;
					}
				}
				if(activeIndex >= 0) {
					activeProject.openfiles[activeIndex].active = true;
					// save project.json
					saveProjectsJSON();
				}
			}
		}
	}

    /*
        Method: changeFile
        Purpose: change the active file to show another file
    */
	function changeFile(fileToChange) {
    	try{
		    saveCurrentDocument(openDocuments.get(openDocuments.get(activeDocument)));
    		var currentDoc = openDocuments.get(openDocuments.get(fileToChange.data('modelid')));
    		populateTopBar(currentDoc.id);
    		setDocOptions(currentDoc);
    		setActiveDocument();
		} catch(err) {
    		console.log(err);
		}
	}

    /*
        Method: changeFileById
        Purpose: change the active file by the ID number
    */
	function changeFileById(file) {
    	// save current active document
		if(activeDocument || openDocuments.length > 1) {
			saveCurrentDocument(openDocuments.get(openDocuments.get(activeDocument)));
		}
		// set document options and populate top bar
		setDocOptions(file);
		populateTopBar(file.id);
		setActiveDocument();
	}

    /*
        Method: connectToServer()
        Purpose: connects to the jambi server and finds the version numbers
    */
	function connectToServer() {
		$('#jambiStatus').html('Connecting <i class="fa fa fa-spinner fa-spin"></i>');
		$.ajax({
			type: 'GET',
			url: "http://jambi.herokuapp.com/api/jambi",
			async: true,
			contentType: "application/json",
			dataType: 'json',
			success: function(data) {
    			// show connected
				$('#jambiStatus').html(data.jambi.status);
				if(data.jambi.version !== jambi.getVersion()) {
					alert("Your version of Jambi is Out of Date");
				}
			},
			error: function(e) {
				$('#jambiStatus').html("Failed to connect to Jambi Server - " + e.statusText);
			}
		});
		// connect ever hour
		setTimeout(function(){connectToServer();},3600000);
	}

    /*
        Method: populateTopBar()
        Purpose: redraw the open files top bar
    */
	function populateTopBar(activeDocID) {
    	// get model count
		var modelCount = openDocuments.length;
		var first;
		if (!activeDocID) {
			first = true;
		}
		// remove all open file divs
		$('.file-container').remove();
		for(var i = 0; i < modelCount; i++) {

			var jDoc = openDocuments.at(i);
			var active = "";
			var savedIcon = '<i class="fa fa-circle"></i>';
			if(jDoc.id === activeDocID || modelCount <= 1 || first) {
				active = "active";
				first = false;
			}
			if(jDoc.isSaved) {
				savedIcon = '<i class="fa fa-circle-o"></i>';
			}
			var fileName = jDoc.title;
			var appendedHTML =  '<li class="file-container" data-modelid=' + jDoc.id + '>' +
				'<div class="file ' + active + '">' +
				'<span class="filename">' + fileName + '</span>' +
				'<span class="filesaved">' + savedIcon +'</span>' +
				'<span class="close"><i class="fa fa-times-circle"></i></span>' +
				'</div>' +
				'</li>';
			$('#file_ul').append(appendedHTML);
		}
		fileEventHandlers();
	}
/*
        Method: fileEventHandlers()
        Purpose: removes and then readds the click events to certain elements
    */
	function fileEventHandlers() {
    	// unbind events
		$('#newfile_tab').unbind('click');
		$('#sidebar_toggle').unbind('click');
		$('.file-container').unbind('click');
		$('.close').unbind('click');

        // re-bind events
		$('#sidebar_toggle').on('click', function() {
			jambi.toggleSideMenu();
		});
        // new document event handler
		$('#newfile_tab').on('click', function() {
			window.location.replace('#/home');
			newDocument();
		});
        // change file event handler
		$('.file-container').on('click', function() {
			window.location.replace('#/home');
			changeFile($(this));
		});
        // close doc event listener
		$('.close').on('click', function() {
			closeDocument($(this).parents(".file-container").data('modelid'));
		});
	}

    /*
        Method: setDocOptions()
        Purpose: Sets the editors options
    */
	function setDocOptions(model) {
    	try {
        	// if a model has been passed in (just a check)
    		if(model) {
        		// set options
        		var fileType = model.title;
        		fileType = fileType.substr((fileType.lastIndexOf(".")+1), fileType.length);
        		checkFileType(fileType);
    			jambi.getJambiEditor().doc.setValue(model.text);
    			jambi.getJambiEditor().clearHistory();
    			if(!($.isEmptyObject(model.history_object))) {
    				jambi.getJambiEditor().setHistory(model.history_object);
    			}
    			// set editor options
    			jambi.getJambiEditor().focus();
    			jambi.getJambiEditor().setCursor(model.line, model.col);
    			jambi.getJambiEditor().setOption("mode", model.mode);
    			jambi.getJambiEditor().scrollIntoView();
    		}
		} catch(err) {

		}
	}

    /*
        Method: openProject()
        Purpose: opens a project...
    */
	function openProject(name, projectData, index) {
		if(projectData) {
			for(var i = 0; i<= openDocuments.length; i++) {
				openDocuments.pop();
			}
			openDocuments.reset();

			var projectActiveDocument;
			var fileRoot;
			var fileName;

			Projects.at(0).attributes.active = index;
			saveProjectsJSON();

			// For loop through all open files in that project
			for(var k = 0; k < projectData.openfiles.length; k++) {
				fileRoot = projectData.openfiles[k].root;
				fileName = projectData.openfiles[k].name;
				var filesContents = jambi.openFileByDir(fileRoot + "/" + fileName);

				if(filesContents !== null) {
					// add files to openDocuments collection
					var jDoc = new JambiDocument();
					//var directory = projectData.root + projectData.openfiles[k].root;

					openDocuments.add(jDoc);
					// set document options using jDocs
					jDoc.text = filesContents;
					jDoc.title = projectData.openfiles[k].name;
					jDoc.mode = projectData.openfiles[k].mode;
					jDoc.line = projectData.openfiles[k].line;
					jDoc.col = projectData.openfiles[k].col;
					jDoc.fileLocation = projectData.openfiles[k].root;

					if(projectData.openfiles[k].active) {
						projectActiveDocument = k;
					}
				}
                // if file contents doesn't exist, remove that file from project
				if(filesContents === null && activeProject) {
					for(var x = 0; x < activeProject.openfiles.length; x++) {
						if(fileRoot === activeProject.openfiles[x].root && fileName === activeProject.openfiles[x].name) {
							activeProject.openfiles.splice(x, 1);
						}
					}
					saveProjectsJSON();
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
            if(activeProject !== undefined) {
    			if(activeProject.ssh.enabled) {
    			    jSetup.jambiMenu.tools.toolsSSHConnect.enabled = true;
    			}
    			else {
                    jSetup.jambiMenu.tools.toolsSSHConnect.enabled = false;
    			}
			}
		}
	}

    /*
        Method: onDropEvents()
        Purpose: controls the drop event for the open files
    */
	function onDropEvents(){
    	// prevent the file from opening inside the browser
		window.ondragover = function(e) { e.preventDefault(); return false };
		window.ondrop = function(e) { e.preventDefault(); return false };
		var holder = document.getElementById('fileHoverBar');
		holder.ondragover = function () { return false; };
		holder.ondragleave = function () { return false; };
		// set the new on drop method
		holder.ondrop = function (e) {
			e.preventDefault();

			for (var i = 0; i < e.dataTransfer.files.length; ++i) {
				if(e.dataTransfer.files[i].name.indexOf('.') !== -1) {
    				// get all the information of the file
					var file            = e.dataTransfer.files[i].path;
					var filecontents    = jambi.openFileByDir(file);
					var filename        = e.dataTransfer.files[i].name;
					var filetype        = filename.match(/\.[^.]+$/).toString();
					var fileLocation    = file.substring(0,file.lastIndexOf("/")+1);

					filetype = filetype.substr(1);
                    // create and open a new document
					newDocument(filename,filecontents,checkFileType(filetype),fileLocation);

				}
			}
			return false;
		};
	}
    // call the drop events method
	onDropEvents();

    /*
        Method: checkFileType()
        Purpose: returns the correct file type for CodeMirror given an extension
    */
	function checkFileType(fileTypeString) {
		switch(fileTypeString) {
			case "html":
                return "htmlmixed";
			case "css":
				return "css";
			case "js":
				return "javascript";
			case "json":
				return "javascript";
			case "xhtml":
				return "htmlmixed";
			case "py":
				return "python";
			case "sass":
				return "text/x-sass";
			case "scss":
				return "text/x-scss";
			case "less":
				return "text/x-less";
			case "rb":
				return "ruby";
			case "coffee":
				return "text/x-coffeescript";
			case "hs":
				return "text/x-haskell";
			case "c":
				return "text/x-csrc";
			case "cpp":
				return "text/x-c++src";
            case "java":
                return "text/x-java";
            case "cs":
                return "text/x-csharp";
            case "m":
                return "text/x-objectivec";
            case "lua":
                return "text/x-lua";
            case "php":
                return "text/x-php";

		}
	}

    /*


      Start of SFTP Integration - Not complete yet


    */

    /*
        Method: saveSFTP()
        Purpose: Saves a file over sftp - Not fully integrated
    */
	function saveSFTP() {
    	if(activeProject && activeDocument) {
        	if(activeProject.ssh.enabled){
            	var Client = require('ssh2').Client;
                var conn = new Client();
                var fs = require('fs');
                conn.on('error', function(e) {
                    jambi.showNotification("Jambi SFTP", "Error connecting to server");
                });

                conn.on('ready', function() {
                    conn.sftp(function(err, sftp) {
                        var filename = activeDocument.fileLocation + activeDocument.title;
                        var contents = activeDocument.text;
                        sftp.writeFile('./' + filename, contents, [], function(){
                            conn.end();
                        });
                    });
                });
            }
        }
	}

    /*
        Method: sshShowFile()
        Purpose: shows a list of files over sftp - not fully integrated yet
    */
    function sshShowFiles() {
        var host, port, username, password;
        if(activeProject.ssh.enabled) {
            host = activeProject.ssh.server;
            port = activeProject.ssh.port;
            username = activeProject.ssh.username;
            password = activeProject.ssh.password;
        	try {
    			var Client = require('ssh2').Client;
    			var conn = new Client();
    			var fs = require('fs');

    			conn.on('error', function(e) {
    				console.log(e);
    			});

    			conn.on('ready', function() {
    				console.log('Client :: ready');
    				conn.sftp(function(err, sftp) {
    					if (err) throw err;

    					sftp.readdir('./public_html', function(err, list) {
    						if (err) throw err;
                            var content = "";
    						for(var i = 0; i < list.length; i++) {
                                console.log(list[i].attrs.isFile());
                                var type;
                                if(list[i].attrs.isFile()) { type = "file"; } else { type = "folder" }
                                content += '<div class="file-list ssh-file" data-type="' + type +'" data-path="' + "d" +'" data-filename="'+
    										  list[i].filename +'">'+ list[i].filename +'</div>';

    						}

    						$('.ssh-file').on('dblclick', function(){
        						var $filename = $(this).data("filename");
        						var $contents;
        						sftp.readFile('./public_html/' + $filename, [], function(err,contents) {
                                    $contents = contents;
            				    });
                                openFile($filename, $contents, "html", "ssh:"+host);
    						});

    						jambi.createModal("SSH Files", host, content, "close");
    					});
    				});
    			}).connect({
    				host: host,
    				port: port,
    				username: username,
    				password: password
    			});
    		} catch(err) {
    			console.log(err);
    		}
    	}
	}


    /*


      End of SFTP Integration


    */


    /*
        Method: populateProject()
        Purpose: loads the projects.json file and populates the projects
    */
	function populateProjects() {
		$('#projectsTable > tbody').empty();
		// load in the fs module
		var fs = require('fs');
		 function doesDirectoryExist (tempfileLoc) {
            try { fs.statSync(tempfileLoc); return true; }
            catch (er) { return false; }
        }

        // check if there are projets
		if(Projects.length > 0) {
    		// get the active project index
			var activeProjectIndex = Projects.at(0).attributes.active;

			// Render Projects into page
			for(var i = 1; i < Projects.length; i++) {
    			// if the project dir does not exist, delete the project
                if(!doesDirectoryExist (Projects.at(i).attributes.project.root + "/")) {
    			   Projects.remove(Projects.at(i));
    			   saveProjectsJSON();
    			}
    			else {
        			// append projects to tables
    				$('#projectsTable > tbody:last').append('<tr class="project" data-name="' + Projects.at(i).attributes.project.name +
    					'" data-projectindex="' + i + '">' +
    					'<td>' + Projects.at(i).attributes.project.name + '</td>' +
    					'<td>' + Projects.at(i).attributes.project.root + '</td>' +
    					'<td>' + '' + '</td>' +
    					'</tr>');
    			}
			}

            // populate the rest of the page with tables
			for(var k = 0; k < 40-Projects.length; k++) {
				$('#projectsTable > tbody:last').append('<tr class="project-empty">' +
														'<td>&nbsp;</td>' +
														'<td></td>' +
														'<td></td>' +
														'</tr>');
			}


            // append the add project box
			$('.projects').append(jambifs.readHTML('public/views/addProjectTemplate.html'));

            // sort event listeners
            $('.project').off('dblclick');
            $('.project').off('click');
            $('.project-empty').off('click');
            $('#addProject').off('click');
            $('#closeAddProject').off('click');
            $('#addProject_selectLocation').off('change');

            // open project click
			$('.project').on('dblclick', function() {
				var projectIndex = $(this).data("projectindex");
				activeProject = Projects.at(projectIndex).attributes.project;
				openProject($(this).data("name"), activeProject, $(this).data("projectindex"));
			});

            // select project click
			$('.project').on('click', function() {
				$('.project').removeClass('active');
				$(this).addClass('active');
			});

            // off active project
			$('.project-empty').on('click', function() {
				$('.project').removeClass('active');
			});

            // fade out project card
			$(document).on('click', function(event){
				if(!$(event.target).closest('#addprojectcard').length) {
					$('#addprojectcard').fadeOut();
				}
			});

            // add a project click
			$('#addProject').on('click', function() {
    			// if a name and location has been specified
				if($('#addProjectName').val() && $('#addProjectLocation').val()) {
    				var options = {
        				grunt: false,
        				bootstrap: false,
        				jquery: false,
        				backbone: false,
        				angular: false,
        				jambitemplate: false
    				};

    				var sshOptions = {
            		    "enabled" :	false,
            		    "server": "",
            		    "port": 22,
            		    "username": "",
            		    "password": ""
    				}
                    // check for checkboxes
    				if($('#newproject_jquery').prop('checked')) options.jquery = true;
    				if($('#newproject_backbone').prop('checked')) options.backbone = true;
    				if($('#newproject_angular').prop('checked')) options.angular = true;
    				if($('#newproject_jambitemplate').prop('checked')) options.jambitemplate = true;
    				if($('#newproject_grunt').prop('checked')) options.grunt = true;
    				if($('#newproject_bootstrap').prop('checked')) options.bootstrap = true;


    				// SSH OPTIONS
    				if($('#addProject_ssh_host').val()) sshOptions.server = $('#addProject_ssh_host').val();
    				if($('#addProject_ssh_port').val()) sshOptions.port = $('#addProject_ssh_port').val();
    				if($('#addProject_ssh_user').val()) sshOptions.username = $('#addProject_ssh_user').val();
    				if($('#addProject_ssh_pass').val()) sshOptions.password = $('#addProject_ssh_pass').val();

                    // add a project
					addProject($('#addProjectName').val(), $('#addProjectLocation').val(), options, sshOptions);
					$('#addprojectcard').fadeOut();
				}
			});

            // fade out add project box
			$('#closeAddProject').on('click', function() {
				$('#addprojectcard').fadeOut();
			});

            // initally hide the box
			$('#addprojectcard').hide();

            // update the file location
			$('#addProject_selectLocation').on('change', function (event) {
				var fileLocation = $(this).val();
				$('#addProjectLocation').val(fileLocation);
			});

		}

	}
    /*
        Method: saveProjectsJSON()
        Purpose: Saves the projects collection to projects.json
    */
	function saveProjectsJSON(){
    	// write json
		jambifs.writeJSON("projects.json", JSON.stringify(Projects.models));
	}

    /*
        Method: npmInstall()
        Purpose: install and npm module
    */
	function npmInstall(app, root, callback) {
    	// execute the command to install a module
        var exec = require('child_process').exec;
    	exec("cd " + root + " && /usr/local/bin/npm install -g " + app, function(code, output, err) {
                callback();
        });
	}

    /*
        Method: addProject()
        Purpose: adds a project
    */
	function addProject(name, root, options, sshOptions) {
    	// create a new instance of the project model
    	var newProject = new Project({
			"project": {
    			"name": name,
    			"root": root,
    			"openfiles": [],
    			"currentfile": {},
    			"flowInitialised": false,
    			"vc": {
    				"vcInitialised": false,
    				"vcType": "git",
    				"vcURL": "",
    				"vcUser": ""
    			},
    			"jTemplate": false,
    			"ssh":  {
        		    "enabled" :	false,
        		    "server": "",
        		    "port": 22,
        		    "username": "",
        		    "password": ""
                }
    		}
		});
		// add the project to the collection
		Projects.add(newProject);

        if(options) {
        	var fs = require('fs');
        	var exec = require('child_process').exec;
            if(options.grunt) {
                // install the grunt module
                npmInstall("grunt-cli", root, function(){
                    exec("cd " + root + " && /usr/local/bin/npm install grunt --save-dev", function(code, output, err) {
                        jambifs.writeHTML(root + "/Gruntfile.js", jambifs.readHTML('files/gruntfile.js'));
                        jambifs.writeHTML(root + "/package.json", jambifs.readHTML('files/package.json'));
                    });

                });

            }

            if(options.jquery) {
                // write the jquery file to project root
                jambifs.writeHTML(root + "/jquery.js", jambifs.readHTML('files/jquery.js'));
            }

            if(options.bootstrap) {
                // write the bootstrap files to the project root
                jambifs.writeHTML(root + "/bootstrap.css", jambifs.readHTML('files/bootstrap/bootstrap.css'));
                jambifs.writeHTML(root + "/bootstrap.js", jambifs.readHTML('files/bootstrap/bootstrap.js'));
            }

            if(options.angular) {
                // write the angular files to the project root
                jambifs.writeHTML(root + "/angular.js", jambifs.readHTML('files/angular/angular.js'));
            }

            if(options.backbone) {
                // write the backbone files to the project root
                jambifs.writeHTML(root + "/backbone.js", jambifs.readHTML('files/backbone/backbone.js'));
            }

            if(options.jambitemplate) {
                // create templating for the project
                newProject.project.jTemplate = true;
                var fs = require('fs');
        		 function doesDirectoryExist (templateFolder) {
                    try { fs.statSync(templateFolder); return true; }
                    catch (er) { return false; }
                }
                if(!doesDirectoryExist (root + "/templates")) {
                    fs.mkdirSync(root + "/templates");
                }
            }
    	}
        // sort out ssh stuff
    	if(sshOptions.enabled) {
            newProject.ssh.enabled = true;

        	if(sshOptions.server) newProject.ssh.server = sshOptions.server;
        	if(sshOptions.port) newProject.ssh.port = sshOptions.port;
        	if(sshOptions.username) newProject.ssh.username = sshOptions.username;
        	if(sshOptions.password) newProject.ssh.password = sshOptions.password;
    	}

        // Project addons
        var projectsJSON;
        // save the projects JSON
		jambifs.readJSON('projects.json', function(err, data){
			projectsJSON = data;
			projectsJSON[Projects.length-1] = newProject.attributes;
			jambifs.writeJSON('projects.json', JSON.stringify(projectsJSON));
		});
        // open the project
        openProject(name, newProject.attributes.project, Projects.indexOf(newProject));

	}


    /*
        Method: generateProjectsContextMenu()
        Purpose: generates the project context menu on the projects page
    */
	function generateProjectsContextMenu() {
    	// set up vars
		var gui = jSetup.gui;
		var card_menu = new gui.Menu();
		var project_menu = new gui.Menu();
		var clickedCard;
        // append menuitems to the menu
		card_menu.append(new gui.MenuItem({ label: 'Open' }));
		card_menu.append(new gui.MenuItem({ label: 'Edit...' }));
		card_menu.append(new gui.MenuItem({ label: 'Duplicate' }));
		card_menu.append(new gui.MenuItem({ label: 'Delete...' }));
		card_menu.append(new gui.MenuItem({ type: 'separator' }));
		card_menu.append(new gui.MenuItem({ label: 'Change Image...' }));

        // setup the click functions
		card_menu.items[0].click = function(e) {
			var projectIndex = clickedCard.data("projectindex");
			activeProject = Projects.at(projectIndex).attributes.project;
			openProject(clickedCard.data("name"), activeProject, projectIndex);
		};
        // delete click function
		card_menu.items[3].click = function(e) {
			var projectIndex = clickedCard.data("projectindex");
			if(projectIndex >= 0) {
			    Projects.remove(Projects.at(projectIndex));
			    saveProjectsJSON();
			    populateProjects();
			    setTimeout(function(){
    			    $('#addprojectcard').hide();
    			 }, 100);
			}
		};

        // show context menu where the mouse was clicked
		$('#jambi-body').on("contextmenu", '.project' ,function(e){
			card_menu.popup(e.pageX, e.pageY);
			clickedCard = $(this);
			return false;
		});

        // append the add a project context menu
		project_menu.append(new gui.MenuItem({ label: 'Add Project...' }));

        // show the add project card
		project_menu.items[0].click = function(e) {
			$('#addprojectcard').fadeIn();
		};

        // show menu at mouse cursor
		$('#jambi-body').on("contextmenu", function(e){
			project_menu.popup(e.pageX, e.pageY);
			return false;
		});
	}

    /*
        View: EditorView
        Purpose: Provides the view functions for the editor page
    */
	var EditorView = Backbone.View.extend({
		el: '#jambi-body',
		render: function(){
    		// render the page from editor.html (external file) into the page
			this.$el.html(render('editor', {}));
			$('#jambi-body').off("contextmenu");

            // event listeners
			$('#jambiStartTimer').on('click', function(){
				jTimer.startTimer();
			});

			$('#jambiStopTimer').on('click', function(){
				jTimer.stopTimer();
			});

			$('#jshintcode').on('click', function() {
				jambi.jsHint();
			});
			// update Jambi
			connectToServer();
			$('#jambi-editor').css('font-size', jambi.getFontSize());

		}
	});

    /*
        View: ProjectView
        Purpose: Provides the view functions for the projects page
    */
	var ProjectView = Backbone.View.extend({
		el: '#jambi-body',

		render: function(){
    		// render the projects page
			this.$el.html(render('projects', {}));
		}
	});

    /*
        Method: hideSidebarToggle
        Purpose: Hides the sidebar
    */
	function hideSidebarToggle() {
		$('#sidebar_toggle').hide();
	}

    /*
        Method: showSidebarToggle
        Purpose: shows the sidebar toggle
    */
	function showSidebarToggle() {
		$('#sidebar_toggle').show();
	}

	/*
        Method: sideBarMenus
        Purpose: Controls the menus on the sidebar
    */
	function sideBarMenus() {
		var $el = $('#sidebarcontent');
		var sidebarContent = $('.sidebarMenuItem');

        // make sure listeners are reset
		$('#sidebar_home').off('click');
		$('#sidebar_list').off('click');
		$('#sidebar_file').off('click');
		$('#sidebar_connection').off('click');

        // hide content
		sidebarContent.hide();
		// show home
		$('#sidebarHome').show();

        // init the click functions for the views
		$('#sidebar_home').on('click', function(){
			sidebarContent.hide();
			$('#sidebarHome').show();
		});
		$('#sidebar_list').on('click', function(){
			sidebarContent.hide();
			$('#sidebarList').show();
		});
		$('#sidebar_file').on('click', function(){
			sidebarContent.hide();
			$('#sidebarFile').show();
		});
		$('#sidebar_connection').on('click', function(){
			sidebarContent.hide();
			$('#sidebarConnection').show();
		});
	}


    /*
        Method: vcMenuSetup
        Purpose: setups version control for a project
    */
	function vcMenuSetup() {
		var jMenu = jSetup.jambiMenu;
		if(activeProject) {
    		// enable the menu items
			if(activeProject.vc.vcInitialised) {
				jMenu.vc.vc.enabled = true;
				jMenu.vc.vcPull.enabled = true;
				jMenu.vc.vcPush.enabled = true;
				jMenu.vc.vcCommit.enabled = true;
			}
			else {
    			// disable the menu items
				jMenu.vc.vc.enabled = true;
				jMenu.vc.vcPull.enabled = false;
				jMenu.vc.vcPush.enabled = false;
				jMenu.vc.vcCommit.enabled = false;
			}
		}
		else {
    		// disable the menu items
			jMenu.vc.vc.enabled = false;
			jMenu.vc.vcPull.enabled = false;
			jMenu.vc.vcPush.enabled = false;
			jMenu.vc.vcCommit.enabled = false;
		}
	}

    /*
        Method: generateFileSystem
        Purpose: populates the sidebar file system so the user can open new files
    */
	var currentDirectory = ".";
	function generateFilSystem() {
		if(activeProject) {
			currentDirectory = activeProject.root;
			// getFiles
			// Gets the files of a specific file path
			function getFiles(filespath) {
				currentDirectory = filespath;
				// delete all files inside the div (avoids repopulation)
				$('#fb_files').empty();
				var files = jambifs.readDir(filespath);
				// populate each file
				var path;
				var type;
				var fileIcon;
				for(var i = 0; i <files.length; i++) {
					path = filespath + "/" + files[i];
					type = "";
					fileIcon = '<i class="fa fa-file file-list-file"></i>';
                    // if a file, add the file icon
					if(jambifs.stat(path).isFile()) {
						type = "file";
						fileIcon = '<i class="fa fa-file file-list-file"></i>';
					}
					// if a folder, add the folder icon
					if(jambifs.stat(path).isDirectory()) {
						type = "directory";
						fileIcon = '<i class="fa fa-folder file-list-folder"></i>';
					}

                    // append the files to the sidebar
					$('#fb_files').append('<div class="file-list" data-type="' + type +'" data-path="' + filespath +'" data-filename="'+
										  files[i] +'">' + fileIcon + files[i] +'</div>');

				}
			}
            // get the files
            setTimeout(function(){
    			getFiles(currentDirectory);
            }, 400);

            // open the previous dir on dblclick
			$('#previousDir').on('dblclick', function(){
				var newPath = currentDirectory.substr(0, currentDirectory.lastIndexOf('/'));
				try{
					if(newPath !== "/") {
						getFiles(newPath);
					}
				} catch(err) {
					alert(err);
				}
			});

            // set active on click
			$('#fb_files').on('click', '.file-list', function() {
				$('.file-list').removeClass('active');
				$(this).addClass('active');
			});

            // on double click, open the file
			$('#fb_files').on('dblclick', '.file-list', function() {
    				// file metadata
    				var $this = $(this);
    				var path = $this.data('path') + "/";
    				var filename = $this.data('filename');
    				var filetype = "html";
    				// get the file type
    				if(filename.match(/\.[^.]+$/)) {
    					filetype = filename.match(/\.[^.]+$/).toString();
    					filetype = filetype.substr(1, filetype.length);
    				}
    				var type = $this.data('type');
                    // if a file, open the file in the editor
    				if(type === "file") {
        				var content = jambifs.readHTML(path + filename);
    					newDocument(filename, content, checkFileType(filetype), path);
    				}
    				// if a directory, call getFiles with that directory's path
    				if(type === "directory") {
    					getFiles(path + "/" + filename);
    				}
			});
		}
	}

    /*
        Method: vcClick
        Purpose: Setup version control on the menu item
    */
	function vcClick() {
    	// setup the click function on the version control setup menu item
		jSetup.jambiMenu.vc.vc.click = function () {
			function modalFunction() {
				if(activeProject) {
    				// init VC
					activeProject.vc.vcInitialised = true;
					// set VC attributes
					activeProject.vc.vcType = $('.radioButtonType[name=group1]:checked').data('type');
					activeProject.vc.vcURL = $('#repo-url').val();
					activeProject.vc.vcUser = $('#repo-user').val();
					// save projects.json
					vcMenuSetup();
					saveProjectsJSON();
				}
			}
			// populate the modal with external file
			var modalhtml = jambifs.readHTML('public/views/vcsetup.html');
			// create modal
			jambi.createModal("Setup Version Control", "", modalhtml, "Init Empty Repo", modalFunction, null, "Clone");
			if(activeProject.vc.vcInitialised) {
				$('#repo-url').val(activeProject.vc.vcURL);
				$('#repo-user').val(activeProject.vc.vcUser);
			}
			$('#modalButtonExtra').off('click');
			// add the extra button to the modal
			$('#modalButtonExtra').on('click',function(){
    			// set projects attributes
				activeProject.vc.vcInitialised = true;
				activeProject.vc.vcType = $('.radioButtonType[name=group1]:checked').data('type');
				activeProject.vc.vcURL = $('#repo-url').val();
				activeProject.vc.vcUser = $('#repo-user').val();
				vcMenuSetup();
				// save project.json
				saveProjectsJSON();
				// clone repo
				jambi.vcClone(activeProject.vc.vcURL, activeProject.vc.vcType);
				$('#vcPush').attr('disabled','false');
                $('#vcPull').attr('disabled','false');
                $('#commitAll').attr('disabled','false');
			});

		};
        // click function for commit
		jSetup.jambiMenu.vc.vcCommit.click = function () {
			jambi.vcCommit(activeProject.vc.vcType);
		};
        // click function for pull
		jSetup.jambiMenu.vc.vcPull.click = function () {
			jambi.vcPull(activeProject.vc.vcType);
		};
        // click function for push
		jSetup.jambiMenu.vc.vcPush.click = function () {
			jambi.vcPush(activeProject.vc.vcType);
		};
	}
	vcClick();

    // all CDN inital values
    var bootstrapCSS = '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">';
    var bootstrapJS = '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>';
    var jqueryJS = '<script src="https://code.jquery.com/jquery-2.1.3.min.js"></script>';
    var angularJS = '<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js"></script>';

    /*
        Method: listFunctions
        Purpose: setup the functions that the quick menu has
    */
    function listFunctions() {
        var jambiVariableListFunction = "";
        var tags = jambi.findVariables();

        // genearte jambiVariableListFunction
        jambiVariableListFunction = '(function(){ /* make it safe to use console log - taken from (http://www.sitepoint.com/safe-console-log/) */ (function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}}) (function(){try{console.log();return window.console;}catch(a){return (window.console={});}}()); var vars = ' + JSON.stringify(tags, 4, null) + '; for(var i = 0; i<vars.length; i++) { console.log("var: " + vars[i].name + " = " + window[vars[i].name]); } })();';

        // generate options
        var options = {
            "bootstrap_css": bootstrapCSS,
            "bootstrap_js": bootstrapJS,
            "jquery": jqueryJS,
            "angular": angularJS,
            "ajax_get": '',
            "ajax_post": '',
            "var_list" : jambiVariableListFunction
        };

        // remove all listeners
        $('#sideListForLoop').off('dblclick');
        $('.cdn-list').off('click');
        $('#sideListForLoop').off('dblclick');

        // add active listener
        $('.cdn-list').on('click', function(){
            $('.cdn-list').removeClass('active');
            $(this).addClass('active');
        });

        // add click function to items
        $('.cdn-list').on('dblclick', function(){
            // get what the item is meant to do
            var x = $(this).data('option');
            // insert the option at cursor
            jambi.insertAtCursor(options[x]);
        });

        // for loop dbl click function
        $('#sideListForLoop').on('dblclick', function(){
            // prompt the user for the loop count
            var loopCount = prompt("Loop up to:", "10");
            if(loopCount != null) {
                // insert at cursor
                jambi.insertAtCursor("for(var i = 0; i <= " + loopCount + "; i++) {\n\n}");
            }
        });

        // commit menu items
        // click off
        $('#commitAll').off('click');
        $('#vcPull').off('click');
        $('#vcPush').off('click');

        if(activeProject) {
            if(activeProject.vc.vcInitialised) {
                // click functions for vc commit
                $('#commitAll').on('click', function(){
                    if(activeProject.vc.vcInitialised) {
                        jambi.vcCommit(activeProject.vc.vcType);
                    }
                });
                // click function for vc pull
                $('#vcPull').on('click', function(){
                    if(activeProject.vc.vcInitialised) {
                        jambi.vcPull(activeProject.vc.vcType);
                    }
                });
                // click function for vc push
                $('#vcPush').on('click', function(){
                    if(activeProject.vc.vcInitialised) {
                        jambi.vcPush(activeProject.vc.vcType);
                    }
                });
            } else {
                // disable buttons
                $('#vcPush').attr('disabled','disabled');
                $('#vcPull').attr('disabled','disabled');
                $('#commitAll').attr('disabled','disabled');
            }
        }
    }

    /*
        Method: openServer
        Purpose: start a simple python server
    */
    function openServer() {
        jSetup.jambiMenu.tools.toolsStartServer.click();
    }


	// Routers
	var Router = Backbone.Router.extend({
		routes: {
			'home': 'home',
			'project': 'projects'
		}
	});

    // create new instances of views
	var editorView = new EditorView();
	var projectView = new ProjectView();
    // create new insatnce of router
	var router = new Router();
	var firstLoad = true;


    // Router on HOME (editor) - when the view is on editor, execute this code
	router.on('route:home', function() {
    	$("#showcaseLink").off('click');
    	// render editor view
		editorView.render();
		// init search functions
		jambi.searchWeb();
		// render editor
		jambi.renderEditor();
		setActiveDocument();
		populateTopBar(activeDocument);
		setDocOptions(openDocuments.get(activeDocument));
		isEditorOpen = true;
        // add sidebar content
		var $el = $('#sidebarcontent');
		$el.append(render('sidebar/file', {}));
		$el.append(render('sidebar/list', {}));
		$el.append(render('sidebar/connection', {}));
		sideBarMenus();
        // generate the file system
        setTimeout(function(){
    		generateFilSystem();
        }, 300);
        // show sidebar toggle button
		showSidebarToggle();
		$('#jambi-body').css('background-color', '#444');

		vcMenuSetup();
		listFunctions();
        // show links
        $('#showcaseLink').show();
        // add listener to link
        setTimeout(function() {
            $("#showcaseLink").on('click', function() {
                openServer();
            });
        }, 500);
	});

    // router on projects - execute this code when on projects page
	router.on('route:projects', function() {
    	// set active doc and save
		setActiveDocument();
		if(activeDocument !== undefined) {
			saveCurrentDocument(openDocuments.get(activeDocument));
		}
		// render the projects page
		projectView.render();
		populateProjects();
		isEditorOpen = false;
		generateProjectsContextMenu();
		hideSidebarToggle();
		$('#jambi-body').css('background-color', '#444');
		vcMenuSetup();
		$('#showcaseLink').hide();
	});


    // start history
	Backbone.history.start();
	jambi.initCodeMirror();

	// if in project then start home else start project
	window.location.replace("#/project");

    // return the list of functions that other modules use
	return {
		newFile: function() { newDocument (); return true;},
		openFile: function(filename, filecontents, filemode, fileLocation) {
			return newDocument(filename, filecontents, filemode, fileLocation);
		},
		closeCurrentDoc: function() { return closeCurrentDocument(); },
		closeAllDocs: function() { return removeAllDocuments (); },
		getActiveDocument: function() { return openDocuments.get(activeDocument); },
		setDocLocation: function(loc) { openDocuments.get(activeDocument).fileLocation = loc; },
		setDocName: function(name) { openDocuments.get(activeDocument).title = name; populateTopBar(activeDocument); },
		onEditorPage: function() { return isEditorOpen; },
		getActiveProject: function() { return activeProject; },
		addFileToProject: function(filename, fileLocation, filemode) { return addFileToProjectJSON(filename, fileLocation, filemode)},
		checkFileTypes: function (fileType) { return checkFileType(fileType); },

		saveAllProjects: function() {
			return saveProjectsJSON();
		},
		showSSHFiles: function () {
    		sshShowFiles();
		},
		execServer: function () {
    		openServer();
		},
		setCDNS: function (data) {
            bootstrapCSS = '<link rel="stylesheet" href="' + data.bootstrap_css + '">';
            bootstrapJS = '<script src="' + data.bootstrap_js + '"></script>';
            jqueryJS = '<script src="' + data.jquery + '"></script>';
            angularJS = '<script src="' + data.angular + '"></script>';
		}
	};
};
// create a new instance of this class
var jModel = new jambiModel();
jambi.updateJambi();