import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

//connects to MongoDB and returns a connection instance
const connectDB=async()=>{
    try{
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); //connects to MongoDB with the specified URI and database name
        console.log(`MONGODB connected successfully and host is ${connectionInstance.connection.host}`); //logs the connection instance to the console
    }
    catch(err){
        console.log("MongoDB connection failed ",err);
        process.exit(1);
    }
}

export default connectDB;
