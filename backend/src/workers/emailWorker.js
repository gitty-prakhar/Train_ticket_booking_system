import { Worker } from "bullmq";
import Redis from "ioredis";
import { Booking } from "../models/booking.model.js";
import { generateTicketPDF } from "../utils/pdfGenerator.js";
import { uploadPdfToS3 } from "../utils/s3Uploader.js";
import { Resend } from "resend";

//store the email sending job in redis
const redisConnection=process.env.REDIS_URL 
    ?new Redis(process.env.REDIS_URL,{maxRetriesPerRequest:null}) 
    :new Redis({host:"127.0.0.1",port:6379,maxRetriesPerRequest:null});

const resend=new Resend(process.env.RESEND_API_KEY);

console.log("📧 Email Worker running...");

export const emailWorker=new Worker(
    "emailQueue",
    async(job)=>{
        const{email,subject,message,bookingDetails}=job.data;
        
        if(!email||!subject || !message) {
            console.error("❌ Email job missing required data:",job.data);
            return;
        }

        let finalMessage=message;
        let attachments=[];

        if(bookingDetails){
            try{
                // 1. Generate the PDF
                const pdfBuffer=await generateTicketPDF(bookingDetails);
                
                // 2. Try S3 upload first
                try{
                    const s3Url=await uploadPdfToS3(pdfBuffer, bookingDetails.pnr);
                    finalMessage+=`\n\n⬇️ Download your official E-Ticket PDF here (Link expires in 24h):\n${s3Url}`;
                } catch(s3Err){
                    console.warn("S3 upload failed, attaching PDF directly to email instead.");
                    // 3. Fallback: attach PDF directly to email
                    attachments.push({
                        filename:`IRCTC-Ticket-${bookingDetails.pnr}.pdf`,
                        content:pdfBuffer
                    });
                    finalMessage += `\n\n📎 Your E-Ticket PDF is attached to this email.`;
                }
            } 
            catch(err){
                console.error("PDF generation failed:",err);
            }
        }

        try {
            // Send email using Resend API (HTTP)
            const{data,error}=await resend.emails.send({
                from: "IRCTC <onboarding@resend.dev>", // Default testing address for Resend
                to:email,
                subject:subject,
                text:finalMessage,
                attachments:attachments.length>0?attachments:undefined
            });

            if(error){
                console.error("❌ Resend API Error:",error);
                throw new Error(error.message);
            }

            console.log(`✅ Email sent successfully to ${email}${attachments.length ? " (with PDF attachment)" : ""}`);
        } 
        catch(err){
            console.error("Failed to send email via Resend:",err);
            throw err; // Re-throw to let BullMQ know the job failed
        }
    },
    {connection:redisConnection}
);

emailWorker.on("failed",(job,err)=>{
    console.error(`[EmailWorker]Job ${job?.id} failed: ${err?.message}`);
});
