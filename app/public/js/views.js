comicon = comicon || {};

(function (comicon) {

    //add functionality to close views and prevent memory leaking!
    Backbone.View.prototype.close = function () {
        this.$el.html('');
        this.unbind();
        if (this.onClose) {
            this.onClose();
        }
    }

    comicon.initViews = initViews;

    function initViews() {
        var models = comicon.models;
        var views = {};

        //Main application view
        views.App = Backbone.View.extend({
            el:$('body'),
            events:{
                'click a':'navigate'
            },
            initialize:function () {
                var self = this;
                _.bindAll(this);
                this.router = new comicon.Router();
                this.user = new models.User(comicon.viewData.user);
                this.model = new models.ViewData(comicon.viewData);
                this.navBar = new views.NavBarView({model:this.user}).render();

                this.model.on('change:user', function () {
                    self.user.set(self.model.get('user'));
                })
                this.user.on('change', function () {
                    self.model.set('user', self.user.toJSON());
                })
            },
            navigate:function (e) {
                var self = this
                var $link = $(e.currentTarget);
                var href = $link.attr('href');


                //all relative links
                if (href[0] == '/') {
                    self.model.url = href;
                    self.model.fetch({
                        success:function (model, resp) {
                            self.router.navigate(href, true);
                        },
                        error:function (model, resp) {
                            //TODO: 404 or 500 pages?
                            console.log('ERROR ERROR ERROR')
                        }
                    });
                    return false;
                }
            },
            showView:function (view) {
                if (this.currentView) {
                    this.currentView.close();
                }

                this.currentView = view;
                this.currentView.render();
            }
        });

        views.IndexView = Backbone.View.extend({
            el:$('#content'),
            template:Handlebars.compile(comicon.templates['index']),
            render:function () {
                var self = this;
                var $view = $(self.template(self.model.toJSON()));
                var $comics = $view.filter('#comics');

                var comics = new models.Comics(self.model.get('comics'));

                comics.forEach(function (comic) {
                    var view = new views.ComicView({model:comic}).render();
                    $comics.append(view);
                })
                self.$el.html($view);
            }
        });

        views.UserPageView = Backbone.View.extend({
            el:$('#content'),
            template:Handlebars.compile(comicon.templates['userpage']),
            render:function () {
                var self = this;
                var $view = $(self.template(self.model.toJSON()));
                var $comics = $view.filter('#comics');

                var comics = new models.Comics(self.model.get('owner').subscriptions);

                comics.forEach(function (comic) {
                    var view = new views.ComicView({model:comic}).render();
                    $comics.append(view);
                })
                self.$el.html($view);
            }
        });


        views.SignupView = Backbone.View.extend({
            el:$('#content'),
            template:Handlebars.compile(comicon.templates['signup']),
            events:{
                'blur input':'validate',
                'click #newAccount-submit':'submit'
            },
            render:function () {
                var view = this.template({});
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
                        $.get('api/users?username=' + val, function (data) {
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
                var user = new models.User({
                    username:$('#newUsername').val(),
                    password:$('#newPassword').val()
                })

                user.save({}, {
                    success:function (user) {
                        comicon.app.model.set(user.toJSON());
                        comicon.app.router.navigate('/users/' + user.get('username'), true);
                    },
                    error:function (model, xhr) {
                        console.log('error!');
                    }
                });
            }
        });

        views.BrowseView = Backbone.View.extend({
            el:$('#content'),
            template:Handlebars.compile(comicon.templates['browse']),
            initialize:function () {
                //TODO: consider doing full re-render of table only for change username,
                //allow child elements to update themselves.
                this.model.on('change', this.render, this);
                this.user = comicon.app.user;
            },
            render:function () {
                var self = this;
                var $view = $(self.template(self.model.toJSON()));
                var $list = $view.filter('#comicsList');

                var comics = new models.Comics(self.model.get('comics'));

                comics.forEach(function (comic, i) {
                    var view = new views.ComicBrowseView({model:comic}).render();
                    $list.append(view);
                });
                self.$el.html($view);

            },
            onClose:function () {
                this.model.off('change', this.render, this);
            }
        });

        views.ComicBrowseView = Backbone.View.extend({
            template:Handlebars.compile(comicon.templates['partials/comic-browse']),
            events:{
                'click .subscription-checkbox':'subscribe'
            },
            initialize:function () {
                this.user = comicon.app.user;
            },
            render:function () {
                var viewData = this.model.toJSON();
                viewData.subscribed = _.indexOf(this.user.get('subscriptions'), this.model.id) >= 0;
                viewData._context = {user:this.user.toJSON()};
                var markup = this.template(viewData);
                this.setElement($(markup));
                return this.$el;
            },
            subscribe:function (e) {
                var sub = $(e.target).is(':checked');
                var comicId = this.model.id;
                if (sub) {
                    this.user.subscribe(comicId, this.showError);
                }
                else {
                    this.user.unsubscribe(comicId, this.showError)
                }
                this.wait();
            },
            wait:function () {
                this.$el.addClass('disabled');
            },
            showError:function (err) {
                this.$el.removeClass('disabled');
                var checkbox = this.$el.find('input[type="checkbox"]');
                checkbox.prop('checked', !checkbox.prop('checked'));
                console.log('Error saving subscription');
            }
        });

        views.NewComicView = Backbone.View.extend({
            el:$('#content'),
            template:Handlebars.compile(comicon.templates['newcomic']),
            events:{
                'blur input':'demo',
                'click #newAccount-submit':'submit'
            },
            initialize:function () {
                var self = this;
                self.model = new models.Comic();
                self.demoView = new views.ComicView({model:self.model});
                self.model.on('change:name', self.renderDemo, self);
                self.model.on('change:values', self.renderDemo, self);
            },
            render:function () {
                var view = this.template({});
                this.$el.html(view);
            },
            demo:function (e) {
                var self = this;

                var $target = $(e.target);
                var key = $target.attr('name');
                var val = $target.val();

                var model = self.model.toJSON();

                if (key == 'name' && val !== model.title) {
                    return self.model.set('name', val);
                }
                if (key == 'url' && val !== model.url) {
                    return self.model.set('url', val);
                }

                var url = model.url

                //TODO: if val=='' we dont need to scrape, can just set selector & value to null
                //Also should not trigger error

                //if we have a url to scrape and the selector has changed
                if (url && val !== model.selectors[key]) {
                    $target.parents('.control-group').removeClass('error');

                    var selectors = {};
                    selectors[key] = val;
                    var body = {
                        url:url,
                        selectors:selectors
                    }
                    $.post('/scrape', body).success(updateModel).error(function (xhr) {
                        $target.parents('.control-group').addClass('error');
                        var failedData = {};
                        failedData[key] = undefined;
                        updateModel(failedData)
                    });

                    function updateModel(data) {
                        var values = model.values;
                        values = _.extend(values, data);
                        selectors = _.extend(model.selectors, selectors);
                        self.model.set({
                            selectors:selectors,
                            values:values
                        });
                        self.model.trigger('change:values');
                    }
                }

            },
            renderDemo:function () {
                $('.newcomic-demo-container').html(this.demoView.render());
            },
            submit:function (e) {
                //TODO: validation
                this.model.save({
                    success: function(){
                        comicon.app.router.navigate('/comics', true);
                    },
                    error: function(){

                    }
                })
            },
            onClose: function(){
                var self = this;
                self.demoView.close();
                self.model.off('change:name', self.renderDemo, self);
                self.model.off('change:values', self.renderDemo, self);
            }

        })

        views.ComicView = Backbone.View.extend({
            template:Handlebars.compile(comicon.templates['partials/comic-userpage']),
            events:{
                'click .detail-view':'detailView'
            },
            render:function () {
                var comic = this.model;
                var markup = this.template(comic.toJSON());
                this.setElement($(markup));
                return this.$el;
            },
            detailView:function () {
                var detailView = new views.ComicDetailView({model:this.model}).render();
                return false;
            }
        });

        views.ComicDetailView = Backbone.View.extend({
            el:$('#modal-container'),
            template:Handlebars.compile(comicon.templates['partials/comic-popup']),
            render:function () {
                var view = this.template(this.model.toJSON());
                this.$el.html(view);
                this.$el.modal('show');
            }

        });

        views.NavBarView = Backbone.View.extend({
            el:$('#navbar-container'),
            template:Handlebars.compile(comicon.templates['partials/navbar']),
            events:{
                'click #login-button':'showLogin',
                'click #logout-button':'logout'
            },
            initialize:function () {
                this.model.on('change', this.render, this);
            },
            render:function () {
                var view = this.template({user:this.model.toJSON()});
                this.$el.html(view);
            },
            logout:function (e) {
                this.model.logout(function (err) {
                    alert('There was an error logging out!')
                })
                return false;
            },
            showLogin:function () {
                new views.LoginView({model:this.model}).render();
                return false;
            },
            onClose:function () {
                this.model.off('change', this.render, this);
            }
        });

        views.LoginView = Backbone.View.extend({
            el:$('#modal-container'),
            template:Handlebars.compile(comicon.templates['partials/login']),
            initialize:function () {
            },
            events:{
                'click #login-submit':'login'
            },
            hide:function () {
                this.$el.modal('hide');
            },
            render:function () {
                var view = this.template({});
                this.$el.html(view);
                this.$el.modal('show');
            },
            login:function () {
                var self = this;

                var username = $('#username-input').val();
                var password = $('#password-input').val();

                self.model.on('change:username', function () {
                    self.hide();
                })

                self.model.login(username, password, function (err) {
                    if (err == 401) {
                        self.showError('Incorrect username or password. Please try again.')
                    } else {
                        self.showError('There was an error connecting to the server. Please try again.')
                    }
                });

                return false;
            },
            showError:function (msg) {
                $('#login-error-container').hide();
                $('#login-error-container').text(msg).fadeIn('fast');
            }
        })


        comicon.views = views;
    }
})(comicon)