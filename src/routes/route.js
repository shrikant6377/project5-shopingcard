const express = require('express');
const router = express.Router();


const userController = require("../controllers/userController")
const cartController = require("../controllers/cartController")
const {authentication} = require("../middleWare/auth")
const productController = require("../controllers/productController")
const orderController = require("../controllers/orderController")




//****User Api's*****/
router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile", authentication,userController.getData)
router.put("/user/:userId/profile", authentication, userController.updateProfile)


router.post("/products",productController.createProduct)
router.get("/products",productController.getProduct)
router.get("/products/:productId", productController.getProductId)
router.put("/products/:productId", productController.updateProduct)
router.delete("/products/:productId", productController.deleteProduct)

router.post("/users/:userId/cart",authentication,cartController.createCart)
router.put("/users/:userId/cart",authentication,cartController.removeProduct)
router.get("/users/:userId/cart",authentication,cartController.getCart)
router.delete("/users/:userId/cart",authentication,cartController.deleteCart)


router.post("/users/:userId/orders",authentication,orderController.createOrder)
router.put("/users/:userId/orders",authentication,orderController.updateOrder)




module.exports = router;
