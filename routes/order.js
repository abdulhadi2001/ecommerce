const express = require("express");
const {
  createOrder,
  getOneOrder,
  getLoggedInOrders,
  adminGetAllOrders,
  adminUpdateOrders,
  adminDeleteOrders
} = require("../controllers/orderController");
const router = express.Router();
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrder);
router.route("/getmyorder").get(isLoggedIn, getLoggedInOrders);

//admin routes
router.route('/admin/orders').get(isLoggedIn,customRole('admin') ,adminGetAllOrders)
router.route('/admin/orders/:id')
  .put(isLoggedIn,customRole('admin') ,adminUpdateOrders)
  .delete(isLoggedIn,customRole('admin') ,adminDeleteOrders)

module.exports = router;
