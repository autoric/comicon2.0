var async = require('async');

module.exports = function (app) {
    var Users = app.models.users;
    var Comics = app.models.comics;
    var controller = {};

    /*
     Generic CRUD functions for any model
     */
    controller.search = [
        /*
         route functions get 3 args - the request object, the response object, and next - a callback to move on
         to the next middleware.
         req.query = json object with query string arguments
         req.params = json object with values of routing params such as :model or :id
         req.body = json request body from post / put requests
         */
        function (req, res, next) {
            var query = req.query;
            //req.Model is a value I set in libs/params.js
            req.Model.find(query, function (err, docs) {
                if (err) return next(err);
                return res.json(docs);
            });
        }
    ]
    controller.create = [
        function (req, res, next) {
            var model = new req.Model(req.body);
            model.save(function (err, doc) {
                if (err) return next(err);
                return res.json(doc);
            })
        }
    ]
    controller.read = [
        function (req, res, next) {
            var id = req.params.id;
            req.Model.findById(id, function (err, doc) {
                if (err) return next(err);
                if (doc === null) return res.send(404);
                return res.json(doc);
            });
        }
    ]
    controller.update = [
        function (req, res, next) {
            var id = req.params.id;
            //default update is a full replace
            //may want to give attribute replacement instead?
            req.Model.findByIdAndUpdate(id, req.body, function (err, doc) {
                if (err) return next(err);
                if (doc === null) return res.send(404);
                return res.json(doc);
            })
        }
    ]
    controller.destroy = [
        function (req, res, next) {
            var id = req.params.id;
            req.Model.findByIdAndRemove(id, function (err, doc) {
                if (err) return next(err);
                if (doc === null) return res.send(404);
                return res.send(204);
            })
        }
    ]


    /*
     Special endpoints for users model
     */
    controller.searchUsers = [
        function (req, res, next) {
            var query = req.query;
            Users.find(query)
                //do not return the passwords field
                .select({password:0})
                //join against subscriptions
                .populate('subscriptions')
                .exec(function (err, docs) {
                    if (err) return next(err);
                    return res.json(docs);
                });
        }
    ]
    controller.readUsers = [
        function (req, res, next) {
            Users.findById(req.params.id)
                //do not return the passwords field
                .select({password:0})
                //join against subscriptions
                .populate('subscriptions')
                .exec(function (err, docs) {
                    if (err) return next(err);
                    return res.json(docs);
                });
        }
    ]
    controller.subscribe = [
        function (req, res, next) {
            //accept the comic id from req body or from url param - supports both post and put requests
            var comicId = req.body.id || req.params.comicId;
            var id = req.params.id;

            Users.findByIdAndUpdate(id, {$addToSet:{subscriptions:comicId}}, function (err, doc) {
                if (err) return next(err);
                if (doc === null) return res.send(404);
                return res.json(doc);
            })
        }
    ]
    controller.unsubscribe = [
        function (req, res, next) {
            var comicId = req.params.comicId;
            var id = req.params.id;
            Users.findByIdAndUpdate(id, {$pull:{subscriptions:comicId}}, function (err, doc) {
                if (err) return next(err);
                if (doc === null) return res.send(404);
                return res.json(doc);
            });
        }
    ]

    return controller;
}