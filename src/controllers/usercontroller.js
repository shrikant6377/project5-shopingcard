const jwt = require("jsonwebtoken")
const aws = require("aws-sdk")
const bcrypt = require("bcrypt")

const validator = require('validator')
const usermodel = require("../models/usermodel")
const mongoose = require("mongoose")
const isValid = function (value) {
    if (typeof (value) === 'undefined' || value === null) return false
    if (typeof (value) === 'string' && value.trim().length == 0) return false
    return true
}
let EmailRegex = /^[A-Za-z]{1}[A-Za-z0-9._]{1,}@[A-Za-z]{2,15}[.]{1}[a-z.]{2,5}$/
let Passwordregex = /^[A-Z0-9a-z]{1}[A-Za-z0-9.@#$&]{7,14}$/
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "abc/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
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
        let data = req.body
        let files = req.files

        if (Object.keys(data) == 0) return res.status(400).send({
            status: false,
            msg: "No input provided"
        })
        // validation

        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL = await uploadFile(files[0])
            data.profileImage = uploadedFileURL;
         } 
         //else {
        //     res.status(400).send({ msg: "profileImage is required" })
        // }


        if (!isValid(data.fname)) {
            return res.status(400).send({
                status: false,
                msg: "fname is required"
            })
        }

        if (!isValid(data.lname)) {
            return res.status(400).send({ status: false, msg: "lname is required" })
        }

        if (!/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(data.phone)) {
            return res.status(400).send({ status: false, msg: "valid phone number is required" })
        }


        if (!/^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/.test(data.email)) {
            return res.status(400).send({ status: false, msg: "valid email is required" })
        }


        if (!isValid(data.password)) {
            return res.status(400).send({
                status: false, msg: "Plz enter valid password"
            })
        }


        if (data.password.length < 8 || data.password.length > 15) {
            return res.status(400).send({ status: false, msg: "passowrd min length is 8 and max length is 15" })
        }


        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);

        if (!isValid(data.address)) {
            return res.status(400).send({ status: false, msg: "Plz enter address" })
        }


        if (!isValid(data.address.shipping)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter shipping address"
            })
        }


        if (!isValid(data.address.billing)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter billing address"
            })
        }


        if (!isValid(data.address.shipping.street)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter shipping street"
            })
        }


        if (!isValid(data.address.shipping.city)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter shipping city"
            })
        }


        if (!/^[1-9]{1}[0-9]{5}$/.test(data.address.shipping.pincode)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter shipping pincode"
            })
        }


        if (!isValid(data.address.billing.street)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter billing street"
            })
        }


        if (!isValid(data.address.billing.city)) {
            return res.status(400).send({
                status: false,
                msg: "Plz enter billing city"
            })
        }


        if (!/^[1-9]{1}[0-9]{5}$/.test(data.address.billing.pincode)) {
            return res.status(400).send({ status: false, msg: "Plz enter billing pincode" })
        }

        //  =================================== duplicate data =============================================



        let dupliPhone = await usermodel.find({ phone: data.phone })
        if (dupliPhone.length > 0) {
            return res.status(400).send({ status: false, msg: "phone number already exits" })
        }


        let dupliEmail = await usermodel.find({ email: data.email })
        if (dupliEmail.length > 0) {
            return res.status(400).send({ status: false, msg: "email is already exists" })
        }

        // ============================================================================================

        let savedData = await usermodel.create(data)
        res.status(201).send({
            status: true, msg: "user created successfully", msg2: savedData
        })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


// const createUser = async function (req, res) {
//     try {
//         const data = req.body;
//         const files=req.files
//         if (Object.keys(data) == 0) {
//             return res.status(400).send({ status: false, msg: "no data provided" })
//         }
//         if(files && files.length>0){
//             //upload to s3 and get the uploaded link
//             // res.send the link back to frontend/postman
//             let uploadedFileURL= await uploadFile( files[0] )
//             data.profileImage=uploadedFileURL;
//             res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
//         }
//         else{
//             res.status(400).send({ msg: "No file found" })
//         }

//         if (!isValid(data.fname)) {
//             return res.status(400).send({ status: false, msg: "fname is required" })
//         }
//         if (!isValid(data.lname)) {
//             return res.status(400).send({ status: false, msg: "lname is required" })
//         }
//         if (!isValid(data.phone)) {
//             return res.status(400).send({ status: false, msg: "phone is required" })
//         }
//         if (!isValid(data.email)) {
//             return res.status(400).send({ status: false, msg: "email is required" })
//         }
//         if (!EmailRegex.test(data.email)) {
//             return res.status(400).send({ Status: false, message: " Please enter a valid email" })
//         }

//         if (!isValid(data.password)) {
//             return res.status(400).send({ status: false, msg: "password is required" })
//         }
//         if (!Passwordregex.test(data.Password)) {
//             return res.status(400).send({ Status: false, message: " Please enter a valid pass" })
//         }
//         if (!(data.password.length >= 8 && data.password.length <= 15)) {
//             return res.status(400).send({ status: false, msg: "password length b/w 8-15" })
//         }
//         const salt = await bcrypt.genSalt(10);
//         data.password = await bcrypt.hash(data.password, salt);


//         // if (!isValid(data.address)) {
//         //     return res.status(400).send({ status: false, msg: " adreses is required" })
//         // }
//         // if (!isValid(data.address.shipping)) {
//         //     return res.status(400).send({ status: false, msg: "shipping adreses is required" })
//         // }
//         // if (!isValid(data.address.billing)) {
//         //     return res.status(400).send({ status: false, msg: "billing adresses is required" })
//         // }
//         // if (!isValid(data.address.billing.pincode)) {
//         //     return res.status(400).send({ status: false, msg: "pincode required in billing address is required" })
//         // }

//     //--------duplicaton-----
//         const duplicateNumber = await usermodel.findOne({ phone: data.phone })
//         if (duplicateNumber) return res.status(400).send({ status: false, msg: 'number already exist' })

//         const duplicateEmail = await usermodel.findOne({ email: data.email })
//         if (duplicateEmail) return res.status(400).send({ status: false, msg: 'email already exist' })

//         let savedData = await usermodel.create(data)
//         if(savedData){
//             savedData.profileImage= uploadedFileURL
//         }
//         console.log(savedData)
//       res.status(201).send({ status: true, msg: "user created successfully", msg2: savedData })
//   }
//        catch(error){
//            return res.status(500).send({msg: error.message})
//        }
//      }


const loginUser = async function (req, res) {
    try {
        if (!Object.keys(req.body).length === 0)
            return res.status(400).send({ status: false, msg: "Please enter mail and password" });
        let userName = req.body.email;
        let password = req.body.password;
        //username validation
        if (!userName || userName === undefined) {
            return res.status(400).send({ status: false, msg: "Please enter email" });
        }
        //password validation
        if (!password || password === undefined) {
            return res.status(400).send({ status: false, msg: "Please enter password" });
        }
        userName = userName.trim().toLowerCase();
        password = password.trim();
        let user = await usermodel.findOne({ email: userName, password: password });
        if (!user)
            return res.status(404).send({ status: false, msg: "Please enter a valid email address and password" })

        //creating token
        let token = jwt.sign(
            {
                userId: user._id.toString(),
                group: "32",
                project: 5,
            },
            "Project-5-group-32", { expiresIn: "3600s" }
        );
        //set this token in response in header and also in body
        return res.status(200).send({ status: true, data: { userId: user._id, token: token } });
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({ status: "error", msg: err.message });
    }
};

//  const login = async function (req, res) {
//     try {
//         const data = req.body
// // validations
//         if (Object.keys(data) == 0)
//          return res.status(400).send({ status: false, msg: "Bad Request, No data provided" })

//         if (!isValid(data.email)) {
//              return res.status(400).send({ status: false, msg: "Email is required" }) }
//         if (!isValid(data.password)) {
//              return res.status(400).send({ status: false, msg: "Password is required" }) };
//              let userName= req.body.email
//              let password =req.body.password
//              let userEmailFind = await usermodel.findOne({ email: userName })
//   if (!userEmailFind) {
//       return res.status(400).send({status: false, msg: "userName is not correct" })};

//              bcrypt.compare(password, userEmailFind.password, function(err, result) {
//                 if (result) {
//                     let token = jwt.sign({
//                         userId: userEmailFind._id,
//                         iat: Math.floor(Date.now() / 1000),
//                         expiresIn:"2hr"
//                     }, "uranium");
//                     const userData = {
//                         userId: userEmailFind._id,
//                         token: token
//                     }
//                     res.status(201).send({status: true, message: "user login successfully", data: userData })
//                 }
//              }) 

//              } catch (error) {
//         return res.status(500).send({ msg: error.message })
//     }
// } 

const getUserbyId = async function (req, res) {
    try {
        const userId = req.params.userId;
        // if(!(isValid(userId))){
        //     return res.status(400).send({status:false,msg:"userId is required"})
        // }
        console.log(userId)
        if (Object.keys(req.params.userId) === 0)
            return res.status(400).send({ status: false, msg: "Bad Request, No data provided" })

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: 'Please provide a valid userId ' })
        }

        const users = await usermodel.findOne({ _id: userId })
        if (!users){
            return res.status(404).send({ status: false, message: "No user found according to your search" })
        }
        return res.status(200).send({ status: true, message: 'user detailed', data: users });
    }

    catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}
const updateUser = async function (req,res){
    try {
        let userId = req.params.userId
    
        let data = req.body
    
        // const isValidObjectId = mongoose.Types.ObjectId.isValid(ObjectId)
        let {fname, lname, email, password, phone, address} = data
      
       
        if(Object.keys(data)==0)
            return res.status(400).send({ status: false, message: "Enter data to update" }) 
        
        let findingUser = await usermodel.findById(userId)
        if(!findingUser)
        
            return res.status(400).send({status:false, message: "couldn't find userId"})
    if(fname)
                if (!fname)
                    return res.status(400).send({ status: false, message: "Please provide first name" })
    if(lname)
                if (!lname)
                    return res.status(400).send({ status: false, message: "Please provide last name" })
    if(email)
                    if (!email)
                    return res.status(400).send({ status: false, message: "Please provide email" })
    if(password)
                    if (!password)
                    return res.status(400).send({ status: false, message: "Please provide password" })
    if(phone)
                    if (!phone)
                    return res.status(400).send({ status: false, message: "Please provide phone number" })
    
            
            const phoneDuplicate = await usermodel.findOne({phone:data.phone})
            if(phoneDuplicate)
    
            return res.status(400).send({status:false,message:"phone can not be duplicate"})
    
            if (address) 
            {
                let shipAddress = data.address
    
                if (!shipAddress.shipping.street)
                    return res.status(400).send({ status: false, message: "shipping street field is required or not valid" })
    
                if (!shipAddress.shipping.city)
                    return res.status(400).send({ status: false, message: "city field is required or not valid" })
    
                if (!shipAddress.shipping.pincode)
                    return res.status(400).send({ status: false, message: "pincode field is required or not valid" })
    
                if (!shipAddress.billing.street)
    
                    return res.status(400).send({ status: false, message: "billing street field is required or not valid" })
    
                if (!shipAddress.billing.city)
                    return res.status(400).send({ status: false, message: "city field is required or not valid" })
    
                if (!shipAddress.billing.pincode)
                    return res.status(400).send({ status: false, message: "pincode field is required" })
    
                    const updateAddress = await usermodel.findOneAndUpdate({_id:userId},
                        { $set: { address:address
                        } })
                      
                        console.log(address);
    
                    }
    
                    // let files = req.files
                    // if(files){
                    //     if(files && files.length>0){
                    //         let uploadFile = await aws.uploadFile(files[0])
                    //     }
                    // }
    
        const updateUser = await usermodel.findOneAndUpdate({_id:userId},
        { $set: { fname: data.fname, lname : data.lname,email: data.email, phone: data.phone
        } },
        { new: true })
    
        return res.status(201).send({status:true, message: "User profile updated", data: updateUser})
        
    } catch (error) {
    
        return res.status(500).send({status:false, message:error.message})
        
    }
    }
    
module.exports.getUserbyId = getUserbyId
module.exports.createUser = createUser
module.exports.loginUser = loginUser
module.exports.updateUser = updateUser