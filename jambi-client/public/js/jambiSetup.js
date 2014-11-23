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
	
	// Text Menus
	var textSubmenu = new gui.Menu();
	
	// Insert Menus
	var insertSubmenu = new gui.Menu();
	
	// Instas Menus 
	var instasSubmenu = new gui.Menu();
	
	// Version Control Menus
	var vcSubmenu = new gui.Menu();
	
	
	
	// Data structure to hold the menubar -- used to access menuitems later
	var jambiMenu = {
		file: {
			fileNew: 			new gui.MenuItem({ label: 'New', submenu: fileNewSub }),
			fileNewSubmenu: [
				{key: 'new_html', 		value: new gui.MenuItem({ label: 'Html' })},
				{key: 'new_css',		value: new gui.MenuItem({ label: 'Css' })},
				{key: 'new_js',			value: new gui.MenuItem({ label: 'Js' })},
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
			fileSaveAs:			new gui.MenuItem({ label: 'Save As...', key: "s",modifiers: "cmd-shift" }),
			fileClearSettings:	new gui.MenuItem({ label: 'Clear Settings' })
		},
		view: {
			
		},
		text: {
			
		},
		insert: {
			
		},
		instas: {
			
		},
		vc: {
			
		}
	}
	
	

	
	
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
		fileSubmenu.append(new gui.MenuItem({ type: 'separator' }));
		fileSubmenu.append(jambiMenu.file.fileClearSettings);
	})();
	

	
	addTopMenu(fileSubmenu, "File", 1);
	addTopMenu(viewSubmenu, "View", 3);
	addTopMenu(textSubmenu, "Text", 4);
	addTopMenu(insertSubmenu, "Insert", 5);
	addTopMenu(instasSubmenu, "Instas", 6);
	addTopMenu(vcSubmenu, "Version Control", 7);
	win.menu.append(new gui.MenuItem({ label: 'Help', submenu: new gui.Menu()}));
	

	
	function addTopMenu(subMenu, nameLabel, pos) {
		menuBar.insert(new gui.MenuItem({ label: nameLabel, submenu: subMenu}), pos);
	} 

	return {
		gui: gui,
		jambiMenu: jambiMenu
	}	
}
