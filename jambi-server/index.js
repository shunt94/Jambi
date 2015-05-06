var express = require('express')
var app = express();

app.set('port', (process.env.PORT || 8000))
app.use(express.static(__dirname + '/public'))

app.get('/api/jambi',function(req, res) {
	res.json({
		"jambi": {
			"status": "Connected",
			"version": "1.0"
		}
	});
});

app.get('/api', function(req,res) {
	res.json({
		"cdns": {
			"bootstrap_css": "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css",
			"bootstrap_js": "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js",
			"bootstrap_theme": "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css",
			"jquery": "https://code.jquery.com/jquery-2.1.1.min.js",
			"angluar": "https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js"
		}
	});
});

app.get('*', function(req,res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
