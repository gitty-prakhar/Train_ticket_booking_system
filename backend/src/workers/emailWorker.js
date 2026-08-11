import { Worker } from "bullmq";
import Redis from "ioredis";
import { Booking } from "../models/booking.model.js";
import { sendEmail } from "../utils/sendEmail.js";

//store the email sending job in redis
const redisConnection = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null }) 
    : new Redis({ host: "127.0.0.1", port: 6379, maxRetriesPerRequest: null });

console.log("📧 Email Worker running...");

export const emailWorker=new Worker(
    "emailQueue",
    async(job)=>{
        const { email, subject, message } = job.data;
        
        if (!email || !subject || !message) {
            console.error("❌ Email job missing required data:", job.data);
            return;
        }

        await sendEmail({ email, subject, message });
        console.log(`✅ Email sent successfully to ${email}`);
    },
    {connection:redisConnection}
);
