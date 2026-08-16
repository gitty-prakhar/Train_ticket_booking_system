import dotenv from "dotenv";    //dotenv helps to load environment variables from a .env file into process.env
dotenv.config({path:'./.env'}); //this loads environment variables from a .env file into process.env

import connectDB from "./db/index.js"; //imports the connectDB function
import app from "./app.js"; //imports the express app

//initialize queues and workers
import "./queues/emailQueue.js";
import "./queues/waitlistQueue.js";
import "./queues/whatsappQueue.js";
import "./workers/emailWorker.js";
import "./workers/waitlistWorker.js";
import "./workers/whatsappWorker.js";

//connect database
connectDB()
.then(()=>{
    let port=process.env.PORT||8000; //port is set to 8000 if process.env.PORT is not defined
    app.listen(port,()=>{
        console.log(`Server running at port ${port}\n`);  //server is started on the specified port
    })
})
.catch((err)=>{
    console.log(err);
})