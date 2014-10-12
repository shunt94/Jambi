var gui = require('nw.gui');
var win = gui.Window.get();
var menuBar = new gui.Menu({ type: 'menubar' });




if(process.platform == "darwin") {
	menuBar.createMacBuiltin('Jambi');
	win.menu = menuBar;
}
else {
	win.menu = menuBar;	
}




/* ----------  Setup menu bar ------------- */
var help = new gui.Menu();


// File Submenus
var fileSubmenu = new gui.Menu();
var newSubmenu = new gui.Menu();
var newSubmenuFile = new gui.Menu();


// File --> New --> File Submenus
newSubmenuFile.append(new gui.MenuItem({ 
	label: 'HTML',  
	click: function() {
		$('.sidebar-content').append('<br>' + "New HTML File");
	}
}));
newSubmenuFile.append(new gui.MenuItem({ 
	label: 'CSS',  
	click: function() {
		$('.sidebar-content').append('<br>' + "New CSS File");
	}
}));
newSubmenuFile.append(new gui.MenuItem({ 
	label: 'JS',  
	click: function() {
		$('.sidebar-content').append('<br>' + "New JS File");
	}
}));
newSubmenuFile.append(new gui.MenuItem({ 
	label: 'SCSS',  
	click: function() {
		$('.sidebar-content').append('<br>' + "New SCSS File");
	}
}));
newSubmenuFile.append(new gui.MenuItem({ 
	label: 'LESS',  
	click: function() {
		$('.sidebar-content').append('<br>' + "New LESS File");
	}
}));

// File --> new submenus
newSubmenu.append(new gui.MenuItem({ label: 'File', submenu:newSubmenuFile }));
newSubmenu.append(new gui.MenuItem({ label: 'Folder' }));
newSubmenu.append(new gui.MenuItem({ type: 'separator' }));
newSubmenu.append(new gui.MenuItem({ label: 'Project' }));

fileSubmenu.append(new gui.MenuItem({ label: 'New', submenu: newSubmenu }));
fileSubmenu.append(new gui.MenuItem({ label: 'New Window' }));

fileSubmenu.append(new gui.MenuItem({ type: 'separator' }));

fileSubmenu.append(new gui.MenuItem({ 
	label: 'Open', 
	click: function() {
		chooseFile('#fileDialog');
	},
	key: "o",
	modifiers: "cmd",
}));

fileSubmenu.append(new gui.MenuItem({ label: 'Open Recent' }));

fileSubmenu.append(new gui.MenuItem({ type: 'separator' }));

fileSubmenu.append(new gui.MenuItem({ label: 'Close' }));
fileSubmenu.append(new gui.MenuItem({ label: 'Close All' }));

fileSubmenu.append(new gui.MenuItem({ type: 'separator' }));

fileSubmenu.append(new gui.MenuItem({ 
	label: 'Save', 
	click: function() {
		$('.sidebar-content').append('<br>' + "Save Menu Click");
	},
	key: "s",
	modifiers: "cmd",
}));

fileSubmenu.append(new gui.MenuItem({ 
	label: 'Save As...', 
	click: function() {
		chooseFile('#saveDialog');
		$('.sidebar-content').append('<br>' + "Save As Menu Click");
	},
	key: "s",
	modifiers: "cmd-shift",
}));







menuBar.insert(new gui.MenuItem({ label: 'File', submenu: fileSubmenu}), 1);

	
menuBar.insert( new gui.MenuItem({label: 'View', submenu: new gui.Menu() }), 3);


menuBar.insert( new gui.MenuItem({label: 'Text', submenu: new gui.Menu() }), 4);


menuBar.insert( new gui.MenuItem({label: 'Insert', submenu: new gui.Menu() }), 5);


menuBar.insert( new gui.MenuItem({label: 'Instas', submenu: new gui.Menu() }), 6);

menuBar.insert( new gui.MenuItem({label: 'Version Control', submenu: new gui.Menu() }), 7);

win.menu = menuBar;


win.menu.append(new gui.MenuItem({ label: 'Help', submenu: help}));




// File Choosers
function chooseFile(name) {
	var chooser = $(name);
	chooser.change(function(evt) {
	  $('.sidebar-content').append("File Location: " + $(this).val());
	  //open($(this).val(), $('#editor').html());
	});
	chooser.trigger('click');  
}

		  //chooseFile('#fileDialog');
		  
// Set window options
onload = function() {
    //win.show();
    //win.maximize();
}