import { Worker } from "bullmq";
import Redis from "ioredis";

const redisConnection=process.env.REDIS_URL?new Redis(process.env.REDIS_URL,{maxRetriesPerRequest:null}):new Redis({host:"127.0.0.1",port:6379,maxRetriesPerRequest:null});
import twilio from "twilio";

const client=twilio(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);

const whatsappWorker=new Worker(
    "whatsappQueue",
    async(job)=>{
        if(job.name==="sendTicket"){
            const{phone,pnr,totalFare,date}=job.data;
            const formattedPhone=`whatsapp:+91${phone}`;

            await client.messages.create({
                body:`🎟️ *IRCTC E-Ticket Confirmed!*\n\nPNR: ${pnr}\nDate: ${date}\nFare: ₹${totalFare}\n\nThank you for choosing IRCTC.`,
                from:process.env.TWILIO_WHATSAPP_NUMBER,
                to:formattedPhone
            });
            console.log(`WhatsApp E-Ticket sent to ${phone}`);
        }
    },
    {connection:redisConnection}
);

whatsappWorker.on("completed",(job)=>console.log(`Job ${job.id} completed.`));
whatsappWorker.on("failed",(job,err)=>console.error(`Job ${job.id} failed:`,err.message));

export default whatsappWorker;
