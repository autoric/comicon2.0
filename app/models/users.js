var mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

module.exports = function (app) {
    var UserSchema = new mongoose.Schema({
        username:{ type:String, required:true, unique:true },
        email:{ type:String, required:true, unique:true },
        password:{ type:String, required:true},
        subscriptions:[
            {type:mongoose.Schema.Types.ObjectId, ref:'comics'}
        ]
    });

    UserSchema.methods = {
        /*
        TODO:
        Currently forcing myself to handle User models separately in api routes and manually user
        setPassword to make sure pw is hashed. Investigate using .pre('set') hooks to hash a password
        at save to make it more transparent
         */
        setPassword:function (password, cb) {
            console.log('setting password')
            cb = cb || function () {
            };
            var self = this;
            bcrypt.hash(password, 10, function (err, hash) {
                if (err) return cb(err);
                self.password = hash;
                cb();
            })
        },
        authenticate:function (password, cb) {
            return bcrypt.compare(password, this.password, cb);
        }
    }

    return mongoose.model('users', UserSchema);
}