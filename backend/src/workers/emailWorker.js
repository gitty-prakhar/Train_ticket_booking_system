import { Worker } from "bullmq";
import Redis from "ioredis";
import { Booking } from "../models/booking.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateTicketPDF } from "../utils/pdfGenerator.js";
import { uploadPdfToS3 } from "../utils/s3Uploader.js";

//store the email sending job in redis
const redisConnection = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null }) 
    : new Redis({ host: "127.0.0.1", port: 6379, maxRetriesPerRequest: null });

console.log("📧 Email Worker running...");

export const emailWorker=new Worker(
    "emailQueue",
    async(job)=>{
        const { email, subject, message, bookingDetails } = job.data;
        
        if (!email || !subject || !message) {
            console.error("❌ Email job missing required data:", job.data);
            return;
        }

        let finalMessage = message;

        if (bookingDetails) {
            try {
                // 1. Generate the PDF
                const pdfBuffer = await generateTicketPDF(bookingDetails);
                
                // 2. Upload to AWS and get the link
                const s3Url = await uploadPdfToS3(pdfBuffer, bookingDetails.pnr);
                
                // 3. Add the link to the email!
                finalMessage += `\n\n⬇️ Download your official E-Ticket PDF here (Link expires in 24h):\n${s3Url}`;
            } catch (err) {
                console.error("AWS Upload Failed, sending standard email instead:", err);
            }
        }

        await sendEmail({ email, subject, message: finalMessage });
        console.log(`✅ Email sent successfully to ${email}`);
    },
    {connection:redisConnection}
);
