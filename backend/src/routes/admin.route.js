import { Router } from "express";
import { getDashboardStats, getAllBookings, getAllUsers } from "../controllers/admin.controller.js";
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply auth middleware to ALL routes in this file - only admins can access
router.use(verifyJWT, verifyRole("admin"));

// Dashboard statistics
router.route("/dashboard").get(getDashboardStats);

// View all bookings across the platform
router.route("/bookings").get(getAllBookings);

// View all users
router.route("/users").get(getAllUsers);

export default router;
