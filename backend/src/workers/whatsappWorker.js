import { Worker } from "bullmq";
import Redis from "ioredis";

//redis connection to store whatsapp jobs
const redisConnection=process.env.REDIS_URL?new Redis(process.env.REDIS_URL,{maxRetriesPerRequest:null}):new Redis({host:"127.0.0.1",port:6379,maxRetriesPerRequest:null});
import twilio from "twilio";
//twilio for whatsapp messaging

//twilio credentials from environment variables
const client=twilio(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);

//bullmq worker definition for whatsapp 
const whatsappWorker=new Worker(
    "whatsappQueue",
    async(job)=>{   //job processing function
        if(job.name==="sendTicket"){
            const{phone,pnr,totalFare,date}=job.data;   //extract job data
            const formattedPhone=`whatsapp:+91${phone}`;//format phone number for twilio

            //twilio message creation with ticket details
            await client.messages.create({
                body:`🎟️ *IRCTC E-Ticket Confirmed!*\n\nPNR: ${pnr}\nDate: ${date}\nFare: ₹${totalFare}\n\nThank you for choosing IRCTC.`,
                from:process.env.TWILIO_WHATSAPP_NUMBER,
                to:formattedPhone
            });
            console.log(`WhatsApp E-Ticket sent to ${phone}`); //log success
        }
    },
    {connection:redisConnection} //pass redis connection to worker
);

whatsappWorker.on("completed",(job)=>console.log(`Job ${job.id} completed.`)); //log job completion
whatsappWorker.on("failed",(job,err)=>console.error(`Job ${job.id} failed:`,err.message)); //log job failure

export default whatsappWorker;
