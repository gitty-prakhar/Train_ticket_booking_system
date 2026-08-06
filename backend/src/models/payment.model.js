import mongoose from "mongoose";

// Each payment attempt (failed/retried payments) logged separately
const attemptSchema = new mongoose.Schema(
    {
        attemptedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["Success", "Failed"],
        },
        failureReason: {
            type: String,
            default: null,
        },
    },
    { _id: false }
);

const paymentSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Razorpay fields
        gatewayOrderId: { type: String, default: null },    // Razorpay order_id
        gatewayPaymentId: { type: String, default: null },  // Razorpay payment_id
        gatewaySignature: { type: String, default: null },  // Razorpay signature (for verification)

        amount: {
            type: Number,
            required: true,
            // Stored in PAISE (1 rupee = 100 paise) as Razorpay expects
        },
        currency: {
            type: String,
            default: "INR",
        },
        method: {
            type: String,
            enum: ["Card", "UPI", "Wallet", "NetBanking", "Unknown"],
            default: "Unknown",
        },
        status: {
            type: String,
            enum: ["Pending", "Completed", "Failed", "Refunded", "PartialRefund"],
            default: "Pending",
        },

        // Refund tracking
        refundId: { type: String, default: null },
        refundAmount: { type: Number, default: 0 },
        refundInitiatedAt: { type: Date, default: null },
        refundCompletedAt: { type: Date, default: null },

        attempts: [attemptSchema],
    },
    { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
