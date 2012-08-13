module.exports = function (app) {
    return function (req, res, next) {
        if(!res.view) return next();
        res.format({
            html:function () {
                return res.render(res.view, res.locals.viewData);
            },
            json:function () {
                return res.json(res.locals.viewData);
            }
        })
    }
}