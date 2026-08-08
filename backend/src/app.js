import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express();

app.use(
    cors({
        origin:process.env.CORS_ORIGIN||"*",
        credentials:true,
    })
)

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));

app.use(cookieParser());

import userRouter from "./routes/user.route.js";
import stationRouter from "./routes/station.route.js";
import trainRouter from "./routes/train.route.js";
import scheduleRouter from "./routes/schedule.route.js";
import searchRouter from "./routes/search.route.js";
import seatRouter from "./routes/seat.route.js";
import bookingRouter from "./routes/booking.route.js";

app.use("/api/v1/users",userRouter);
app.use("/api/v1/stations",stationRouter);
app.use("/api/v1/trains",trainRouter);
app.use("/api/v1/schedules",scheduleRouter);
app.use("/api/v1/search",searchRouter);
app.use("/api/v1/seats",seatRouter);
app.use("/api/v1/bookings",bookingRouter);

import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./docs/swagger.js";
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

import { errorHandler } from "./middlewares/error.middleware.js";
app.use(errorHandler);
export default app;