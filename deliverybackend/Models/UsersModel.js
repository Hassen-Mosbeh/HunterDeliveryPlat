const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Roles } = require('../utils/enums');
const baseOptions = {
  discriminatorKey: 'userType',
  collection: 'users',
};//declaeration de clase mere

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
       
    role: {
        type: Number,
        enum: Object.values(Roles),
        required: true
        
    }
}, baseOptions)

userSchema.pre('save', async function(next) {
    try {
        if (this.isModified('password') || this.isNew) {
            const saltRounds = 10;
            const hash = await bcrypt.hash(this.password, saltRounds);
            this.password = hash;
        }
        next();
    } catch (err) {
        next(err);
    }
});
module.exports=mongoose.model("user",userSchema)
    

