import mongoose from "mongoose";

const stationSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true,
        },
        code:{
            //e.g. NDLS, BCT
            type:String,
            required:true,
            unique:true,
            uppercase:true,
            trim:true,
        },
        city:{
            type:String,
            required:true,
            trim:true,
        },
        state:{
            type:String,
            required:true,
            trim:true,
        },
        zone:{
            //NR, WR
            type:String,
            trim:true,
        },
    },
    {timestamps:true}
);

export const Station=mongoose.model("Station",stationSchema);
