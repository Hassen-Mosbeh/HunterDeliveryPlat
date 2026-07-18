const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Roles,UserStatus } = require('../utils/enums');
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
        
    },
    userstatus: {
        type: Number,
        enum: Object.values(UserStatus),
        default: UserStatus.ACTIVE
    }
}, baseOptions)

userSchema.pre('save', async function () {
  if (this.isModified('password') || this.isNew) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
});
module.exports=mongoose.model("user",userSchema)
    

