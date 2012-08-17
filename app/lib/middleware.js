var express = require('express'),
    connect = require('connect'),
    connect_timeout = require('connect-timeout'),
    MongoStore = require('connect-mongodb');

// Middleware
module.exports = function (app) {

    // Sessions
    var mongoStore = new MongoStore({
        url:app.config.session.url
    });

    var session_middleware = express.session({
        key:app.config.session_key,
        store:mongoStore,
        maxAge:app.config.session_length
    });

    // Error handler
    var error_middleware = express.errorHandler({
        dumpExceptions:true,
        showStack:true
    });

    /*
     Middleware stack. Each request is passed through these functions in the order declared,
     until they are resolved - either by sending a response back to the server, or passing an error
     via next(err) - in which case the error will fall through to the error_middleware at the bottom of
     the stack and return a 500 code with error and stack trace.
     */

    //servie static content from the public directory
    app.use(express['static'](app.set('public')));
    //timeout requests that take longer than our configuration value
    app.use(connect_timeout({ time:app.constants.request_timeout }));
    //use cookie parser and sessions, gives us the req.session object to manage sessions
    app.use(express.cookieParser(app.config.cookie_secret));
    app.use(session_middleware);
    //user body parser to give us req.body on post / put requests
    app.use(express.bodyParser());
    //allows method override so that browsers that dont support forms with delete requests can
    //override the method with a post argument or a request header
    app.use(express.methodOverride());
    //now go to routes - after all of our other middle ware has acted and set up requests objects or resolved the requests
    app.use(function (req, res, next) {
        //TODO: move to its own middleware
        //TODO: think about character encoding...
        res.charset = app.config.character_encoding;
        res.locals.viewData = {};
        userId = req.session.user;
        if (userId) {
            app.models.users.findById(userId, {password:0}, function(err, doc){
                res.locals.user = res.locals.viewData.user = doc;
                return next();
            })
        }
        else {
            res.locals.user = res.locals.viewData.user = {};
            next();
        }
    });
    app.use(app.router);
    app.use(app.middleware.negotiator);

    // Handle errors thrown from middleware/routes
    app.use(error_middleware);
};