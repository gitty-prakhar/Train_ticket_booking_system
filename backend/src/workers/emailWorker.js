import { Worker } from "bullmq";
import Redis from "ioredis";
import { Booking } from "../models/booking.model.js";
import { generateTicketPDF } from "../utils/pdfGenerator.js";
import { uploadPdfToS3 } from "../utils/s3Uploader.js";
import nodemailer from "nodemailer";

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
        let attachments = [];

        if (bookingDetails) {
            try {
                // 1. Generate the PDF
                const pdfBuffer = await generateTicketPDF(bookingDetails);
                
                // 2. Try S3 upload first
                try {
                    const s3Url = await uploadPdfToS3(pdfBuffer, bookingDetails.pnr);
                    finalMessage += `\n\n⬇️ Download your official E-Ticket PDF here (Link expires in 24h):\n${s3Url}`;
                } catch (s3Err) {
                    console.warn("S3 upload failed, attaching PDF directly to email instead.");
                    // 3. Fallback: attach PDF directly to email
                    attachments.push({
                        filename: `IRCTC-Ticket-${bookingDetails.pnr}.pdf`,
                        content: pdfBuffer,
                        contentType: "application/pdf"
                    });
                    finalMessage += `\n\n📎 Your E-Ticket PDF is attached to this email.`;
                }
            } catch (err) {
                console.error("PDF generation failed:", err);
            }
        }

        // Send email with optional attachment
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        await transporter.sendMail({
            from: `IRCTC <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            text: finalMessage,
            attachments
        });

        console.log(`✅ Email sent successfully to ${email}${attachments.length ? " (with PDF attachment)" : ""}`);
    },
    {connection:redisConnection}
);
