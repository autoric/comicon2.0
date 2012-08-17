var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    _=require('underscore'),
    handlebars = require('handlebars');

//TODO: Hacky experimenting!  Once I have dialed in the approach, modularize it appropriately.
module.exports = function(app) {

    var basedir = path.resolve(__dirname, '../views');
    var templates ={};

    app.locals.layout = 'layout.html';

    readTemplates('', registerTemplates)

    function readTemplates(dir, cb) {
        var files = fs.readdirSync(path.resolve(basedir, dir));
        async.forEach(files, loadTemplate, cb);

        function loadTemplate(file, next) {
            var file = path.join(dir, file);
            var filepath = path.resolve(basedir , file);

            fs.stat(filepath, function(err, stats) {
                if(err) return next(err);
                if(!stats) return next(new Error('no stats returned'));
                if(stats.isDirectory()) {
                    return readTemplates(file, next);
                }
                if(stats.isFile()) {
                    //TODO: get rid of / deal with watch
                    fs.watch(filepath, readFile);
                    readFile(next);

                    function readFile(cb) {
                        if(typeof cb !== 'function'){
                            cb = function(){}
                        }
                        fs.readFile(filepath, app.config.character_encoding, function(err, text) {
                            if(err) return cb(err);
                            var key = path.join(dir, path.basename(file, path.extname(file)));
                            templates[key] = text;
                            return cb();
                        });
                    }
                }
                else {
                    return next();
                }
            })
        }
    }

    function registerTemplates(err) {
        _.each(templates, function(template, key){
            //handlebars replaces / with . so i need to do the same...dumb
            var key = key.replace(/\//g, ".");
            handlebars.registerPartial(key, template);
        });

        app.set('templates', templates);
    }

    //Handlebars hack for passing parent context to partials...
    handlebars.registerHelper('withContext', function ( parent, options ) {
        if ( typeof parent !== 'object' ) {
            return '';
        }
        this['_context']=parent;
        return options.fn( this );
    });

    var locals = _.keys(app.locals)
    _.each(locals, function(key, i) {
        var value = app.locals[key];
        if(_.isFunction(value)){
            handlebars.registerHelper(key, value);
        }
    })

    app.engine('html', function(p, options, fn) {
        var dir = path.dirname(p);
        var file = path.basename(p, path.extname(p));
        var key = path.relative(basedir, path.join(dir, file));
        var template = handlebars.compile(templates[key]);

        var body = template(options);

        var layout = options.layout;
        if(layout)  {
            options.body = body;
            options.layout = undefined;
            return app.render(layout, options, fn);
        }
        else {
            return fn(null, body);
        }
    })

    app.set('view engine', 'html');
}