module.exports = function(app) {

    //routes are matched in the order they are declared - special cases should go before generic

    /*
     ---------Site Routes---------
     */
    app.get('/', app.controllers.site.index);
    app.get('/users/:username', app.controllers.site.userPage);
    app.post('/login', app.controllers.site.login);
    app.del('/logout', app.controllers.site.logout);
    app.get('/signup', app.controllers.site.signup);
    app.get('/comics/new', app.controllers.site.newComic);
    app.get('/comics', app.controllers.site.browseComics);
    app.get('/comics/p:page', app.controllers.site.browseComics);
    app.get('/templates', app.controllers.site.templates);
    app.post('/scrape', app.controllers.site.scrape);


    /*
     ---------Api Routes----------
     */
    //Users api is special because we don't want to return passwords on a get request
    app.get('/api/users', app.controllers.api.searchUsers);
    app.get('/api/users/:id', app.controllers.api.readUsers);

    //api routes to manage subscriptions
    //allow subscription by post with {id:X} or with a put request
    app.post('/api/users/:id/subscriptions', app.controllers.api.subscribe)
    app.put('/api/users/:id/subscriptions/:comicId', app.controllers.api.subscribe)
    app.del('/api/users/:id/subscriptions/:comicId', app.controllers.api.unsubscribe)

    //Generic restful api for all models - if previous routes are not matched, will fall back to these
    //See libs/params.js, which adds param middleware to load & set req.Model based on :model argument
    app.get('/api/:model', app.controllers.api.search);
    app.post('/api/:model', app.controllers.api.create);
    app.get('/api/:model/:id', app.controllers.api.read);
    app.post('/api/:model/:id', app.controllers.api.update);
    app.del('/api/:model/:id', app.controllers.api.destroy);




};