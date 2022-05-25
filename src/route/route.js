const  express = require('express');
const router = express.Router();

const middlewares=require("../middlewares/auth")
//const express = require('express');
const userController = require("../controllers/usercontroller")

router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)

router.get("/user/:userId/profile",middlewares.authentication,userController.getUserbyId)
router.put("/user/:userId/profile",middlewares.authentication,userController.updateUser)

module.exports = router