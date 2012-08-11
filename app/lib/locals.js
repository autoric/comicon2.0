module.exports = function (app) {

    // Dynamic locals
    app.locals.use(function (req, res) {
        res.locals.user = res.locals.viewData.user = req.session.user || null;
    });

    // Static locals

    app.locals({

    });
};