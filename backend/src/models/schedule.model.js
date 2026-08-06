import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
    {
        trainId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Train",
            required: true,
        },
        routeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Route",
            required: true,
        },
        journeyDate: {
            // The calendar date this specific train run departs from origin
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["Scheduled", "Running", "Delayed", "Cancelled", "Completed"],
            default: "Scheduled",
        },
        currentDelayMinutes: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Compound unique index: one train can only have ONE schedule per date
scheduleSchema.index({ trainId: 1, journeyDate: 1 }, { unique: true });

export const Schedule = mongoose.model("Schedule", scheduleSchema);
