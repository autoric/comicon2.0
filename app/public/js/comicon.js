$(function () {
    var templates = {};
    $.get('/templates', function (data) {
        templates = data;
        console.log(templates);
        backboneSetup();
    })


    function backboneSetup() {


        var Comic = Backbone.Model.extend({
            idAttribute:'_id',
            qs:{},
            urlRoot:'/comics'
        });

        var LoginModel = Backbone.Model.extend({
            idAttribute:'_id',
            urlRoot:'/users/login'
        });

        var Comics = Backbone.Collection.extend({
            model:Comic,
            qs:{},
            url:function () {
                var base = '/comics';
                var queryString = ''
                _.each(this.qs, function (value, term) {
                    queryString += (term + '=' + value);
                });
                if (queryString) {
                    queryString = '?' + queryString;
                }

                return base + queryString;
            }
        });

        var App = Backbone.View.extend({
            el:$('body'),
            events:{
                'click a':'navigate'
            },
            initialize:function () {
                _.bindAll(this);
                this.router = new Router();
                this.loginView = new NavBarView();
            },
            navigate:function (e) {
                var $link = $(e.currentTarget);
                var href = $link.attr('href');
                //all relative links
                if (href[0] == '/') {
                    this.router.navigate(href, true);
                    return false;
                }
            }
        });

        var BrowserView = Backbone.View.extend({
            el:$('#content'),
            template:templates.browse,
            render:function () {
                var self = this;
                var $view = $(Mustache.render(self.template));
                var $list = $view.filter('#list');

                var comics = new Comics();
                comics.qs._limit = 10;
                comics.fetch({
                    success:function () {
                        comics.forEach(function (comic, i) {
                            var view = new ComicView({model:comic}).render();
                            $list.append(view);
                        });
                        self.$el.html($view);
                    }
                });
            }
        });

        var UserPageView = Backbone.View.extend({
            el:$('#content'),
            template:templates.userpage,
            userId:null,
            render:function () {
                var self = this;
                var $view = $(Mustache.render(self.template, {userId:self.userId}));
                var $comics = $view.filter('#comics');

                var comics = new Comics();
                if (self.userId) {
                    comics.qs = {
                        subscribers:self.userId
                    }
                }
                comics.fetch({
                    success:function () {
                        var views = [];
                        comics.forEach(function (comic) {
                            var view = new ComicView({model:comic}).render();
                            $comics.append(view);
                        })
                        self.$el.html($view);
                    },
                    error:function () {
                        //TODO: revisit this - needs to return 404 if user dne
                    }
                });
            }
        });

        var ComicView = Backbone.View.extend({
            className:'comic-container',
            template:templates.comic,
            events:{
                'click .detail-view':'detailView'
            },
            render:function () {
                var comic = this.model;
                var markup = Mustache.render(this.template, comic.toJSON());
                return this.$el.html(markup);
            },
            detailView:function () {
                var detailView = new ComicDetailView({model:this.model}).render();
                return false;
            }
        });

        var ComicDetailView = Backbone.View.extend({
            el:$('#modal-container'),
            template:templates.comicDetail,
            render:function () {
                var view = Mustache.render(this.template, this.model.toJSON());
                this.$el.html(view);
                this.$el.modal('show');
            }

        });

        var NavBarView = Backbone.View.extend({
            el:$('#navbar-container'),
            template:templates.navbar,
            events:{
                'click #login-button':'showLogin',
                'click #logout-button':'logout'
            },
            initialize:function () {
                this.model = new LoginModel();
                this.model.on('change:username', this.render, this);
                this.model.fetch();
            },
            render:function () {
                var view = Mustache.render(this.template, this.model.toJSON());
                this.$el.html(view);
            },
            logout:function (e) {
                var self = this;
                $.ajax({
                    url:'/users/login',
                    type:'delete',
                    success:function () {
                        self.model.set('username', null);
                    }
                }).error(function (err) {
                        console.log(err);
                    });
                return false;
            },
            showLogin:function () {
                var loginView = new LoginView({model:this.model}).render();
                return false;
            }
        });

        var LoginView = Backbone.View.extend({
            el:$('#modal-container'),
            template:templates.login,
            initialize:function () {
                this.model.on('change:error', this.showError, this);
            },
            events:{
                'click #login-submit':'login'
            },
            hide:function () {
                this.$el.modal('hide');
            },
            render:function () {
                var view = Mustache.render(this.template, {});
                this.$el.html(view);
                this.$el.modal('show');
            },
            login:function () {
                var self = this;
                self.model.set('error', '');
                var username = $('#username-input').val();
                var password = $('#password-input').val();
                auth = {
                    username:username,
                    password:password
                }
                self.model.save(auth, {wait:true,
                    success:function () {
                        self.hide();
                    },
                    error:function (model, resp) {
                        var msg;
                        if (resp.status == 401) {
                            msg = 'Incorrect username or password. Please try again.'
                        }
                        else {
                            msg = 'There was an error connecting to the server. Please try again'
                        }
                        self.model.set('error', msg);
                    }});

                return false;
            },
            showError:function () {
                var msg = this.model.get('error')
                $('#login-error-container').hide();
                $('#login-error-container').text(msg).fadeIn('fast');
            }
        })

        var NewAccountView = Backbone.View.extend({
            el:$('#content'),
            template:templates.signup,
            events:{
                'blur input':'validate',
                'click #newAccount-submit':'submit'
            },
            render:function () {
                var view = Mustache.render(this.template);
                this.$el.html(view);
            },
            validate:function (e) {
                var $element = $(e.currentTarget);
                var $controlGroup = $element.closest('.control-group');
                var field = $element.attr('id');
                var val = $element.val();

                $controlGroup.removeClass('success error');

                validator = {
                    newUsername:function () {
                        $.get('/users?username=' + val, function (data) {
                            if (data.length == 0) {
                                $controlGroup.addClass('success');
                            }
                            else {
                                $controlGroup.addClass('error');
                            }
                        });
                    },
                    newPassword:function () {
                        if (val.length > 5) {
                            $controlGroup.addClass('success');
                        } else {
                            $controlGroup.addClass('error');
                        }
                    },
                    confirmPassword:function () {
                        var pw = $('#newPassword').val();
                        if (val == pw) {
                            $controlGroup.addClass('success');
                        }
                        else {
                            $controlGroup.addClass('error');
                        }
                    }
                }

                validator[field]();
            },
            submit:function () {
                var user = new LoginModel({
                    username:$('#newUsername').val(),
                    password:$('#newPassword').val()
                });
                user.urlRoot = '/users';

                user.save({}, {
                    success:function () {
                        app.router.navigate('/' + username, true);
                    },
                    error:function () {
                        console.log('error!');
                    }
                });

            }

        })

        var Router = Backbone.Router.extend({
            routes:{
                '':'userPage',
                "signup":'signup',
                'newComic':'newComic',
                'browse':'browse',
                ':userId':'userPage'
            },
            userPage:function (id) {
                var page = new UserPageView();
                page.userId = id;
                page.render();
            },
            signup:function () {
                var view = new NewAccountView();
                view.render();
            },
            browse:function () {
                var view = new BrowserView().render();
            },
            newComic:function () {

            }
        });

        var app = new App({
            model:new LoginModel()
        });

        Backbone.history.start({pushState:true, silent:true });
    }
})