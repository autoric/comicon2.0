var jsdom = require('jsdom'),
    _ = require('underscore'),
    vm = require('vm')
    async = require('async');

module.exports = function (app) {
    var Comics = app.models.comics;

    function scrape(url, selectors, cb) {
        jsdom.env(url, ['http://code.jquery.com/jquery.min.js'], function (err, window) {
            if (err) return cb(err);
            var $ = window.$;

            var values = {};

            var err = false;

            _.each(selectors, function (selector, key) {
                if(err) return;
                //create a vm context with only access to the jquery object -
                //can execute arbitrary code safe from injection
                var context = vm.createContext({$:$})
                try {
                    var val = vm.runInContext(selector, context);
                }
                catch(e) {
                    err = e;
                }
                if(!_.isString(val)) {
                    err = new Error('Selector should resolve to a string value')
                }
                values[key] = val;
            });

            if(err) return cb(err);

            return cb(null, values);
        })
    }

    function cronJob() {
        console.log('running cronjob')
        Comics.find(function (err, docs) {
            if (err) console.log(err);
            _.each(docs, function (comic) {
                scrape(comic.get('url'), comic.get('selectors'), function (err, values) {
                    if (err) console.log(err);

                    if (!_.isEqual(comic.values, values)) {
                        comic.update({values:values}, function (err) {
                         if (err) console.log(err);
                         });
                    }
                });
            });
        });
    }

    app.scrape = scrape;

    //cronJob();

}