import mongoose from "mongoose";

// Sub-schema: each individual stop on the route
const stopSchema = new mongoose.Schema(
    {
        stationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Station",
            required: true,
        },
        stopNumber: {
            // 1 = origin, last stopNumber = final destination
            type: Number,
            required: true,
        },
        arrivalTime: {
            // "HH:MM" 24hr format — null for origin station (no arrival)
            type: String,
            default: null,
        },
        departureTime: {
            // "HH:MM" 24hr format — null for final destination (no departure)
            type: String,
            default: null,
        },
        distanceFromOrigin: {
            // in km — used by fareCalculator
            type: Number,
            required: true,
        },
        haltMinutes: {
            type: Number,
            default: 0,
        },
        dayNumber: {
            // 1 = same day as start, 2 = next day (for overnight trains like Rajdhani)
            type: Number,
            default: 1,
        },
    },
    { _id: false } // no separate _id for sub-docs
);

const routeSchema = new mongoose.Schema(
    {
        trainId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Train",
            required: true,
        },
        stops: [stopSchema],
    },
    { timestamps: true }
);

export const Route = mongoose.model("Route", routeSchema);
