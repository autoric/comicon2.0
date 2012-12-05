var comicon = comicon || {};

(function(comicon){
    $(function(){
        //grab the templates and setup backbone views
        $.get('/templates', function (data) {
            comicon.templates = data;
            comicon.initViews();
            startApp();
        });

        function startApp(){
            comicon.app = new comicon.views.App();

            Backbone.history.start({pushState:true});
        }
    });
}) (comicon)