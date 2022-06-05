const mongoose = require("mongoose");
const userModel = require("../Models/userModel")
const jwt = require("jsonwebtoken");
const aws = require("../Middleware/aws")
const bcrypt = require('bcryptjs')
const { isValidRequestBody, isValid,isValidName,isValidPincode, isValidMobile, isValidEmail, isValidPassowrd,isValidObjectId, isValidFile }= require("../Middleware/validation")  // as a object{isvalid}

//const bcrypt = require('bcrypt')
//---REGISTER USER------//
const registerUser = async function (req, res) {
    try{
//==validating request body==//
     let requestBody = req.body
     if (!isValidRequestBody(requestBody)) return res.status(400).send({ status: false, msg: "Invalid request, please provide details" })
     let { fname,lname,email,phone,password,address } = requestBody

//==validating first name==//
    if (!isValid(fname)) return res.status(400).send({ status: false, msg: "Name is a mandatory field" })
    if (!isValidName(fname)) return res.status(400).send({ status: false, msg: "Name must contain only alphabates" })

//==validating last name==//
    if (!isValid(lname)) return res.status(400).send({ status: false, msg: "Last Name is a mandatory field" })
    if (!isValidName(lname)) return res.status(400).send({ status: false, msg: "Last Name must contain only alphabates" })

//==validating email==//
    if (!isValid(email)) return res.status(400).send({ status: false, msg: "email is a mandatory field" })
    if (!isValidEmail(email)) return res.status(400).send({ status: false, msg: `${email} is not valid` })
    let isUniqueEmail = await userModel.findOne({ email: email })
    if (isUniqueEmail) return res.status(400).send({ status: false, msg: `${email} is already exist` })

//==validating phone==//        
    if (!isValid(phone)) return res.status(400).send({ status: false, msg: "Phone number is a mandatory field" })
    if (!isValidMobile(phone)) return res.status(400).send({ status: false, msg: `${phone} number is not a valid` })
    let isUniquePhone = await userModel.findOne({ phone: phone })
    if (isUniquePhone) return res.status(400).send({ status: false, msg: `${phone} number is already exist` })

//==validating password==//
    if (!isValid(password)) return res.status(400).send({ status: false, msg: "Password is a mandatory field" })
    if (!isValidPassowrd(password)) return res.status(400).send({ status: false, msg: `Password ${password}  must include atleast one special character[@$!%?&], one uppercase, one lowercase, one number and should be mimimum 8 to 15 characters long` })

//==validating address==//
    if (!isValid(address)) return res.status(400).send({ status: false, msg: "Address is a mandatory field" })
    address = JSON.parse(address)

    if(!isValid(address.shipping)|| !isValid(address.billing))return res.status(400).send({ status: false, msg: "Shipping and Billing address are mandatory field" })

    if(!isValid(address.shipping.street) || !isValid(address.shipping.city) || !isValid(address.shipping.pincode))return res.status(400).send({ status: false, msg: "Street, city and pincode are mandatory in Shipping" })

    if(!isValid(address.billing.street) || !isValid(address.billing.city) || !isValid(address.billing.pincode))return res.status(400).send({ status: false, msg: "Street, city and pincode are mandatory in Billing" })
    
//==password hashing==//
const salt = await bcrypt.genSalt(10);
password = await bcrypt.hash(password, salt)

//==validating and uploading image (getting profile image url)==//
    let files= req.files
    if(files && files.length>0){
         if(!isValidFile(files[0].originalname))  return res.status(400).send({ status: false, message: "Please provide image only" })
        let uploadedFileURL= await aws.uploadFile( files[0] )
        profileImage = uploadedFileURL
    }
    else{
        res.status(400).send({ msg: "No file found" })
    }

//==creating user==//    
    const userData = { fname,lname,email,profileImage,phone,password,address };
    const saveUser = await userModel.create( userData)
    return res.status(201).send({ status: true, message: "User profile details", data: saveUser })
    }catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
    
}

//*******************************************************************//

//---USER LOGIN
const loginUser = async function(req,res){
  try {
//==validating request body==//
   let requestBody = req.body
  if (!isValidRequestBody(requestBody)) return res.status(400).send({ status: false, msg: "Invalid request, please provide details"})  
  const {email, password} = requestBody;

//==validating email==//
  if (!isValid(email)) return res.status(400).send({ status: false, msg: "email is a mandatory field" })
  if (!isValidEmail(email)) return res.status(400).send({ status: false, msg: `${email} is not valid` })
     
//==validating password==//
  if(!isValid(password))return res.status(400).send({status:false, message: `Password is required`})
         
//==finding userDocument==//      
const user = await userModel.findOne({ email });

if (!user) {
  res.status(404).send({ status: false, message: `${email} related user unavailable` });
  return
}
const isLogin = await bcrypt.compare(password, user.password).catch(e => false)
if (!isLogin) {
  res.status(401).send({ status: false, message: `wrong email address or password` });
  return
}
      
//==creating token==//   
let token = jwt.sign(
  {
      userId:  user._id.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 96 * 60 * 60 //4days
  },
  "Group 32 project"
);

//==sending and setting token==// 
     res.header('Authorization',token);
     res.status(200).send({status:true, message:`User login successfully`, data:{token}});

 } catch (error) {
     res.status(500).send({status:false, message:error.message});
 }
}

//*******************************************************************//

//---GET USER DETAILS
const getData = async function (req, res) {
    try {
    //==validating userId==//    
      let userId = req.params.userId
      if (!isValidObjectId(userId)) return res.status(400).send({ status: false, msg: "userId is invalid" })
      
    //==getting details==//
      let getDataList = await userModel.findOne({ _id: userId })
      if (!getDataList) return res.status(404).send({ status: false, msg: "data not found " })
      
    //==sending details==//
      return res.status(200).send({ status: true, msg: "user profile details", data: getDataList })
    }
    catch (err) {
      return res.status(500).send({ status: false, msg: err.message })
    }
  }

//*******************************************************************//
  const updateProfile = async function (req, res) {
        try {
          let userId = req.params.userId;
          let files = req.files;
          if(!isValidObjectId(userId))return res.status(400).send({  status: false, message: "Please Provide valid userId"})
          let data = req.body;
          
         
      
          let userProfile = await userModel.findById(userId);
          if(!userProfile){return res.status(404).send("user not found!")}
      
      
          if (data.isDeleted === true) {
            return res
              .status(400)
              .send({ status: false, message: "User already deleted" });
          }
          let { fname, lname, email, phone, password, address, } = data
            if (fname ||lname) {
              if (!/^([a-zA-Z ]+)$/.test(fname || lname)) {
                return res
                  .status(400)
                  .send({
                    Status: false,
                    message: " Firstname and lastname is not valid format",
                  });
              }
            }
            if (email) {
              if (
                !/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)
              ) {
                return res
                  .status(400)
                  .send({ status: false, data: "plz enter a valid Email" });
              }
            }
            if (isValidFile(files.profileImage)) {
              if (files && files.length > 0) {
                let uploadedFileURL = await aws.uploadFile(files[0]);
                data.profileImage = uploadedFileURL;
              } else {
                res.status(400).send({ msg: "No file found" });
              }
            }
            if (phone) {
              if (!/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone)) {
                return res
                  .status(400)
                  .send({ status: false, message: "Plz enter valid phone no." });
              }
            }
            if (password) {
              if (!/^([a-zA-Z0-9!@#$%^&*_\-+=><]{8,15})$/.test(password)) {
                return res
                  .status(400)
                  .send({
                    status: false,
                    message: "Plz enter valid Password, min 8 and mix 15 ",
                  });
              }
            }
            let checkUniqueData = await userModel.findOne({
              $or: [{ phone: phone }, { email: email }],
            });
            if (checkUniqueData) {
              if (checkUniqueData.phone == phone) {
                return res
                  .status(400)
                  .send({ status: false, message: "Phone No.already exists" });
              }
              if (checkUniqueData.email == email) {
                return res
                  .status(400)
                  .send({ status: false, message: "Email Id already exists" });
              }
            }
            if (password) {
              let enPassword = await bcrypt.hash(password, 10);
               data.password = enPassword;
            }
        
          if(address) {
            
            if (!isValid(data.address)) return res.status(400).send({ status: false, message: "Address should be in object and must contain shipping and billing addresses" });
      
            //JSON.parse(JSON.stringify(userProfile.address))
            address = JSON.parse(address)
            
            let tempAddress = userProfile.address
      
            if(address.shipping) {
              
              if (!isValid(address.shipping)) return res.status(400).send({ status: false, message: "Shipping address should be in object and must contain street, city and pincode" });
      
              if(address.shipping.street){
                if (!isValid(address.shipping.street)) return res.status(400).send({ status: false, message: "Street of shipping address should be valid and not an empty string" });
      
                tempAddress.shipping.street =address.shipping.street 
              }
      
              
              if (address.shipping.city) {
                if (!isValid(address.shipping.city)) return res.status(400).send({ status: false, message: "City of shipping address should be valid and not an empty string" });
      
                tempAddress.shipping.city = address.shipping.city
              }
      
              
              if (address.shipping.pincode) {
                if (!isValid(address.shipping.pincode)) return res.status(400).send({ status: false, message: "Pincode of shipping address and should not be an empty string" });
      
                if (!isValidPincode(address.shipping.pincode))
                 return res.status(400).send({ status: false, message: "Pincode should be in numbers" });
      
                tempAddress.shipping.pincode =address.shipping.pincode;
              }
            }
      
            if(address.billing) {
            
              if (!isValid(address.billing)) return res.status(400).send({ status: false, message: "Shipping address should be in object and must contain street, city and pincode" });
      
              if(address.billing.street){
                if (!isValid(address.billing.street)) return res.status(400).send({ status: false, message: "Street of billing address should be valid and not an empty string" });
      
                tempAddress.billing.street = address.billing.street 
              }
      
              
              if (address.billing.city) {
                if (!isValid(address.billing.city)) return res.status(400).send({ status: false, message: "City of billing address should be valid and not an empty string" });
      
                tempAddress.billing.city = address.billing.city
              }
      
              
              if (address.billing.pincode) {
                if (!isValid(address.billing.pincode)) return res.status(400).send({ status: false, message: "Pincode of billing address and should not be an empty string" });
      
                if (!isValidPincode(address.billing.pincode)) return res.status(400).send({ status: false, message: "Pincode should be in numbers" });
      
               
                tempAddress.billing.pincode = address.billing.pincode;
              }
            }
      
          data.address = tempAddress;
          }
          
          let updateUser = await userModel.findOneAndUpdate(
            {_id: userId},
            data,
            {new: true}
          )
          res.status(201).send({ status: true, message: "User profile updated", data: updateUser });
         
        } catch (err) {
          res.status(500).send({ status: false, error: err.message })
        }
      }

//*******************************************************************//

 module.exports.registerUser = registerUser
 module.exports.loginUser = loginUser
 module.exports.getData = getData
 module.exports.updateProfile = updateProfile

//*******************************************************************//