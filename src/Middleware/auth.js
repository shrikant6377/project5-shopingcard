const jwt = require("jsonwebtoken")
//const { isValidObjectId } = require("mongoose")
//const userModel = require("../Models/userModel")


const authentication = async function(req, res, next){
    try{
        const token = req.headers["authorization"];
         
        if(!token){
            return res.status(400).send({status:false, msg: "login is required, token is required"})
        }

        const bearer= token.split(" ")[1];
      
        console.log(bearer)
        const decodedtoken =jwt.verify(bearer, "Group 32 project")
        console.log(decodedtoken)
        if(!decodedtoken){
            return res.status(400).send({status:false, msg: "token is invalid"})
        }
        req.userId = decodedtoken.userId

        next();
    }
    catch(error){
        return res.status(500).send({status:false,msg: error.message})
    }
}
module.exports.authentication=authentication
