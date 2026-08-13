import { asyncHandler } from "../utils/asyncHandler.js";
import { Booking } from "../models/booking.model.js";
import twilio from "twilio";

const client=twilio(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);
export const handleIncomingMessage=asyncHandler(async(req,res)=>{
    const incomingText=req.body.Body||"";
    const senderNumber=req.body.From;

    let responseMessage="Hello from IRCTC! Send 'PNR <your-pnr-number>' to check your ticket status.";

    if(incomingText.toUpperCase().startsWith("PNR")){
        const pnrNumber=incomingText.split(" ")[1];

        if(pnrNumber){
            const booking=await Booking.findOne({
                pnr:pnrNumber
            }).populate("scheduleId");
            if(booking){
                responseMessage=`🚂 *IRCTC Ticket Status*\n\nPNR: ${booking.pnr}\nStatus: *${booking.status}*\nTotal Fare: ₹${booking.totalFare}\n\nHave a safe journey!`;
            }
            else{
                responseMessage=`❌ No booking found for PNR: ${pnrNumber}`;
            }
        }
    }

    await client.messages.create({
        body:responseMessage,
        from:process.env.TWILIO_WHATSAPP_NUMBER,
        to:senderNumber
    });
    res.status(200).send("OK");
})