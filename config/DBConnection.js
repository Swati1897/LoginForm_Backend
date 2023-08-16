const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
module.exports = function DBConnection(){
 
 mongoose.connect(process.env.URI)
 .then(()=>{
 console.log("Database connection is established");
 })
 .catch((err)=>{
 console.error(err);
 })
}