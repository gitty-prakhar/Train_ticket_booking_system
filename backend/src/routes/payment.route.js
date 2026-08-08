import { Router } from "express";
import { createOrder, verifyPayment, getMyPayments } from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Used to generate an order ID from Razorpay before showing payment gateway
router.route("/order").post(verifyJWT, createOrder);

// Used by Razorpay webhook/frontend to verify the payment signature
router.route("/verify").post(verifyJWT, verifyPayment);

// Used to get payment history for the logged in user
router.route("/my-payments").get(verifyJWT, getMyPayments);

export default router;
