import { Worker } from "bullmq";
import Redis from "ioredis";
import { Booking } from "../models/booking.model.js";
import { sendEmail } from "../utils/sendEmail.js";

//store the email sending job in redis
const redisConnection=new Redis({
    host:process.env.REDIS_HOST||"127.0.0.1",
    port:process.env.REDIS_PORT||6379,
    maxRetriesPerRequest:null,
});

console.log("📧 Email Worker running...");

export const emailWorker=new Worker(
    "emailQueue",
    async(job)=>{
        const{bookingId}=job.data;

        const booking=await Booking.findById(bookingId)
            .populate("userId","email username")
            .populate("boardingStationId","name code")
            .populate("destinationStationId","name code");

        if(!booking)return;

        const message = `
            Hello ${booking.userId.username},

            Your booking is confirmed!

            PNR       : ${booking.pnr}
            From      : ${booking.boardingStationId.name} (${booking.boardingStationId.code})
            To        : ${booking.destinationStationId.name} (${booking.destinationStationId.code})
            Travel Date : ${new Date(booking.travelDate).toDateString()}
            Total Fare  : ₹${booking.totalFare}
            Passengers  : ${booking.passengers.length}

            Have a safe journey!
            TrainBook Team`;

        await sendEmail({
            email:booking.userId.email,
            subject:`Booking Confirmed — PNR ${booking.pnr}`,
            message,
        });

        console.log(`✅ Email sent for PNR ${booking.pnr}`);
    },
    {connection:redisConnection}
);
