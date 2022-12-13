const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name :{
        type: String,
        required: [true,'please provide a product name'],
        trim: true,
        maxlength: [120 , 'the product name should not exceed 120 characters']
    },
    price:{
        type: Number,
        required: [true,'please provide the product price'],
        maxlength: [6, 'the product price should not exeed 6 digits']
    },
    description:{
        type : String,
        required: [true,'please provide the product description'] 
    },
    photos:[
        {
            id:{
                type:String,
                required: true
            },
            secure_url:{
                type: String,
                required: true
            }
        }
    ],
    category:{
        type: String,
        required:[true,'please select category from- short-sleeves, long-sleeves, sweat-shirts, hoodies'],
        enum:{
            values:[
                'shortsleeves',
                'longsleeves',
                'sweatshirts',
                'hoodies'
            ],
            message: 'please select category ONLY from- short-sleeves, long-sleeves, sweat-shirts, hoodies'
        }
    },
    stock:{
        type: Number,
        required: [true, 'please add a number in stock']
    },
    brand:{
        type: String,
        required:[true,'please provide a brand name']
    },
    ratings:{
        type:Number,
        default: 0
    },
    numberOfReviews:{
        type: Number,
        default: 0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:'User',
                required: true
            },
            name:{
                type: String,
                required: true
            },
            rating:{
                type: Number,
                required: true
            },
            comment:{
                type: String,
                required: true  
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required: true
    },
    createdAt:{
        type:Date,
        default:Date.now( )
    }
     
})


module.exports= mongoose.model('Product',productSchema)