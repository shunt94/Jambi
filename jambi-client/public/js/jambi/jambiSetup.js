var jambiSetup = function() {
	var gui = require('nw.gui');
	var win = gui.Window.get();
	var menuBar = new gui.Menu({ type: 'menubar' });

	if(process.platform == "darwin") {
		menuBar.createMacBuiltin('Jambi');
	}
	win.menu = menuBar;

	// File Menus
	var fileSubmenu = new gui.Menu();
	var fileNewSub = new gui.Menu();

	// View Menus
	var viewSubmenu = new gui.Menu();


	// tools Menus
	var toolsSubmenu = new gui.Menu();
	var addonSubmenu = new gui.Menu();
	var flowSubmenu = new gui.Menu();

	// Instas Menus
	var instasSubmenu = new gui.Menu();

	// Version Control Menus
	var vcSubmenu = new gui.Menu();

	// Settings Menus
	var settingsSubmenu = new gui.Menu();



	// Data structure to hold the menubar -- used to access menuitems later
	var jambiMenu = {
		file: {
			fileNew:			new gui.MenuItem({ label: 'New', submenu: fileNewSub }),
			fileNewSubmenu: [
				{key: 'new_html',		value: new gui.MenuItem({ label: 'Html', key: "t", modifiers: "cmd" })},
				{key: 'new_css',		value: new gui.MenuItem({ label: 'Css' })},
				{key: 'new_js',			value: new gui.MenuItem({ label: 'Javascript' })},
				{key: 'new_scss',		value: new gui.MenuItem({ label: 'Scss' })},
				{key: 'new_less',		value: new gui.MenuItem({ label: 'Less' })},
				{key: 'new_sass',		value: new gui.MenuItem({ label: 'Sass' })},
				{key: 'new_python',		value: new gui.MenuItem({ label: 'Python' })}
			],
			fileNewProject:		new gui.MenuItem({ label: 'New Project' }),
			fileOpen:			new gui.MenuItem({ label: 'Open', key: "o", modifiers: "cmd" }),
			fileOpenRecent:		new gui.MenuItem({ label: 'Open Recent' }),
			fileClose:			new gui.MenuItem({ label: 'Close' }),
			fileCloseAll:		new gui.MenuItem({ label: 'Close All' }),
			fileSave:			new gui.MenuItem({ label: 'Save', key: "s", modifiers: "cmd" }),
			fileSaveAll:		new gui.MenuItem({ label: 'Save All' }),
			fileSaveAs:			new gui.MenuItem({ label: 'Save As...', key: "s",modifiers: "cmd-shift" }),
			fileClearSettings:	new gui.MenuItem({ label: 'Clear Settings' })
		},
		view: {
			viewProjects:  new gui.MenuItem({ label: 'Projects' }),
			viewShowcase:  new gui.MenuItem({ label: 'Showcase' }),
			viewEditor:    new gui.MenuItem({ label: 'Editor' })
		},
		instas: {
			instasMenu:     new gui.MenuItem({ label: 'Instas'}),
			instasNew:      new gui.MenuItem({ label: 'Add New Insta..'})
		},
		tools: {
			toolsAddons:            new gui.MenuItem({ label: 'Addons', submenu: addonSubmenu }),
			toolsFlow:              new gui.MenuItem({ label: 'Flow', submenu: flowSubmenu }),
			toolsFlowFlowCode:      new gui.MenuItem({ label: 'Flow Code' }),
			toolsFlowFlowSettings:  new gui.MenuItem({ label: 'Settings' }),
			toolsSass:                 new gui.MenuItem({ label: 'Compile Sass' })
		},
		vc: {
			vc:       new gui.MenuItem({ label: 'Setup Version Control'}),
			vcPull:   new gui.MenuItem({ label: 'Pull'}),
			vcCommit: new gui.MenuItem({ label: 'Commit..'}),
			vcPush:   new gui.MenuItem({ label: 'Push'})

		},
		settings: {
			settingsFont:       new gui.MenuItem({ label: 'Font Options'}),
			settingsSyntax:     new gui.MenuItem({ label: 'Syntax Mode'}),
			settingsTheme:      new gui.MenuItem({ label: 'Theme'})
		}
	};





	// Generate The File Menu
	var generateFileMenu = (function() {
		// File --> New Menu Adding
		for(var x = 0; x < jambiMenu.file.fileNewSubmenu.length; x++) {
			fileNewSub.append(jambiMenu.file.fileNewSubmenu[x].value);
		}

		// Build Menu
		fileSubmenu.append(jambiMenu.file.fileNew);
		fileSubmenu.append(jambiMenu.file.fileNewProject);
		fileSubmenu.append(new gui.MenuItem({ type: 'separator' }));
		fileSubmenu.append(jambiMenu.file.fileOpen);
		fileSubmenu.append(jambiMenu.file.fileOpenRecent);
		fileSubmenu.append(new gui.MenuItem({ type: 'separator' }));
		fileSubmenu.append(jambiMenu.file.fileClose);
		fileSubmenu.append(jambiMenu.file.fileCloseAll);
		fileSubmenu.append(new gui.MenuItem({ type: 'separator' }));
		fileSubmenu.append(jambiMenu.file.fileSave);
		fileSubmenu.append(jambiMenu.file.fileSaveAs);
		fileSubmenu.append(jambiMenu.file.fileSaveAll);
		fileSubmenu.append(new gui.MenuItem({ type: 'separator' }));
		fileSubmenu.append(jambiMenu.file.fileClearSettings);
	})();

	var generateViewMenu = (function() {
		viewSubmenu.append(jambiMenu.view.viewProjects);
		viewSubmenu.append(new gui.MenuItem({ type: 'separator' }));
		viewSubmenu.append(jambiMenu.view.viewShowcase);
		viewSubmenu.append(new gui.MenuItem({ type: 'separator' }));
		viewSubmenu.append(jambiMenu.view.viewEditor);
	})();


	var generateInstasMenu = (function(){
		instasSubmenu.append(jambiMenu.instas.instasMenu);
		instasSubmenu.append(jambiMenu.instas.instasNew);
	})();

	var generateToolsMenu = (function(){
		toolsSubmenu.append(jambiMenu.tools.toolsAddons);

		flowSubmenu.append(jambiMenu.tools.toolsFlowFlowCode);
		flowSubmenu.append(jambiMenu.tools.toolsFlowFlowSettings);

		toolsSubmenu.append(jambiMenu.tools.toolsFlow);
		toolsSubmenu.append(jambiMenu.tools.toolsSass);
	})();

	var generateVCMenu = (function(){
		vcSubmenu.append(jambiMenu.vc.vc);
		vcSubmenu.append(new gui.MenuItem({ type: 'separator' }));
		vcSubmenu.append(jambiMenu.vc.vcPull);
		vcSubmenu.append(jambiMenu.vc.vcCommit);
		vcSubmenu.append(jambiMenu.vc.vcPush);

	})();

	var generateSettingsMenu = (function(){
		settingsSubmenu.append(jambiMenu.settings.settingsFont);
		settingsSubmenu.append(jambiMenu.settings.settingsSyntax);
		settingsSubmenu.append(jambiMenu.settings.settingsTheme);
	})();



	addTopMenu(fileSubmenu, "File", 1);
	addTopMenu(viewSubmenu, "View", 3);
	addTopMenu(instasSubmenu, "Instas", 4);
	addTopMenu(toolsSubmenu, "Tools", 5);
	addTopMenu(vcSubmenu, "Version Control", 6);
	addTopMenu(settingsSubmenu, "Settings", 7);

	win.menu.append(new gui.MenuItem({ label: 'Help', submenu: new gui.Menu()}));

	function addTopMenu(subMenu, nameLabel, pos) {
		menuBar.insert(new gui.MenuItem({ label: nameLabel, submenu: subMenu}), pos);
	}

	onload = function() {
        gui.Window.get().show();
    }



	return {
		gui: gui,
		jambiMenu: jambiMenu,
		addAddon: function(name, sub) {
		    var subMenuItem = new gui.Menu();
		    if(sub) {
		        for(var i = 0; i < sub.length; i++) {
		            var subItem = new gui.MenuItem({ label: sub[i].label });
		            subItem.click = sub[i].click;

    		        subMenuItem.append(subItem);

		        }
    		    var mItem = new gui.MenuItem({ label: name, submenu: subMenuItem });
		    }
		    else {
    		    var mItem = new gui.MenuItem({ label: name });
		    }
            addonSubmenu.append(mItem);
            return mItem;
        }
	};
};