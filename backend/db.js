const mongoose = require('mongoose');
require('dotenv').config();
// const url=`mongodb://0.0.0.0:27017/entrance?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false`;
const url = process.env.DB_URL;


const connect = async()=>{
    try {
        console.log("[DATABASE] Connecting to MongoDB database...");
        await mongoose.connect(url);
        console.log("[DATABASE] MongoDB connected successfully.");
    } catch (error) {
        console.log("[DATABASE] Connection error: "+error);
    }

}

module.exports=connect;
