var mongoose = require('mongoose');

module.exports = function (app) {
    console.log('model')
    var ComicSchema = new mongoose.Schema({
        name:String,
        url:String,
        selectors:{
            title:String,
            image:String
        },
        values:{
            title:String,
            image:String
        }
    })

    return mongoose.model('comics', ComicSchema);
}