module.exports = function(app) {

    //whenever a router parameter :model is matched, this is run
    app.param('model', function(req, res, next, model) {
        var Model = app.models[model];
        if(Model === undefined) {
            //if the request is for a model that does not exist, 404
            return res.send(404);
        }

        req.Model = Model;
        return next();
    })


}