import mongoose from "mongoose";

const waitlistSchema=new mongoose.Schema(
    {
        scheduleId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Schedule",
            required:true,
        },
        coachType:{
            type:String,
            enum:["1A","2A","3A","SL","CC","GEN"],
            required:true,
        },
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        bookingId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Booking",
            required:true,
        },
        position:{
            //1 = first in queue gets promoted first when a seat frees up
            type:Number,
            required:true,
        },
        status:{
            type:String,
            enum:["WL","RAC","Confirmed","Cancelled"],
            default:"WL",
        },
    },
    {timestamps:true}
);

export const Waitlist=mongoose.model("Waitlist",waitlistSchema);
