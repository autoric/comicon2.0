module.exports = function (app) {

    // Dynamic locals
    app.locals.use(function (req, res) {

    });

    // Static locals

    app.locals({
        toJSON: function(obj){
            console.log('calling local')
            console.log(obj)
            return JSON.stringify(obj);
        }
    });
};