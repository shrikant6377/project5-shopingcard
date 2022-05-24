const jwt = require("jsonwebtoken")
const aws= require("aws-sdk")
const bcrypt=require("bcrypt")

const validator = require('validator')
const usermodel = require("../models/usermodel")
const mongoose=require("mongoose")
const isValid = function (value) {
    if (typeof (value) === 'undefined' || value === null) return false
    if (typeof (value) === 'string' && value.trim().length == 0) return false
    return true
}
let EmailRegex = /^[A-Za-z]{1}[A-Za-z0-9._]{1,}@[A-Za-z]{2,15}[.]{1}[a-z.]{2,5}$/
let Passwordregex = /^[A-Z0-9a-z]{1}[A-Za-z0-9.@#$&]{7,14}$/
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)}
    aws.config.update({
        accessKeyId: "AKIAY3L35MCRVFM24Q7U",
        secretAccessKey: "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",
        region: "ap-south-1"
    })
    
    let uploadFile= async ( file) =>{
       return new Promise( function(resolve, reject) {
        // this function will upload file to aws and return the link
        let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws
    
        var uploadParams= {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "abc/" + file.originalname, //HERE 
            Body: file.buffer
        }
    
    
        s3.upload( uploadParams, function (err, data ){
            if(err) {
                return reject({"error": err})
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })
    
        // let data= await s3.upload( uploadParams)
        // if( data) return data.Location
        // else return "there is an error"
    
       })
    }

const createUser = async function (req, res) {
    try {
        const data = req.body;
        const files=req.files
        if (Object.keys(data) == 0) {
            return res.status(400).send({ status: false, msg: "no data provided" })
        }
        // if(files && files.length>0){
        //     //upload to s3 and get the uploaded link
        //     // res.send the link back to frontend/postman
        //     let uploadedFileURL= await uploadFile( files[0] )
        //     data.profileImage=uploadedFileURL;
        //     res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        // }
        // else{
        //     res.status(400).send({ msg: "No file found" })
        // }
        
        if (!isValid(data.fname)) {
            return res.status(400).send({ status: false, msg: "fname is required" })
        }
        if (!isValid(data.lname)) {
            return res.status(400).send({ status: false, msg: "lname is required" })
        }
        if (!isValid(data.phone)) {
            return res.status(400).send({ status: false, msg: "phone is required" })
        }
        if (!isValid(data.email)) {
            return res.status(400).send({ status: false, msg: "email is required" })
        }
        if (!EmailRegex.test(data.email)) {
            return res.status(400).send({ Status: false, message: " Please enter a valid email" })
        }
    
        if (!isValid(data.password)) {
            return res.status(400).send({ status: false, msg: "password is required" })
        }
        if (!Passwordregex.test(data.Password)) {
            return res.status(400).send({ Status: false, message: " Please enter a valid pass" })
        }
        if (!(data.password.length >= 8 && data.password.length <= 15)) {
            return res.status(400).send({ status: false, msg: "password length b/w 8-15" })
        }
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);


        if (!isValid(data.address)) {
            return res.status(400).send({ status: false, msg: " adreses is required" })
        }
        if (!isValid(data.address.shipping)) {
            return res.status(400).send({ status: false, msg: "shipping adreses is required" })
        }
        if (!isValid(data.address.billing)) {
            return res.status(400).send({ status: false, msg: "billing adresses is required" })
        }
        
    //--------duplicaton-----
        const duplicateNumber = await usermodel.findOne({ phone: data.phone })
        if (duplicateNumber) return res.status(400).send({ status: false, msg: 'number already exist' })

        const duplicateEmail = await usermodel.findOne({ email: data.email })
        if (duplicateEmail) return res.status(400).send({ status: false, msg: 'email already exist' })

        let savedData = await usermodel.create(data)
      res.status(201).send({
          status: true,
          msg: "user created successfully",
          msg2: savedData
      })

        }
       catch(error){
           return res.status(500).send({msg: error.message})
       }
     }

     const login = async function (req, res) {
        try {
            const data = req.body
    // validations
            if (Object.keys(data) == 0)
             return res.status(400).send({ status: false, msg: "Bad Request, No data provided" })
        
            if (!isValid(data.email)) {
                 return res.status(400).send({ status: false, msg: "Email is required" }) }
            if (!isValid(data.password)) {
                 return res.status(400).send({ status: false, msg: "Password is required" }) };
                 let userName= req.body.email
                 let password =req.body.password
                 let userEmailFind = await usermodel.findOne({ email: userName })
      if (!userEmailFind) {
          return res.status(400).send({status: false, msg: "userName is not correct" })};
    
                 bcrypt.compare(password, userEmailFind.password, function(err, result) {
                    if (result) {
                        let token = jwt.sign({
                            userId: userEmailFind._id,
                            iat: Math.floor(Date.now() / 1000),
                            expiresIn:"2hr"
                        }, "uranium");
                        const userData = {
                            userId: userEmailFind._id,
                            token: token
                        }
                        res.status(201).send({status: true, message: "user login successfully", data: userData })
                    }
                 }) 
                
                 } catch (error) {
            return res.status(500).send({ msg: error.message })
        }
    } 
    
     const getUserbyId = async function (req, res) {
        try {
            const userId = req.params.userId;
    console.log(userId)
            if (!isValidObjectId(userId)) { 
                return res.status(400).send({ status: false, msg: 'Please provide a valid userId ' }) }
            if (Object.keys(userId) == 0){
                 return res.status(400).send({ status: false, msg: "BAD REQUEST provide some data in param" }) }
    
            const users = await usermodel.findOne({ _id: userId })
            if (!users)
             return res.status(404).send({ status: false, message: "No user found according to your search" })
             return res.status(200).send({ status: true, message: 'user detailed', data: users });
        }
          
        catch (error) {
            res.status(500).send({ status: false, error: error.message })
        }
    }
module.exports.getUserbyId=getUserbyId
     module.exports.createUser= createUser
     module.exports.login=login