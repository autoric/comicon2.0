var async = require('async');

module.exports = function(app) {
    var Users = app.models.users;
    var Comics = app.models.comics;

    var controller = {};

    controller.index = [
        function(req, res, next) {
            req.view = 'index.html';
            Comics.find().limit(10).exec(function(err, docs) {
                if(err) return next(err);
                res.locals.viewParams.comics = docs;
                next();
            })
        }
    ]
    controller.userPage = [
        function(req, res, next) {
            req.view = 'userpage.html';
            var username = req.params.username;
            Users.findOne({username: username}).populate().exec(function(err, user){
                if(err) return next(err);
                if(user===null) return res.send(404);
                res.locals.viewParams.user = user;
                next();
            })
        }
    ]
    controller.browseComics = [
        function(req, res, next) {
            req.view = 'browse.html';
            var page = req.params.page || 1;
            var limit = 2;

            res.locals.viewParams.page = page;

            var tasks = [
                function(cb){
                    Comics.find().count().exec(function(err, count){
                        console.log(count)

                        if(err) return cb(err);
                        res.locals.viewParams.pages = Math.ceil(count / limit);
                        return cb();
                    })
                },
                function(cb){
                    Comics.find().sort({name:'asc'}).limit(limit).skip((page-1)*limit).exec(function(err, docs) {
                        console.log(docs)

                        if(err) return cb(err);
                        if(docs === null && page>1) return res.send(404);
                        res.locals.viewParams.comics = docs;
                        return cb();
                    })
                }
            ];

            async.parallel(tasks, next);
        }
    ]
    controller.signup = [
        function(req, res, next) {
            req.view = 'signup.html';
            next();
        }
    ]
    controller.login = [
        function(req, res, next) {
            var username = req.body.username;
            var password = req.body.password;
            Users.findOne({username: username}, function(err, user) {
                //TODO: WWW-Authenticate / challenge header on not found user or bad password?
                if(err) next(err);
                if(user === null) res.send(401)
                user.authenticate(password, function(err, success) {
                    if(err) next(err);
                    if(!success) return res.send(401);
                    //TODO: redirect?
                    req.session.user = user;
                    return res.send(200)
                });
            })

        }
    ]
    controller.logout = [
        function(req, res, next) {
            req.session.user = null;
            return res.send(204);
        }
    ]


    return controller;

}