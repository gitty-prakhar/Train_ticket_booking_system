import dotenv from "dotenv";
dotenv.config({path:'./.env'});

import connectDB from "./db/index.js";
import app from "./app.js";

// Initialize Queues and Workers
import "./queues/emailQueue.js";
import "./queues/waitlistQueue.js";
import "./workers/emailWorker.js";
import "./workers/waitlistWorker.js";

connectDB()
.then(()=>{
    let port =process.env.PORT||8000;
    app.listen(port,()=>{
        console.log(`Server running at port ${port}\n`);
    })
})
.catch((err)=>{
    console.log(err);
})