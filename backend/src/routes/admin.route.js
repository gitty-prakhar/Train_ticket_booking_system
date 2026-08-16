import { Router } from "express";
import { getDashboardStats, getAllBookings, getAllUsers } from "../controllers/admin.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";

const router=Router();

//apply auth middleware to ALL routes in this file - only admins can access
router.use(verifyJWT,verifyRole("admin"));

//dashboard statistics
router.route("/dashboard").get(getDashboardStats);

//view all bookings across the platform
router.route("/bookings").get(getAllBookings);

//view all users
router.route("/users").get(getAllUsers);

export default router;
