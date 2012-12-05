var async = require('async');

module.exports = function (app) {
    var Users = app.models.users;
    var Comics = app.models.comics;

    var controller = {};

    controller.index = [
        function (req, res, next) {
            res.view = 'index.html';
            Comics.find().limit(10).exec(function (err, docs) {
                if (err) return next(err);
                res.locals.viewData.comics = docs;
                next();
            })
        }
    ]
    controller.userPage = [
        function (req, res, next) {
            res.view = 'userpage.html';
            var username = req.params.username;
            Users.findOne({username:username}, {password:0}).populate('subscriptions').exec(function (err, user) {
                if (err) return next(err);
                if (user === null) return res.send(404);
                res.locals.viewData.owner = user;
                next();
            })
        }
    ]
    controller.browseComics = [
        function (req, res, next) {
            res.view = 'browse.html';
            var page = req.params.page || 1;
            var limit = 2;

            var tasks = [
                function (cb) {
                    Comics.find().count().exec(function (err, count) {
                        if (err) return cb(err);
                        var numPages = Math.ceil(count / limit);
                        var pages = [];
                        for (var i = 1; i <= numPages; i++) {
                            pages.push({
                                page:i,
                                active:i === page
                            })
                        }
                        res.locals.viewData.pages = pages;
                        res.locals.viewData.prev = {
                            page:page-1,
                            disabled:page==1
                        }
                        res.locals.viewData.next = {
                            page:parseInt(page)+1,
                            disabled:page==numPages
                        }
                        return cb();
                    })
                },
                function (cb) {
                    Comics.find().sort({name:'asc'}).limit(limit).skip((page - 1) * limit).exec(function (err, docs) {
                        if (err) return cb(err);
                        if (docs.length === 0 && page > 1) return res.send(404);
                        res.locals.viewData.comics = docs;
                        return cb();
                    })
                }
            ];

            async.parallel(tasks, next);
        }
    ]
    controller.signup = [
        function (req, res, next) {
            res.view = 'signup.html';
            next();
        }
    ]
    controller.newComic = [
        function (req, res, next) {
            res.view = 'newcomic.html';
            next();
        }
    ]
    controller.login = [
        function (req, res, next) {
            var username = req.body.username;
            var password = req.body.password;
            Users.findOne({username:username}, function (err, user) {
                //TODO: WWW-Authenticate / challenge header on not found user or bad password?
                if (err) next(err);
                if (user === null) {
                    return res.send(401);
                }
                user.authenticate(password, function (err, success) {
                    if (err) next(err);
                    if (!success) return res.send(401);
                    //TODO: redirect?
                    req.session.user = user._id;
                    //TODO: do not need to return full user object on login - no need for password...maybe not subscriptions?
                    return res.json(user);
                });
            })

        }
    ]
    controller.logout = [
        function (req, res, next) {
            req.session.user = null;
            return res.send(204);
        }
    ]
    controller.templates = [
        function (req, res, next) {
            res.json(app.settings.templates);
        }
    ]
    controller.scrape = [
        function(req, res, next){
            var body = req.body;
            app.scrape(body.url, body.selectors, function(err, values){
                //TODO: work on url to make fully qualified (attempt prepend protocol, etc)
                if(err) return next(err);
                return res.json(values);
            });
        }
    ]


    return controller;
}