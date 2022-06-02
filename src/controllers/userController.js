const mongoose = require("mongoose");
const userModel = require("../Models/userModel")
const jwt = require("jsonwebtoken");
const aws = require("../Middleware/aws")
const bcrypt = require('bcryptjs')
const { isValidRequestBody, isValid,isValidName, isValidMobile, isValidEmail, isValidPassowrd,isValidObjectId, isValidFile }= require("../Middleware/validation")  // as a object{isvalid}


//const bcrypt = require('bcrypt')
 
//---REGISTER USER
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
      userId: findUser._id,
      iat: Math.floor(Date.now() / 1000),
      expiresIn:"2hr"
    },
    "Group 24 project"
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
      // Validate body
      const body = req.body
      // const reqBody = JSON.parse(req.body.data)
      if (!isValidRequestBody(body)) {
          return res.status(400).send({ status: false, msg: "Details must be present to update" })
      }

      // Validate params
      userId = req.params.userId
      if (!isValidObjectId(userId)) {
          return res.status(400).send({ status: false, msg: `${userId} is invalid` })
      }

      const userFound = await userModel.findOne({ _id: userId })
      if (!userFound) {
          return res.status(404).send({ status: false, msg: "User does not exist" })
      }


      // AUTHORISATION
      if (userId !== req['userId']) {
          return res.status(401).send({ status: false, msg: "Unauthorised access" })
      }

      // Destructuring
      let { fname, lname, email, phone, password, address } = body;


      let updatedData = {}
      if (isValid(fname)) {
          if (!isValidName(fname)) {
              return res.status(400).send({ status: false, msg: "Invalid fname" })
          }
          updatedData['fname'] = fname
      }
      if (isValid(lname)) {
          if (!isValidName(lname)) {
              return res.status(400).send({ status: false, msg: "Invalid lname" })
          }
          updatedData['lname'] = lname
      }

      // Updating of email
      if (isValid(email)) {
          if (!isValidEmail(email)) {
              return res.status(400).send({ status: false, msg: "Invalid email id" })
          }


          // Duplicate email
          const duplicatemail = await UserModel.findOne({ email: email })
          if (duplicatemail.length) {
              return res.status(400).send({ status: false, msg: "email id already exist" })
          }
          updatedData['email'] = email
      }

      // Updating of phone
      if (isValid(phone)) {
          if (!isValidMobile(phone)) {
              return res.status(400).send({ status: false, msg: "Invalid phone number" })
          }

          // Duplicate phone
          const duplicatePhone = await UserModel.findOne({ phone: phone })
          if (duplicatePhone.length) {
              return res.status(400).send({ status: false, msg: "phone number already exist" })
          }
          updatedData['phone'] = phone
      }

      // Updating of password
      if (password) {
          if (!isValid(password)) {
              return res.status(400).send({ status: false, message: 'password is required' })
          }
          if (!isValidPassword(password)) {
              return res.status(400).send({ status: false, message: "Password should be Valid min 8 character and max 15 " })
          }
          const encrypt = await bcrypt.hash(password, 10)
          updatedData['password'] = encrypt
      }

      // Updating address
      if (address) {
          address = JSON.parse(address)
          if (address.shipping) {
              if (address.shipping.street) {
                  if (!validator.isValid(address.shipping.street)) {
                      return res.status(400).send({ status: false, message: 'Please provide street' })
                  }
                  updatedData['address.shipping.street'] = address.shipping.street
              }
              if (address.shipping.city) {
                  if (!validator.isValid(address.shipping.city)) {
                      return res.status(400).send({ status: false, message: 'Please provide city' })
                  }
                  updatedData['address.shipping.city'] = address.shipping.city
              }
              if (address.shipping.pincode) {
                  if (typeof address.shipping.pincode !== 'number') {
                      return res.status(400).send({ status: false, message: 'Please provide pincode' })
                  }
                  // Validate shipping pincode
                  if (!isValidPincode(address.shipping.pincode)) {
                      return res.status(400).send({ status: false, msg: "Invalid Shipping pincode" })
                  }
                  updatedData['address.shipping.pincode'] = address.shipping.pincode
              }
          }
          if (address.billing) {
              if (address.billing.street) {
                  if (!isValid(address.billing.street)) {
                      return res.status(400).send({ status: false, message: 'Please provide street' })
                  }
                  updatedData['address.billing.street'] = address.billing.street
              }
              if (address.billing.city) {
                  if (!isValid(address.billing.city)) {
                      return res.status(400).send({ status: false, message: 'Please provide city' })
                  }
                  updatedData['address.billing.city'] = address.billing.city
              }
              if (address.billing.pincode) {
                  if (typeof address.billing.pincode !== 'number') {
                      return res.status(400).send({ status: false, message: 'Please provide pincode' })
                  }
                  // Validate billing pincode
                  if (!isValidPincode(address.billing.pincode)) {
                      return res.status(400).send({ status: false, msg: "Invalid billing pincode" })
                  }
                  updatedData['address.billing.pincode'] = address.billing.pincode
              }
          }
      }

      let files = req.files;
      if (files && files.length > 0) {
          let uploadedFileURL = await aws.uploadFile(files[0]);
          if (!isValidFile(uploadedFileURL)) {
              return res.status(400).send({ status: false, msg: 'invalid uploadFileUrl' })
          }
          if (uploadedFileURL) {
              updatedData['profileImage'] = uploadedFileURL
          }
      }

      //body.address = JSON.parse(body.address)
      const updated = await userModel.findOneAndUpdate({ _id: userId }, updatedData, { new: true })
      return res.status(200).send({ status: true, data: updated })
  }
  catch (err) {
      res.status(500).send({ msg: "Error", error: err.message })
  }
};

//*******************************************************************//

 module.exports.registerUser = registerUser
 module.exports.loginUser = loginUser
 module.exports.getData = getData
 module.exports.updateProfile = updateProfile

//*******************************************************************//