//app.js is generally used to create and configure your express application
import express from "express"; //express is a framework for building web applications and APIs
import cors from "cors"; //cors is a middleware for enabling cross-origin resource sharing
import cookieParser from "cookie-parser"; //cookie-parser is a middleware for parsing cookies from the request headers
import compression from "compression";  //compression is a middleware that compresses http responses using algorithms such as gzip/Brotli depending on negotiation
import helmet from "helmet";    //helmet is a middleware that sets various http headers
import morgan from "morgan";    //morgan is a middleware that logs http requests to the console

const app=express();    //creates an express application

//compress all responses (must be first)
app.use(compression());

//set secure http headers
//express middleware that sets various http security headers to improve the security of your web application
//crossOriginResourcePolicy:false means helmet baaki security headers manage karega but CORP header ko helmet manage nahi karega
app.use(helmet({crossOriginResourcePolicy:false}));


app.use(morgan("dev")); //morgan is a middleware that logs http requests to the console

//enables cors
//this allows frontend to send request to backend
//origin=true means all origins are allowed and credentials=true means cookies can be sent to the server
app.use(
    cors({
        origin:true,
        credentials:true,
    })
);

//parse body
app.use(express.json({limit:"16kb"}));  //this middleware parses incoming json helps in destructuring in req.body
app.use(express.urlencoded({extended:true,limit:"16kb"}));  //this middleware parses incoming url encoded data  extended=true allows nested objects

app.use(cookieParser()); //this middleware parses incoming cookies from the browser stores them in req.cookies

//import all routes
import userRouter from "./routes/user.route.js";
import stationRouter from "./routes/station.route.js";
import trainRouter from "./routes/train.route.js";
import scheduleRouter from "./routes/schedule.route.js";
import searchRouter from "./routes/search.route.js";
import seatRouter from "./routes/seat.route.js";
import bookingRouter from "./routes/booking.route.js";
import paymentRouter from "./routes/payment.route.js";
import adminRouter from "./routes/admin.route.js";
import whatsappRouter from "./routes/whatsapp.routes.js";
import chatRouter from "./routes/chat.route.js";
app.use("/api/v1/users",userRouter);
app.use("/api/v1/stations",stationRouter);
app.use("/api/v1/trains",trainRouter);
app.use("/api/v1/schedules",scheduleRouter);
app.use("/api/v1/search",searchRouter);
app.use("/api/v1/seats",seatRouter);
app.use("/api/v1/bookings",bookingRouter);
app.use("/api/v1/payments",paymentRouter);
app.use("/api/v1/admin",adminRouter);
app.use("/api/v1/whatsapp",whatsappRouter);
app.use("/api/v1/chat",chatRouter);
import swaggerUi from "swagger-ui-express"; //swagger docs or documentation for the backend to mark all the apis
import { swaggerDocument } from "./docs/swagger.js";
app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerDocument));

//health check route for Render
app.get("/",(req,res)=>{
    res.status(200).json({success:true,message:"IRCTC Backend is running perfectly!"});
});

//global error handler
import { errorHandler } from "./middlewares/error.middleware.js";
app.use(errorHandler);
export default app;