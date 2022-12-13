const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema= new mongoose.Schema({
    name: {
        type: String,
        required:[true,'please enter a username'],
        maxlength:[30,'name should be under 30 characters']
    },
    email: {
        type: String,
        required: [true,'please provide an email'],
        validate: [validator.isEmail,'please enter a valid email'],
        unique: true 
    },
    password: {
        type: String,
        required: [true,'please provide a password'],
        minlength: [6,'the password must be atleast 6 characteres'],
        select: false
    },
    role: {
        type:String,
        default: 'user'
    },
    photo: {
        id: {
            type: String,
            required:true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

//encryption of the password before save - HOOKS
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next()
    }
    this.password= await bcrypt.hash(this.password,10)
})
 
//validate the password with the user sent password
userSchema.methods.isValidatedPassword= async function(usersentpassword){
    return await bcrypt.compare(usersentpassword, this.password)
}

//create and return jwt token
userSchema.methods.getJwtToken=function(){
    return jwt.sign({id: this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRY
    })
}

//generate forgot password token(this is basically a string)
userSchema.methods.getForgotPasswordToken= function(){
    //generate a long and random string
    const forgotToken = crypto.randomBytes(20).toString('hex');

    //getting a hash - make sure to get a hash on backend
    this.forgotPasswordToken = crypto
        .createHash('sha256')
        .update(forgotToken)
        .digest('hex')

    //time of token
    this.forgotPasswordExpiry= Date.now() + 20 * 60 * 1000

    return forgotToken

}



module.exports = mongoose.model('User', userSchema)




