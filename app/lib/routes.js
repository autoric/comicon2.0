module.exports = function(app) {

    //routes are matched in the order they are declared
  
    //Users api is special because we need to hash passwords & don't want to return passwords on a get request
    app.get('/api/users', app.controllers.api.searchUsers);
    app.post('/api/users', app.controllers.api.createUsers);
    app.get('/api/users/:id', app.controllers.api.readUsers);
    app.post('/api/users/:id', app.controllers.api.updateUsers);

    //api routes to manage subscriptions
    //allow subscription by post with {id:X} or with a put request
    app.post('/api/users/:id/subscriptions', app.controllers.api.subscribe)
    app.put('/api/users/:id/subscriptions/:comicId', app.controllers.api.subscribe)
    app.del('/api/users/:id/subscriptions/:comicId', app.controllers.api.unsubscribe)

    //Generic restful api for all models - if previous routes are not matched, will fall back to these
    //See libs/params.js, which adds param middleware to load & set req.Model based on :model argument, or
    app.get('/api/:model', app.controllers.api.search);
    app.post('/api/:model', app.controllers.api.create);
    app.get('/api/:model/:id', app.controllers.api.read);
    app.post('/api/:model/:id', app.controllers.api.update);
    app.del('/api/:model/:id', app.controllers.api.destroy);
};