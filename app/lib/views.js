var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    _=require('underscore'),
    handlebars = require('handlebars');

//NOTE: not currently used. This is something I'm experimenting with.
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
                    fs.readFile(filepath, 'utf-8', function(err, text) {
                        if(err) return next(err);
                        var key = path.join(dir, path.basename(file, path.extname(file)));
                        templates[key] = text;
                        return next();
                    });
                }
                else {
                    return next();
                }
            })
        }
    }

    function registerTemplates(err) {
        _.each(templates, function(template, key){
            handlebars.registerPartial(key, template);
        });

        app.set('templates', templates);
    }

    app.engine('html', function(p, options, fn) {
        console.log('handlebars engine')
        console.log(options.username);

        var dir = path.dirname(p);
        var file = path.basename(p, path.extname(p));
        var key = path.relative(basedir, path.join(dir, file));
        var template = handlebars.compile(templates[key]);

        var body = template(options);

        var layout = options.layout;
        if(layout)  {
            options.body = body;
            options.layout = undefined;
            app.render(layout, options, fn);
        }
        else {
            fn(null, body);
        }
    })

    app.set('view engine', 'html');

}