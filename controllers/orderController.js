const Order = require("../models/Order");
const Product = require("../models/Product");

const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");


exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOneOrder = BigPromise(async (req, res, next) => {
  const order = await Order
    .findById(req.params.id)
    .populate('user','name email' )

  if(!order){
    return next(new CustomError('please check order id', 401))
  }

  res.status(200).json({
    success: true,
    order
  })

});

exports.getLoggedInOrders = BigPromise(async (req, res, next) => {
  const order = await Order.find({user: req.user._id})
  
  if(!order){
    return next(new CustomError('please check order id', 401))
  }

  res.status(200).json({
    success: true,
    order
  })

});

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find()


  res.status(200).json({
    success: true,
    orders
  })

});

exports.adminUpdateOrders = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  if (order.orderStatus==='Deliverd') {
    return next(new CustomError('order is already marked for delivery',401))
  }

  order.orderStatus === req.body.orderStatus

  order.orderItems.forEach(async prod => {
    await updateProductStock(prod.product, prod.quantity)
  });

  await order.save()

  res.status(200).json({
    success: true,
    order
  })

});
exports.adminDeleteOrders = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  await order.remove()

  res.status(200).json({
    success: true
  })

});

//updation of the product after the deluvery 
async function updateProductStock(productId, quantity){
  const product = await Product.findById(productId)
//product check can be addded
  product.stock = product.stock - quantity
  await product.save({validateBeforeSave: false})

}






