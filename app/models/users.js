var mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

module.exports = function (app) {
    var UserSchema = new mongoose.Schema({
        username:{ type:String, required:true, unique:true },
        email:{ type:String, required:true, unique:true },
        password:{ type:String, required:true, set: hash},
        subscriptions:[
            {type:mongoose.Schema.Types.ObjectId, ref:'comics'}
        ]
    });

    function hash(password){
        //whenever the password is set on a user model it is automatically hashed using
        //the bcrypt algorithm with a random 10-digit salt
        return bcrypt.hashSync(password, 10)
    }

    UserSchema.methods = {
        authenticate:function (password, cb) {
            return bcrypt.compare(password, this.password, cb);
        }
    }

    return mongoose.model('users', UserSchema);
}