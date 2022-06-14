const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {type: String,required:true, unique: true,uppercase:true},
  description: {
      type: String, 
      required:true, 
    },
  price: {
      type: Number, 
      required: true,  //validate: {validator: validator.isValidNumber, message: 'Price should be valid Number', isAsync: false}
    },
  currencyId: {
      type: String,
      required: true,  //default: 'INR'
    },
  currencyFormat: {
      type: String, 
      required: true, 
      // default: '₹'
    },
  isFreeShipping: {
      type: Boolean, 
      default: false
    },
  productImage: {
      type: String,
      required: true, 
    },
  style: {
      type: String
    },
  availableSizes: {
      type: [String], 
      required: true, 
      enum: ["S", "XS","M","X", "L","XXL", "XL"]
    },
  installments: {
      type: Number
    },
  deletedAt: {
      type: Date,
      default : null
    }, 
  isDeleted: {
      type: Boolean, 
      default: false
    },
}, { timestamps: true })

module.exports = mongoose.model('Product', productSchema)