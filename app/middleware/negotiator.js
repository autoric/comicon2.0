module.exports = function (app) {
    return function (req, res, next) {
        res.format({
            html:function () {
                res.render(res.view, res.locals.viewParams);
            },
            json:function () {
                res.json(res.locals.viewParams);
            }
        })
    }
}