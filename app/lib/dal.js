var mongoose = require('mongoose');

module.exports = function (app) {
    //set up mongoose database connection
    mongoose.connect(app.config.mongodb.host, app.config.mongodb.db, app.config.mongodb.port)
}