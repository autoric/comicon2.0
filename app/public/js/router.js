comicon = comicon || {};

(function (comicon) {
    comicon.Router = Backbone.Router.extend({
        routes:{
            '':'index',
            'signup':'signup',
            'newComic':'newComic',
            'comics':'browse',
            'comics/p:page':'browse',
            'comics/new':'newComic',
            'users/:userId':'userPage'
        },
        index: function(){
            var view = new comicon.views.IndexView({model:comicon.app.model});
            comicon.app.showView(view);

        },
        userPage:function (id) {
            var view = new comicon.views.UserPageView({model:comicon.app.model});
            comicon.app.showView(view);
        },
        signup:function () {
            var view = new comicon.views.SignupView({model:comicon.app.model});
            comicon.app.showView(view);
        },
        browse:function (page) {
            var view = new comicon.views.BrowseView({model:comicon.app.model});
            comicon.app.showView(view);
        },
        newComic:function () {
            var view = new comicon.views.NewComicView({model:comicon.app.model});
            comicon.app.showView(view);
        }
    });
})(comicon)