(function() {


var submenu1 = [
    {
        "label": "TestSub1",
        "click": function() {
            //jambi.createModal("modalTitle", "modalSubtitle", "modalContent", "Save");
            //jambi.openModal();
            jambi.runCommand('/usr/local/bin/flow --version');
            console.log($('.CodeMirror-cursor').offset().left);
            console.log($('.CodeMirror-cursor').offset().top);
        }
    }
]
var test = jSetup.addAddon("asd", submenu1);

var html = '<div> Addon Test </div>';

jambi.addSideMenu("Addon Test", html);


})();