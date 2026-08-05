import connectDB from "./db/index.js";
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config({path:'./.env'});

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