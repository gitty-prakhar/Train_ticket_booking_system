import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
    {
        scheduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schedule",
            required: true,
        },
        coachId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coach",
            required: true,
        },
        seatNumber: {
            // e.g. "1", "2", "63", "72"
            type: String,
            required: true,
            trim: true,
        },
        berthType: {
            // Lower/Middle/Upper for sleeper classes
            // Seat for chair car (CC), None for GEN
            type: String,
            enum: ["Lower", "Middle", "Upper", "Side-Lower", "Side-Upper", "Seat", "None"],
            default: "None",
        },
        status: {
            // State machine: Available → Locked → Booked
            // Locked = held during payment (10 min TTL via Redis)
            // On cancel: Booked → Available
            type: String,
            enum: ["Available", "Locked", "Booked"],
            default: "Available",
        },
        // userId who currently holds the Redis lock (during payment window)
        lockedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        lockExpiresAt: {
            // When the Redis lock expires (Date.now + 10 minutes)
            type: Date,
            default: null,
        },
        // bookingId that owns this seat after confirmed payment
        bookedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            default: null,
        },
    },
    { timestamps: true }
);

export const Seat = mongoose.model("Seat", seatSchema);
