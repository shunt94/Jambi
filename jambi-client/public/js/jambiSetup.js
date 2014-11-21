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
	
	var file = {
		fileNew: 		new gui.MenuItem({ label: 'New', submenu: fileNewSub }),
		fileNewSubmenu: {
			new_html: 		new gui.MenuItem({ label: 'HTML' }),
			new_css:		new gui.MenuItem({ label: 'CSS' }),
			new_js:			new gui.MenuItem({ label: 'JS' })
		},
		fileNewProject:		new gui.MenuItem({ label: 'New Project' })
	}
	
	
	fileSubmenu.append(file.fileNew);
	
	fileNewSub.append(file.fileNewSubmenu.new_html);
	fileNewSub.append(file.fileNewSubmenu.new_css);
	fileNewSub.append(file.fileNewSubmenu.new_js);
	
	fileSubmenu.append(file.fileNewProject);
	
	fileSubmenu.append(new gui.MenuItem({ type: 'separator' }));
	
	
	addTopMenu(fileSubmenu, "File", 1);
	
	
	function addTopMenu(subMenu, nameLabel, pos) {
		menuBar.insert(new gui.MenuItem({ label: nameLabel, submenu: subMenu}), pos);
	} 
	
	

	return {
		gui: gui,
	}	
}
