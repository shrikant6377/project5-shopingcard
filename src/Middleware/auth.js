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

//**********************************************************************//

// const authorization = async function (req, res, next) {
//     try {
//         let tokenId = req.userId;
//         let user = req.params.userId
//         if (!isValidObjectId(user)) 
//         return res.status(400).send({status:false,message:`User id ${user} is invalid`})

//         const findUser= await userModel.findOne({_id:user});
//         if (!findUser)
//         return res.status(404).send({ status: false, message: 'User not found' })
//         const {_id} = findUser;

//         if(tokenId.toString()!==_id.toString()) 
//         return res.status(403).send({ status: false, message: "Unauthorized, cannot access other's data." })
//         next()
//         }catch (error) {
//         res.status(500).send({ status: false, message: error.message })
//       }
// }

// //**********************************************************************//

//  module.exports = { authentication ,authorization}

//**********************************************************************//