import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

// 1. Compress all responses (must be first)
app.use(compression());

// 2. Set secure HTTP headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// 3. Log incoming requests in dev
app.use(morgan("dev"));

app.use(
    cors({
        origin: [
            process.env.CORS_ORIGIN || "http://localhost:5173", 
            "http://localhost:5173",
            "https://train-ticket-booking-system-peach.vercel.app"
        ],
        credentials: true,
    })
);

// 5. Parse body
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(cookieParser());

import userRouter from "./routes/user.route.js";
import stationRouter from "./routes/station.route.js";
import trainRouter from "./routes/train.route.js";
import scheduleRouter from "./routes/schedule.route.js";
import searchRouter from "./routes/search.route.js";
import seatRouter from "./routes/seat.route.js";
import bookingRouter from "./routes/booking.route.js";
import paymentRouter from "./routes/payment.route.js";
import adminRouter from "./routes/admin.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/stations", stationRouter);
app.use("/api/v1/trains", trainRouter);
app.use("/api/v1/schedules", scheduleRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/seats", seatRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/admin", adminRouter);

import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./docs/swagger.js";
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check route for Render
app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "IRCTC Backend is running perfectly!" });
});

import { errorHandler } from "./middlewares/error.middleware.js";
app.use(errorHandler);
export default app;