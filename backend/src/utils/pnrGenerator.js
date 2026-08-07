import { Booking } from "../models/booking.model.js";

export const generateUniquePNR=async()=>{
    const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let pnr;
    let isUnique=false;

    while(!isUnique){   //jab tak isUnique false rhega tab tak
        const letter1=letters[Math.floor(Math.random()*26)];    //generates a random digit bw 0-25
        const letter2=letters[Math.floor(Math.random()*26)];    //generates a random digit bw 0-25
        const digits=Math.floor(1000000+Math.random()*9000000); //generate a random 7 digit letter

        pnr=`${letter1}${letter2}${digits}`;  //9 digits unique pnr

        const existing=await Booking.findOne({pnr});

        if(!existing){
            isUnique=true;
        }
    }
    return pnr;
}