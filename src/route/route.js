const  express = require('express');
const router = express.Router();

const middlewares=require("../middlewares/auth")
//const express = require('express');
const userController = require("../controllers/usercontroller")

router.post("/register",userController.createUser)
router.post("/login",userController.login)


router.get("/user/:userId/profile",middlewares.authentication,userController.getUserbyId)

module.exports = router