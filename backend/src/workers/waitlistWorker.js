import { Worker } from "bullmq";
import Redis from "ioredis";
import { Waitlist } from "../models/waitlist.model.js";
import { Booking } from "../models/booking.model.js";
import { Coach } from "../models/coach.model.js";

const redisConnection = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null }) 
    : new Redis({ host: "127.0.0.1", port: 6379, maxRetriesPerRequest: null });

console.log("⏳ Waitlist Worker running...");

export const waitlistWorker = new Worker(
    "waitlistQueue",
    async (job) => {
        const { scheduleId, coachType } = job.data;

        // check if any seats are now available
        const coach = await Coach.findOne({ scheduleId, coachType });
        if (!coach || coach.availableSeats === 0) return;

        // find the first person in waitlist
        const topWL = await Waitlist.findOne({
            scheduleId,
            coachType,
            status: "WL",
        }).sort({ position: 1 });

        if (!topWL) return;

        // promote them to Confirmed
        topWL.status = "Confirmed";
        await topWL.save();

        await Booking.findByIdAndUpdate(topWL.bookingId, { status: "Confirmed" });

        console.log(`✅ Waitlist promoted: booking ${topWL.bookingId}`);
    },
    { connection: redisConnection }
);
