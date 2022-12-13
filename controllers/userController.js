const User = require('../models/User')
const BigPromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary')
const mailHelper = require('../utils/emailHelper')
const crypto = require('crypto')
const cookieToken= require('../utils/cookieToken')


exports.signup = BigPromise(async(req,res,next)=>{
    //uploading to cloudinary
    //let result;
    if (!req.files) {
        return next(new CustomError('photo is required for signup',400))
    }
    const {name, email, password}=req.body

    if (!name || !email || !password) {
        return next(new CustomError('name, email and password are required'))
    }   

    let file= req.files.photo

    const result = await cloudinary.v2.uploader.upload(file.tempFilePath,{
        folder: 'users',
        width: 150,
        crop: 'scale'
    })
        
    const user = await User.create({
        name,
        email,
        password,
        photo:{
            id: result.public_id,
            secure_url: result.secure_url
        }
    })

    cookieToken(user, res)

})

exports.login = BigPromise(async(req,res,next)=>{

    const {email, password} = req.body
    //checking the presence of email and password
    if (!email || !password) {
        return next(new CustomError('please provide email and password',400))
    }
    //get user from db
    const user = await User.findOne({email}).select('+password')
    //if user not found in db
    if (!user) {
        return next(new CustomError('you are not registered',400))
    }
    //match passsword
    const isPasswordCorrect = await user.isValidatedPassword(password)
    //password do not match
    if (!isPasswordCorrect) {
        return next(new CustomError('Email or password doesnot match',400))
    }

    //if all goes good then we send the token
    cookieToken(user, res)
})

exports.logout = BigPromise(async(req,res,next)=>{
    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: 'logout suuccess'
    })
})

exports.forgotPassword = BigPromise(async(req,res,next)=>{
    //collect email
    const {email} = req.body
    //find user in data base
    const user = await User.findOne({email})
    //if user is not found in the database
    if (!user){
        return next(new CustomError('email not found as registered',400))
    }
    //get token from user model methods
    const forgotToken = user.getForgotPasswordToken()
    //save user fields in db
    await user.save({validateBeforeSave: false})
    //creating a url
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`
    //crafting a message
    const message = `copy paste this link in your url and hit enter /n/n ${myUrl}`
    //attempt to send an email
    try {
        await mailHelper({
            email: user.email,
            subject: 'brc tstore- password reset email',
            message
        })
        //json response if email is success
        res.status(200).json({
            success: true,
            message: 'email sent successfully'
        })

    } catch (error) {
        //reset user fields if things goes wrong
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save({validateBeforeSave: false})
        //send error response 
        return next(new CustomError(error.message,500))
    }

})

exports.passwordReset = BigPromise(async(req,res,next)=>{
    const token = req.params.token

    const encryToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

    const user = await User.findOne({
        encryToken,
        forgotPasswordExpiry:{$gt:Date.now()},
    })
    if (!user){
        return next(new CustomError('token is invalid or expired',400))
    }

    if (req.body.password !== req.body.conformPassword) {
        return next(new CustomError('password and confirm password doesnot match',400))
    }

    user.password = req.body.password

    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined
    
    await user.save()

    cookieToken(user,res)


})

exports.getLoggedInUserDetails = BigPromise(async(req,res,next)=>{
    
    const user= await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user
    })
})

exports.changePassword = BigPromise(async(req,res,next)=>{
    const userId = req.user.id

    const user = await User.findById(userId).select("+password")

    const isCorrectOldPassword = await user.isValidatedPassword(req.body.oldPassword)

    if (!isCorrectOldPassword) {
        return next(new CustomError('old password is incorrect',400))
    }

    user.password = req.body.newPassword

    await user.save()

    cookieToken(user, res)

})

exports.updateUserDetails = BigPromise(async(req,res,next)=>{

    const newData = {
        name: req.body.name,
        email: req.body.email
    }

    if (!newData.name || !newData.email) {
        return next (new CustomError('please provide the name and email',400))
    }

    if (req.files) {
        const user = await User.findById(req.user.id)

        const imageId = user.photo.id

        const resp=await cloudinary.v2.uploader.destroy(imageId)

        const result = await cloudinary.v2.uploader.upload(
            req.files.photo.tempFilePath,{
                folder: 'users',
                width: 150,
                crop: 'scale'

            }
        )

        newData.photo={
            id: result.public_id,
            secure_url: result.secure_url
        }    

    }

    const user= await User.findByIdAndUpdate(req.user.id,newData,{
        new:true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})

exports.adminAllUser=BigPromise(async(req,res,next)=>{
    const users = await User.find({})

    if (!users) {
        return next(new CustomError('there are no users in the database',400))
    }

    res.status(200).json({
        success: true,
        users
    })
})

exports.admingetOneUser = BigPromise(async(req,res,next)=>{
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new CustomError('no user found',400))
    }

    res.status(200).json({
        success: true,
        user
    })
})

exports.adminUpdateOneUserDetails = BigPromise(async(req,res,next)=>{

    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user= await User.findByIdAndUpdate(req.params.id,newData,{
        new:true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})

exports.adminDeleteOneUser = BigPromise(async(req,res,next)=>{
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new CustomError('no such user found',401))
    }

    const imageId= user.photo.id

    await cloudinary.v2.uploader.destroy(imageId)

    await user.remove()

    res.status(200).json({
        success: true
    })
})

//this is just to make understand that various people can get seperate routes
exports.managerAllUser=BigPromise(async(req,res,next)=>{
    const users = await User.find({role: 'user'})

    if (!users) {
        return next(new CustomError('there are no users in the database',400))
    }

    res.status(200).json({
        success: true,
        users
    })
})

