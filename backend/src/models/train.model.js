import mongoose from "mongoose";

const trainSchema = new mongoose.Schema(
    {
        trainNumber: {
            // e.g. "12301", "22691", "12952"
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        trainName: {
            // e.g. "Howrah Rajdhani Express"
            type: String,
            required: true,
            trim: true,
        },
        trainType: {
            type: String,
            enum: ["Rajdhani", "Shatabdi", "Express", "Superfast", "Passenger", "VandeBharat"],
            required: true,
        },
        // Which days this train runs: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat
        runningDays: [
            {
                type: Number,
                min: 0,
                max: 6,
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const Train = mongoose.model("Train", trainSchema);
