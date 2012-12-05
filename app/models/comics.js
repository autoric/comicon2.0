var mongoose = require('mongoose');

module.exports = function (app) {
    var ComicSchema = new mongoose.Schema({
        name:{ type:String, required:true, unique:true },
        url:{ type:String, required:true, unique:true },
        selectors:{
            title:String,
            image:{ type:String, required:true},
            caption:String
        },
        values:{
            title:String,
            image:String,
            caption:String
        },
        subscribers:{type:Number,
            'default':0
        }
    });

    return mongoose.model('comics', ComicSchema);
}