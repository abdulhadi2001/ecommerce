const BigPromise = require('../middlewares/bigPromise')


exports.home = BigPromise(async(req,res)=>{
    //const db = await something()
    res.status(200).json({
        success: true,
        greeting: 'hello from api'
    })
})
exports.homedummy = (req,res)=>{
    try {
        //const db = await something()
        res.status(200).json({
            success: true,
            greeting: 'hello from dummy api'
        })
    } catch (error) {
        console.log(error)
    }
}
