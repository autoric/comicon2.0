var mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

module.exports = function (app) {
    var UserSchema = new mongoose.Schema({
        username:{ type:String, required:true, unique:true },
        email:{ type:String, required:false, unique:false },
        password:{ type:String, required:true, set: hash},
        subscriptions:[
            {type:mongoose.Schema.Types.ObjectId, ref:'comics'}
        ]
    });

    function hash(password){
        return bcrypt.hashSync(password, 10)
    }

    UserSchema.methods = {
        authenticate:function (password, cb) {
            return bcrypt.compare(password, this.password, cb);
        }
    }

    return mongoose.model('users', UserSchema);
}