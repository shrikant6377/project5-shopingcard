const { default: mongoose } = require("mongoose");

//const ObjectId = require("mongoose").Types.ObjectId


//******************//

//==Request Body Validation
let isValidRequestBody = function (body) {
    if (Object.keys(body).length === 0) return false;
    return true;
}


//********************//

// //==quantityRange Validation

let quantityRange = function (data) {
    if(Object.keys(data).length==0 || data ==undefined) return false;
    return true;
}
//********************//

//==Mandatory Field Validation
let isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true;
}

//*******************//

//==ObjectId Validation

let isValidObjectId = function (ObjectId){
    // if(!ObjectId.isvalid( ObjectId)) return false;
    // return true;
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

//*******************//

//==Pincode Valid
let isValidPincode = function (pincode){
   let pincodeRegex =  /^[0-9]{6}$/
   return pincodeRegex.test(pincode)
}
//******************//

//==Email Valid
let isValidEmail = function (email) {
    let emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
    return emailRegex.test(email);
}

//*******************//

//==Mobile Number Validation
let isValidMobile = function (phone) {
    let mobileRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
    return mobileRegex.test(phone);
}

//******************//

//==Name Validation
let isValidName = function(name){
    let nameRegex=/^[A-Za-z\s]{1,}[A-Za-z\s]{0,}$/;
    return nameRegex.test(name);
}

//*****************//

//==password Validation
let isValidPassowrd = function(password){
    let regexPassword = /^([a-zA-Z0-9!@#$%^&*_\-+=><]{8,15})$/
    return regexPassword.test(password);
}

//******************//

//==Price Validation
let isValidPrice = function(price){
    let priceRegex=/^(\d+(\.\d+)?)$/;
    return priceRegex.test(price);
}

//*****************//

//==Enum Validation
let isValidEnum = function(value){
    let availableSizes=["S", "XS","M","X", "L","XXL", "XL"];
    return availableSizes.includes(value)
}

//*******************************************************************//

//==File Validation
const isValidFile = function(files){
    let imageRegex = /.*\.(jpeg|jpg|png)$/;
    return imageRegex.test(files)
}


//****************//

//==Enum Validation
const isValidNum = (number)=>{
    if(/^\d+$/.test(number)){
        return true
    }else{
        return false;
    }
};

module.exports={ isValidRequestBody,quantityRange,isValidNum, isValid,isValidPincode, isValidObjectId, isValidEmail, isValidMobile, isValidName,isValidPassowrd,isValidPrice,isValidFile,isValidEnum}