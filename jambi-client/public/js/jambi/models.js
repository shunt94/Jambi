/* @flow */
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
			"currentfile": {},
			"flowInitialised": false,
			"vc": {
				"vcInitialised": false,
				"vcType": "git",
				"vcURL": "",
				"vcUser": ""
			},
			"jTemplate": false,
			"ssh": false
		}
	});

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


	var AllDocuments = Backbone.Collection.extend({
		model: JambiDocument
	});

	var ProjectsCollection = Backbone.Collection.extend({
		model: Project,
		url: "projects.json"
	});

	var Projects = new ProjectsCollection();


	// Check to see if projects json exists

	$.ajaxSetup({
		async: false
	});
	Projects.fetch({
		success: function() {
			//			console.log("JSON file load was successful", Projects);
		},
		error: function(){
			jambi.showNotification('Jambi - Error', 'Could not fetch projects');
			// TO DO: make project json if file does not exist!
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

			if(activeProject) {
				var isFileInProject = false;
				for(var k = 0; k < activeProject.openfiles.length; k++) {
					if(fileLocation === activeProject.openfiles[k].root && filename === activeProject.openfiles[k].name) {
						isFileInProject = true;
					}
				}
				if(!(isFileInProject)) {
					addFileToProjectJSON(filename, fileLocation, filemode);
				}
			}
		} else {
			changeFileById(openFile);
		}

		if(jDoc) {
		    return true;
		}
	}

	function addFileToProjectJSON(filename, fileLocation, filemode) {
		activeProject.openfiles.push(
			{"name": filename,"root":fileLocation,"mode":filemode,"col":0,"line":0,"active":true}
		);
		saveProjectsJSON();
	}

	function closeDocument(docID) {
		setActiveDocument();
		saveCurrentDocument(openDocuments.get(activeDocument));
		var index = openDocuments.indexOf(openDocuments.get(docID));

		if(activeProject) {
			for(var i = 0; i < activeProject.openfiles.length; i++) {
				if(activeProject.openfiles[i].root === openDocuments.get(docID).fileLocation &&
					activeProject.openfiles[i].name === openDocuments.get(docID).title) {
					activeProject.openfiles.splice(i, 1);
				}
			}
			saveProjectsJSON();
		}

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
		if(activeProject && activeDocument) {
			if(activeProject.openfiles.length > 0) {
				var activeIndex = -1;
				for(var i = 0; i < activeProject.openfiles.length; i++){
					activeProject.openfiles[i].active = false;
					if(openDocuments.get(activeDocument).fileLocation === activeProject.openfiles[i].root &&
					   openDocuments.get(activeDocument).title === activeProject.openfiles[i].name) {
						activeIndex = i;
					}
				}
				if(activeIndex >= 0) {
					activeProject.openfiles[activeIndex].active = true;
					saveProjectsJSON();
				}
			}
		}
	}

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

	function setDocOptions(model) {
    	try {
    		if(model) {
        		var fileType = model.title;
        		fileType = fileType.substr((fileType.lastIndexOf(".")+1), fileType.length);
        		checkFileType(fileType);
    			jambi.getJambiEditor().doc.setValue(model.text);
    			jambi.getJambiEditor().clearHistory();
    			if(!($.isEmptyObject(model.history_object))) {
    				jambi.getJambiEditor().setHistory(model.history_object);
    			}
    			jambi.getJambiEditor().focus();
    			jambi.getJambiEditor().setCursor(model.line, model.col);
    			jambi.getJambiEditor().setOption("mode", model.mode);
    			jambi.getJambiEditor().scrollIntoView();
    		}
		} catch(err) {

		}
	}


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
					var fileLocation    = file.substring(0,file.lastIndexOf("/")+1);

					filetype = filetype.substr(1);
					//filename = filename.substring(filename.lastIndexOf('/')+1, filename.indexOf('.'));

					newDocument(filename,filecontents,checkFileType(filetype),fileLocation);

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


	function saveSFTP() {
    	if(activeProject && activeDocument) {
        	if(activeProject.ssh){
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



	function setupSSH(host, port, username, password) {
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
						console.dir(list);



						for(var i = 0; i < list.length; i++) {


    						if(list[i].filename === "index.html") {
                                //console.log(list[i].filename);
        						//sftp.readFile('./public_html/index.html', [], function(err,contents) {
            						//console.log(err);
            						//console.log(contents.toString('utf-8'));
            					//	newDocument("index.html", contents.toString('utf-8'), checkFileType("html"), host + "./public_html/");



        						//});




    						}
						}

						console.log(sftp);
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

//	setupSSH("unix.sussex.ac.uk", 22, "", "");

	function populateProjects() {
		$('#projectsTable > tbody').empty();
		var fs = require('fs');
		 function doesDirectoryExist (tempfileLoc) {
            try { fs.statSync(tempfileLoc); return true; }
            catch (er) { return false; }
        }

		if(Projects.length > 0) {
			var activeProjectIndex = Projects.at(0).attributes.active;

			// Render Projects into page
			for(var i = 1; i < Projects.length; i++) {
                if(!doesDirectoryExist (Projects.at(i).attributes.project.root + "/")) {
    			   Projects.remove(Projects.at(i));
    			   saveProjectsJSON();
    			}
    			else {
    				$('#projectsTable > tbody:last').append('<tr class="project" data-name="' + Projects.at(i).attributes.project.name +
    					'" data-projectindex="' + i + '">' +
    					'<td>' + Projects.at(i).attributes.project.name + '</td>' +
    					'<td>' + Projects.at(i).attributes.project.root + '</td>' +
    					'<td>' + '' + '</td>' +
    					'</tr>');
    			}
			}


			for(var k = 0; k < 40-Projects.length; k++) {
				$('#projectsTable > tbody:last').append('<tr class="project-empty">' +
														'<td>&nbsp;</td>' +
														'<td></td>' +
														'<td></td>' +
														'</tr>');
			}

			$('.projects').append(jambifs.readHTML('public/views/addProjectTemplate.html'));


            $('.project').off('dblclick');
            $('.project').off('click');
            $('.project-empty').off('click');
            $('#addProject').off('click');
            $('#closeAddProject').off('click');
            $('#addProject_selectLocation').off('change');

			$('.project').on('dblclick', function() {
				var projectIndex = $(this).data("projectindex");
				activeProject = Projects.at(projectIndex).attributes.project;
				openProject($(this).data("name"), activeProject, $(this).data("projectindex"));
			});

			$('.project').on('click', function() {
				$('.project').removeClass('active');
				$(this).addClass('active');
			});

			$('.project-empty').on('click', function() {
				$('.project').removeClass('active');
			});

			$(document).on('click', function(event){
				if(!$(event.target).closest('#addprojectcard').length) {
					$('#addprojectcard').fadeOut();
				}
			});

			$('#addProject').on('click', function() {
				if($('#addProjectName').val() && $('#addProjectLocation').val()) {
    				var options = {
        				grunt: false,
        				bootstrap: false,
        				jquery: false,
        				backbone: false,
        				angular: false,
        				jambitemplate: false
    				};

    				if($('#newproject_jquery').prop('checked')) {
        				options.jquery = true;
    				}
    				if($('#newproject_backbone').prop('checked')) {
        				options.backbone = true;
    				}
    				if($('#newproject_angular').prop('checked')) {
        				options.angular = true;
    				}
    				if($('#newproject_jambitemplate').prop('checked')) {
        				options.jambitemplate = true;
    				}
    				if($('#newproject_grunt').prop('checked')) {
        				options.grunt = true;
    				}
    				if($('#newproject_bootstrap').prop('checked')) {
        				options.bootstrap = true;
    				}

					addProject($('#addProjectName').val(), $('#addProjectLocation').val(), options);
					$('#addprojectcard').fadeOut();
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

	function saveProjectsJSON(){
		jambifs.writeJSON("projects.json", JSON.stringify(Projects.models));
	}

	function npmInstall(app, root, callback) {
        var exec = require('child_process').exec;
    	console.log("cd " + root + " && /usr/local/bin/npm install -g " + app);
    	exec("cd " + root + " && /usr/local/bin/npm install -g " + app, function(code, output, err) {
                callback();
        });
	}

	function addProject(name, root, options) {
    	var newProject = new Project({
			"project": {
				"name": name,
				"root": root,
				"openfiles": [],
				"flowInitialised":false,
				"vc": {
    				"vcInitialised": false,
    				"vcType": "git",
    				"vcURL": "",
    				"vcUser": ""
    			},
    			"jTemplate": false
			}
		});
		Projects.add(newProject);

        if(options) {
        	var fs = require('fs');
        	var exec = require('child_process').exec;
            if(options.grunt) {
                npmInstall("grunt-cli", root, function(){
                    exec("cd " + root + " && /usr/local/bin/npm install grunt --save-dev", function(code, output, err) {
                        jambifs.writeHTML(root + "/Gruntfile.js", jambifs.readHTML('files/gruntfile.js'));
                        jambifs.writeHTML(root + "/package.json", jambifs.readHTML('files/package.json'));
                    });

                });

            }

            if(options.jquery) {
                jambifs.writeHTML(root + "/jquery.js", jambifs.readHTML('files/jquery.js'));
            }

            if(options.bootstrap) {
                jambifs.writeHTML(root + "/bootstrap.css", jambifs.readHTML('files/bootstrap/bootstrap.css'));
                jambifs.writeHTML(root + "/bootstrap.js", jambifs.readHTML('files/bootstrap/bootstrap.js'));
            }

            if(options.angular) {
                jambifs.writeHTML(root + "/angular.js", jambifs.readHTML('files/angular/angular.js'));
            }

            if(options.backbone) {
                jambifs.writeHTML(root + "/backbone.js", jambifs.readHTML('files/backbone/backbone.js'));
            }

            if(options.jambitemplate) {
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

        // Project addons
        var projectsJSON;

		jambifs.readJSON('projects.json', function(err, data){
			projectsJSON = data;
			projectsJSON[Projects.length-1] = newProject.attributes;
			jambifs.writeJSON('projects.json', JSON.stringify(projectsJSON));
		});

        openProject(name, newProject.attributes.project, Projects.indexOf(newProject));

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
			openProject(clickedCard.data("name"), activeProject, projectIndex);
		};

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

		$('#jambi-body').on("contextmenu", '.project' ,function(e){
			card_menu.popup(e.pageX, e.pageY);
			clickedCard = $(this);
			return false;
		});


		project_menu.append(new gui.MenuItem({ label: 'Add Project...' }));

		project_menu.items[0].click = function(e) {
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

	var ToolsView = Backbone.View.extend({
		el: '#jambi-body',

		render: function(){
			this.$el.html(render('tools', {}));
		}
	});

	var ShowcaseView = Backbone.View.extend({
		el: '#jambi-body',
		render: function(){
			this.$el.html(render('showcase', {}));
			$('#jambi-body').off("contextmenu");
		}
	});

	function hideSidebarToggle() {
		$('#sidebar_toggle').hide();
	}

	function showSidebarToggle() {
		$('#sidebar_toggle').show();
	}


	// Sidebar menus
	function sideBarMenus() {
		var $el = $('#sidebarcontent');
		var sidebarContent = $('.sidebarMenuItem');

		$('#sidebar_home').off('click');
		$('#sidebar_list').off('click');
		$('#sidebar_file').off('click');
		$('#sidebar_connection').off('click');


		sidebarContent.hide();
		$('#sidebarHome').show();


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


	function vcMenuSetup() {
		var jMenu = jSetup.jambiMenu;
		if(activeProject) {
			if(activeProject.vc.vcInitialised) {
				jMenu.vc.vc.enabled = true;
				jMenu.vc.vcPull.enabled = true;
				jMenu.vc.vcPush.enabled = true;
				jMenu.vc.vcCommit.enabled = true;
			}
			else {
				jMenu.vc.vc.enabled = true;
				jMenu.vc.vcPull.enabled = false;
				jMenu.vc.vcPush.enabled = false;
				jMenu.vc.vcCommit.enabled = false;
			}
		}
		else {
			jMenu.vc.vc.enabled = false;
			jMenu.vc.vcPull.enabled = false;
			jMenu.vc.vcPush.enabled = false;
			jMenu.vc.vcCommit.enabled = false;
		}
	}

	var currentDirectory;
	function generateFilSystem() {
		if(activeProject) {
			currentDirectory = activeProject.root;
			function getFiles(filespath) {
				currentDirectory = filespath;
				$('#fb_files').empty();
				var files = jambifs.readDir(filespath);
				for(var i = 0; i <files.length; i++) {

					var path = filespath + "/" + files[i];
					var type = "";
					var fileIcon = '<i class="fa fa-file file-list-file"></i>';

					if(jambifs.stat(path).isFile()) {
						type = "file";
						fileIcon = '<i class="fa fa-file file-list-file"></i>';
					}
					if(jambifs.stat(path).isDirectory()) {
						type = "directory";
						fileIcon = '<i class="fa fa-folder file-list-folder"></i>';
					}


					$('#fb_files').append('<div class="file-list" data-type="' + type +'" data-path="' + filespath +'" data-filename="'+
										  files[i] +'">' + fileIcon + files[i] +'</div>');

				}
			}

			getFiles(currentDirectory);

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

			$('#fb_files').on('click', '.file-list', function() {
				$('.file-list').removeClass('active');
				$(this).addClass('active');
			});

			$('#fb_files').on('dblclick', '.file-list', function() {
    				var $this = $(this);
    				var path = $this.data('path') + "/";
    				var filename = $this.data('filename');
    				var filetype = "html";
    				if(filename.match(/\.[^.]+$/)) {
    					filetype = filename.match(/\.[^.]+$/).toString();
    					filetype = filetype.substr(1, filetype.length);
    				}
    				var type = $this.data('type');

    				if(type === "file") {
        				var content = jambifs.readHTML(path + filename);
    					newDocument(filename, content, checkFileType(filetype), path);
    				}
    				if(type === "directory") {
    					getFiles(path + "/" + filename);
    				}
			});
		}
	}

	function vcClick() {
		jSetup.jambiMenu.vc.vc.click = function () {
			function modalFunction() {
				if(activeProject) {
					activeProject.vc.vcInitialised = true;
					activeProject.vc.vcType = $('.radioButtonType[name=group1]:checked').data('type');
					activeProject.vc.vcURL = $('#repo-url').val();
					activeProject.vc.vcUser = $('#repo-user').val();
					vcMenuSetup();
					saveProjectsJSON();
				}
			}
			var modalhtml = jambifs.readHTML('public/views/vcsetup.html');
			jambi.createModal("Setup Version Control", "", modalhtml, "Init Empty Repo", modalFunction, null, "Clone");
			if(activeProject.vc.vcInitialised) {
				$('#repo-url').val(activeProject.vc.vcURL);
				$('#repo-user').val(activeProject.vc.vcUser);
			}
			$('#modalButtonExtra').off('click');
			$('#modalButtonExtra').on('click',function(){
				activeProject.vc.vcInitialised = true;
				activeProject.vc.vcType = $('.radioButtonType[name=group1]:checked').data('type');
				activeProject.vc.vcURL = $('#repo-url').val();
				activeProject.vc.vcUser = $('#repo-user').val();
				vcMenuSetup();
				saveProjectsJSON();
				jambi.vcClone(activeProject.vc.vcURL, activeProject.vc.vcType);
				$('#vcPush').attr('disabled','false');
                $('#vcPull').attr('disabled','false');
                $('#commitAll').attr('disabled','false');
			});

		};

		jSetup.jambiMenu.vc.vcCommit.click = function () {
			jambi.vcCommit(activeProject.vc.vcType);
		};

		jSetup.jambiMenu.vc.vcPull.click = function () {
			jambi.vcPull(activeProject.vc.vcType);
		};

		jSetup.jambiMenu.vc.vcPush.click = function () {
			jambi.vcPush(activeProject.vc.vcType);
		};
	}
	vcClick();


    function listFunctions() {
        var options = {
            "bootstrap_css": '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">',
            "bootstrap_js": '<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>',
            "jquery": '<script src="https://code.jquery.com/jquery-2.1.3.min.js"></script>',
            "angular": '<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js"></script>',
            "ajax_get": '',
            "ajax_post": ''
        }

        $('#sideListForLoop').off('dblclick');
        $('.cdn-list').on('click');
        $('.cdn-list').on('click', function(){
            $('.cdn-list').removeClass('active');
            $(this).addClass('active');
        });
        $('.cdn-list').on('dblclick', function(){
            var x = $(this).data('option');
            jambi.insertAtCursor(options[x]);
        });

        $('#sideListForLoop').on('dblclick', function(){
            var loopCount = prompt("Loop up to:", "10");
            if(loopCount != null) {
                jambi.insertAtCursor("for(var i = 0; i <= " + loopCount + "; i++) {\n\n}");
            }
        });
        $('#commitAll').off('click');
        $('#vcPull').off('click');
        $('#vcPush').off('click');

        if(activeProject) {
            if(activeProject.vc.vcInitialised) {
                $('#commitAll').on('click', function(){
                    if(activeProject.vc.vcInitialised) {
                        jambi.vcCommit(activeProject.vc.vcType);
                    }
                });
                $('#vcPull').on('click', function(){
                    if(activeProject.vc.vcInitialised) {
                        jambi.vcPull(activeProject.vc.vcType);
                    }
                });
                $('#vcPush').on('click', function(){
                    if(activeProject.vc.vcInitialised) {
                        jambi.vcPush(activeProject.vc.vcType);
                    }
                });
            } else {
                $('#vcPush').attr('disabled','disabled');
                $('#vcPull').attr('disabled','disabled');
                $('#commitAll').attr('disabled','disabled');
            }
        }
    }



	// Routers

	var Router = Backbone.Router.extend({
		routes: {
			'home': 'home',
			'project': 'projects',
			'tools' : 'tools',
			'showcase': 'showcase'
		}
	});


	var editorView = new EditorView();
	var projectView = new ProjectView();
	var toolsView = new ToolsView();
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

		var $el = $('#sidebarcontent');
		$el.append(render('sidebar/file', {}));
		$el.append(render('sidebar/list', {}));
		$el.append(render('sidebar/connection', {}));
		sideBarMenus();

		generateFilSystem();
		showSidebarToggle();
		$('#jambi-body').css('background-color', '#444');

		vcMenuSetup();
		listFunctions();
        $('#showcaseLink').show();

	});

	router.on('route:tools', function() {
    	$('#showcaseLink').show();
		setActiveDocument();
		if(activeDocument !== undefined) {
			saveCurrentDocument(openDocuments.get(activeDocument));
		}
		toolsView.render();
		hideSidebarToggle()
		isEditorOpen = false;



		$("#DateCountdown").TimeCircles({
			"animation": "smooth",
			"bg_width": 1.3,
			"fg_width": 0.06,
			"circle_bg_color": "#60686F",
			"time": {
				"Days": {
					"text": "Days",
					"color": "#FFCC66",
					"show": true
				},
				"Hours": {
					"text": "Hours",
					"color": "#99CCFF",
					"show": true
				},
				"Minutes": {
					"text": "Minutes",
					"color": "#BBFFBB",
					"show": true
				},
				"Seconds": {
					"text": "Seconds",
					"color": "#FF9999",
					"show": true
				}
			}
		});


		$('#jambi-body').css('background-color', '#fff');
		vcMenuSetup();


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
		hideSidebarToggle();
		$('#jambi-body').css('background-color', '#444');
		vcMenuSetup();
		$('#showcaseLink').hide();
	});


	router.on('route:showcase', function() {
		setActiveDocument();
		if(activeDocument !== undefined) {
			saveCurrentDocument(openDocuments.get(activeDocument));
		}
		var spawn = require('child_process').spawn;
        var shell = require('shelljs');
        if(jModel.getActiveProject()) {
            var child = shell.exec('cd ' + jModel.getActiveProject().root + '&& python -m SimpleHTTPServer', function(code, output) {
                setTimeout(function(){
                    showcaseView.render();
            		hideSidebarToggle()
            		isEditorOpen = false;
            		$('#jambi-body').css('background-color', '#444');
                    vcMenuSetup();
                }, 1000);
            });
            setTimeout(function () {
                child.kill();
            }, 10000);
        }



	});



	Backbone.history.start();

	jambi.initCodeMirror();

	// if in project then start home else start project
	window.location.replace("#/project");





	return {
		newFile: function() { newDocument (); return true;},
		openFile: function(filename, filecontents, filemode, fileLocation) {
			return newDocument(filename, filecontents, filemode, fileLocation);
		},
		closeCurrentDoc: function() { return closeCurrentDocument(); },
		closeAllDocs: function() { return removeAllDocuments (); },
		getActiveDocument: function() { return openDocuments.get(activeDocument); },
		setDocLocation: function(loc) { return openDocuments.get(activeDocument).fileLocation = loc; },
		setDocName: function(name) { openDocuments.get(activeDocument).title = name; populateTopBar(activeDocument); },
		onEditorPage: function() { return isEditorOpen; },
		getActiveProject: function() { return activeProject; },
		addFileToProject: function(filename, fileLocation, filemode) { return addFileToProjectJSON(filename, fileLocation, filemode)},
		checkFileTypes: function (fileType) { return checkFileType(fileType); },

		saveAllProjects: function() {
			return saveProjectsJSON();
		}
	};
};

var jModel = new jambiModel();