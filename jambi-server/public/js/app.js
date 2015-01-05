(function() {
// This function is taken from StackOverflow - http://stackoverflow.com/questions/8366733/external-template-in-underscore
function render(tmpl_name, tmpl_data) {
    if ( !render.tmpl_cache ) { 
        render.tmpl_cache = {};
    }
    if ( ! render.tmpl_cache[tmpl_name] ) {
        var tmpl_dir = '../views';
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


function setActiveMenu(menuitem) {
    $('.navbar-nav li').removeClass('active');
    var newItem = '#menuItem_' + menuitem; 
    $(newItem).addClass('active');
    window.scrollTo(0,0);
}


var Home = Backbone.View.extend({
    el: '#content',
    render: function(){
        this.$el.html(render('index', {}));
    }
});

var AboutView = Backbone.View.extend({
    el: '#content',
    render: function(){
        this.$el.html(render('about', {}));
    }
});

var FeaturesView = Backbone.View.extend({
    el: '#content',
    render: function(){
        this.$el.html(render('features', {}));
    }
});

var APIView = Backbone.View.extend({
    el: '#content',
    render: function(){
        this.$el.html(render('api', {}));
    }
});

var DownloadView = Backbone.View.extend({
    el: '#content',
    render: function(){
        this.$el.html(render('downloads', {}));
    }
});

var DocsView = Backbone.View.extend({
    el: '#content',
    render: function(){
        this.$el.html(render('docs', {}));
    }
});

var SupportView = Backbone.View.extend({
    el: '#content',
    render: function(){
        this.$el.html(render('support', {}));
    }
});


var NotFoundView = Backbone.View.extend({
    el: '#content',
    render: function(){
        this.$el.html(render('notfound', {}));
    }
});

var Router = Backbone.Router.extend({
    routes: {
        '': 'home',
        'home': 'home',
        'about': 'about',
        'features': 'feautres',
        'docs': 'docs',
        'api': 'api',
        'support': 'support',
        'downloads': 'downloads',
        '*path':  'defaultRoute'
    }
});


var home = new Home();
var aboutView = new AboutView();
var featuresView = new FeaturesView();
var docsView = new DocsView();
var apiView = new APIView();
var supportView = new SupportView();
var downloadView = new DownloadView();
var notFoundView = new NotFoundView();

var router = new Router();
router.on('route:home', function() {
    home.render();
    setActiveMenu('home');
});

router.on('route:about', function() {
    aboutView.render();
    setActiveMenu('about');
});

router.on('route:feautres', function() {
    featuresView.render();
    setActiveMenu('features');
});

router.on('route:docs', function() {
    docsView.render();
    setActiveMenu('docs');
});

router.on('route:downloads', function() {
    downloadView.render();
    setActiveMenu('downloads');
});

router.on('route:support', function() {
    supportView.render();
    setActiveMenu('support');
});

router.on('route:api', function() {
    apiView.render();
    setActiveMenu('api');
});

router.on('route:defaultRoute', function() {
    notFoundView.render();
});

Backbone.history.start();
})();