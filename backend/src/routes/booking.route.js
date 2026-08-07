import { Router } from "express";
import { createBooking, getBookingByPNR, getMyBookings, cancelBooking } from "../controllers/booking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT,createBooking);
router.route("/my-bookings").get(verifyJWT,getMyBookings);
router.route("/pnr/:pnr").get(verifyJWT,getBookingByPNR);
router.route("/:bookingId/cancel").post(verifyJWT,cancelBooking);

export default router;
