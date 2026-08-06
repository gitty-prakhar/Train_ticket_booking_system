import mongoose from "mongoose";

const coachSchema = new mongoose.Schema(
    {
        scheduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Schedule",
            required: true,
        },
        coachNumber: {
            // e.g. "A1", "B2", "S1", "SL3", "C1"
            type: String,
            required: true,
            trim: true,
        },
        coachType: {
            // 1A = First AC, 2A = Second AC, 3A = Third AC
            // SL = Sleeper, CC = Chair Car, GEN = General
            type: String,
            enum: ["1A", "2A", "3A", "SL", "CC", "GEN"],
            required: true,
        },
        totalSeats: {
            type: Number,
            required: true,
        },
        availableSeats: {
            // Decrements on booking, increments on cancellation
            type: Number,
            required: true,
        },
        racCount: {
            // Number of RAC (Reservation Against Cancellation) berths filled
            type: Number,
            default: 0,
        },
        waitlistCount: {
            // Total passengers on waitlist for this coach
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export const Coach = mongoose.model("Coach", coachSchema);
