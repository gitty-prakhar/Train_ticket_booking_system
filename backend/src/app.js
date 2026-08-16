import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";  //compresses http responses using algorithms such as gzip/Brotli depending on negotiation
import helmet from "helmet";    //secures the app by setting various http headers
import morgan from "morgan";    //logs http requests to the console

const app=express();    //creates an express application

//Compress all responses (must be first)
app.use(compression());

//set secure http headers
app.use(helmet({crossOriginResourcePolicy:false}));

//log incoming requests in dev
app.use(morgan("dev"));

//enables cors
app.use(
    cors({
        origin:true,
        credentials: true,
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

app.use("/api/v1/users", userRouter);
app.use("/api/v1/stations", stationRouter);
app.use("/api/v1/trains", trainRouter);
app.use("/api/v1/schedules", scheduleRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/seats", seatRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/whatsapp", whatsappRouter);

import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./docs/swagger.js";
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check route for Render
app.get("/",(req,res)=>{
    res.status(200).json({success:true,message:"IRCTC Backend is running perfectly!"});
});

import { errorHandler } from "./middlewares/error.middleware.js";
app.use(errorHandler);
export default app;