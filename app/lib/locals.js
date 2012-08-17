module.exports = function (app) {

    // Dynamic locals
    app.locals.use(function (req, res) {

    });

    // Static locals

    app.locals({
        toJSON:function (obj) {
            return JSON.stringify(obj);
        },
        block:function (name) {
            console.log(name);
        },
        extend:function (name, context) {

        }

    });
};