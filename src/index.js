const express = require('express');
const bodyParser = require('body-parser');
const route = require('./route/route.js');
const mongoose = require('mongoose');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const multer= require("multer");
const { AppConfig } = require('aws-sdk');
app.use(multer().any())

mongoose.connect("mongodb+srv://FunctionUp:surbhi231@cluster0.ufu0v.mongodb.net/group32-db", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )


app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});