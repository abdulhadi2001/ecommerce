const User = require('../models/User')
const BigPromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')
const jwt = require('jsonwebtoken')

exports.isLoggedIn = BigPromise(async(req,res,next)=>{
    let token = 
        req.cookies.token ||
        req.header('Authorization').replace('Bearer ','') ||
        req.body.token

    if (!token){
        return next(new CustomError('please login to access this page',401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)

    next()

}) 

//the above code can be used in the following way
// exports.isLoggedIn = BigPromise(async (req, res, next) => {
//     // const token = req.cookies.token || req.header("Authorization").replace("Bearer ", "");
  
//     // check token first in cookies
//     let token = req.cookies.token;
  
//     // if token not found in cookies, check if header contains Auth field
//     if (!token && req.header("Authorization")) {
//       token = req.header("Authorization").replace("Bearer ", "");
//     }
  
//     if (!token) {
//       return next(new CustomError("Login first to access this page", 401));
//     }
  
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
//     req.user = await User.findById(decoded.id);
  
//     next();
//   });

exports.customRole = (...roles)=>{
    return(req,res,next)=>{
        if (!roles.includes(req.user.role)) {
            return next(new CustomError('you are not allowed for this resources',403))
        }
        next()
    }
}

 