(function() {


var submenu1 = [
    {
        "label": "TestSub1", 
        "click": function() {
            //jambi.createModal("modalTitle", "modalSubtitle", "modalContent", "Save");
            //jambi.openModal();
            console.log(jambi.getJambiEditor().getHistory());
        } 
    }
]
var test = jSetup.addAddon("asd", submenu1);

var html = '<div> Addon Test </div>';

jambi.addSideMenu("Addon Test", html);


})();