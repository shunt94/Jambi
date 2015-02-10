var walk    = require('walk');
var files   = [];

// Walker options
var walker  = walk.walk('addons', { followLinks: false });

walker.on('file', function(root, stat, next) {
    // Add this file to the list of files
    var extension = stat.name.split('.').pop();
    if(extension === 'js' || extension === 'Js' || extension === 'JS' || extension === 'jS' ) {
        files.push(root + '/' + stat.name);
    }
    next();
});

walker.on('end', function() {
    for(var i = 0; i < files.length; i++){
        $.getScript(files[i], function(){
            // Done
        });
    }
});