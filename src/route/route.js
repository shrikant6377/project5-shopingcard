const  express = require('express');
const router = express.Router();

//const express = require('express');
const userController = require("../controllers/usercontroller")
router.post("/register",userController.createUser)

module.exports = router