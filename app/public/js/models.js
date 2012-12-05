comicon = comicon || {};

(function (comicon) {
    var models = {};

    models.Comic = Backbone.Model.extend({
        idAttribute:'_id',
        qs:{},
        urlRoot:'/api/comics',
        defaults:{
            selectors: {},
            values: {}
        }
    });

    models.User = Backbone.Model.extend({
        idAttribute:'_id',
        urlRoot:'/api/users',
        subscribe:function (id, cb) {
            var self = this;
            var url = this.url() + '/subscriptions';
            $.post(url, {id:id},function (data) {
                self.set(data);
            }).error(function (xhr) {
                    cb(xhr.status);
                });
        },
        unsubscribe:function (id, cb) {
            var self = this;
            var url = this.url() + '/subscriptions/' + id;
            $.ajax({
                url:url,
                type:'delete',
                success:function (data) {
                    self.set(data);
                }
            }).error(function (xhr) {
                    cb(xhr.status);
                });
        },
        login:function (username, password, cb) {
            var self = this;
            $.post('/login', {username:username, password:password},function (data) {
                self.set(data);
            }).error(function (xhr, status) {
                    cb(xhr.status)
                });
        },
        logout:function (cb) {
            var self = this;
            $.ajax({
                url:'/logout',
                type:'delete',
                success:function () {
                    self.clear();
                }
            }).error(function (xhr, status) {
                    cb(xhr.status);
                });
        }
    });

    models.Comics = Backbone.Collection.extend({
        model:models.Comic,
        qs:{},
        url:function () {
            var base = '/api/comics';
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

    //a model that contains view data for the app view
    models.ViewData = Backbone.Model.extend({
        login:function (username, password, cb) {
            var self = this;
            $.post('/login', {username:username, password:password},function (data) {
                self.set('user', data);
            }).error(function (xhr, status) {
                    cb(xhr.status)
                });
        },
        logout:function (cb) {
            var self = this;
            $.ajax({
                url:'/logout',
                type:'delete',
                success:function () {
                    self.unset('user');
                }
            }).error(function (xhr, status) {
                    cb(xhr.status);
                });
        }
    })

    comicon.models = models;
})(comicon)