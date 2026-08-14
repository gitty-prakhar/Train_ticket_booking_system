import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Booking } from "../models/booking.model.js";
import { Payment } from "../models/payment.model.js";
import { Seat } from "../models/seat.model.js";
import { Coach } from "../models/coach.model.js";
import { Schedule } from "../models/schedule.model.js";
import { Route } from "../models/route.model.js";
import { generateUniquePNR } from "../utils/pnrGenerator.js";
import { getSeatLockOwner, releaseSeatLock } from "../utils/seatLock.js";
import { calculateTotalFare, getDistanceBetweenStops } from "../utils/fareCalculator.js";
import { emailQueue } from "../queues/emailQueue.js";
import { whatsappQueue } from "../queues/whatsappQueue.js";

//create booking
const createBooking=asyncHandler(async(req,res)=>{
    const{scheduleId,coachType,boardingStationId,destinationStationId,passengers,isTatkal}=req.body;
    let{seatIds}=req.body;

    //validation
    if(!scheduleId||!coachType||!boardingStationId||!destinationStationId||!passengers){
        throw new ApiError(400,"All fields are required");
    }

    if(passengers.length>6){    //limit to 6 passengers only just like real irctc
        throw new ApiError(400,"Maximum 6 passengers per booking");
    }
    //also if more than 6 passengers then a bot/agent could mass book leaving nothing for normal users
    //this is just like the real irctc do

    const schedule=await Schedule.findById(scheduleId);
    //checking if the particular train is available on that schedule

    if(!schedule)throw new ApiError(404,"Schedule not found");
    if(schedule.status==="Cancelled")throw new ApiError(400,"This train is cancelled");

    const route=await Route.findById(schedule.routeId);
    if(!route)throw new ApiError(404,"Route not found");

    const boardingStation=await Station.findById(boardingStationId);
    const destStation=await Station.findById(destinationStationId);

    //auto assign seats if user has not selected any seats
    if(!seatIds||seatIds.length===0){
        const availableSeats=await Seat.find({
            scheduleId,
            status:"Available",
            coachId:{$in:await Coach.find({scheduleId,coachType}).distinct("_id")},
        }).limit(passengers.length);    //maximum as possible seats available

        if(availableSeats.length<passengers.length){   //not enough seats available for all passengers
            throw new ApiError(409,`Only ${availableSeats.length} seats available in ${coachType}. Please reduce passengers.`);
        }
        seatIds=availableSeats.map(s=>s._id.toString());
    }
    else{
        //manual seat selection if user has selected seats
        if(passengers.length!==seatIds.length){
            throw new ApiError(400,"Each passenger must have one seat");
        }
        for(const seatId of seatIds){
            const lockOwner=await getSeatLockOwner(seatId);
            if(!lockOwner)throw new ApiError(409,"Seat lock expired. Please re-select seats.");
            if(lockOwner!==req.user._id.toString())throw new ApiError(403,"You do not hold the lock on this seat.");
        }
    }

    //calculate fare
    const distanceKm=getDistanceBetweenStops(route.stops,boardingStationId,destinationStationId);
    const totalFare=calculateTotalFare(distanceKm,coachType,isTatkal||false,passengers);

    //generate PNR
    const pnr=await generateUniquePNR();

    const paymentId=new mongoose.Types.ObjectId();
    const bookingId=new mongoose.Types.ObjectId();

    //create payment(Pending — Razorpay confirms it later)
    const payment=await Payment.create({
        _id:paymentId,
        userId:req.user._id,
        bookingId:bookingId,
        amount:totalFare*100,
        currency:"INR",
        status:"Pending",
    });

    // attach seatId to each passenger
    const passengersWithSeats=passengers.map((p,i)=>({...p,seatId:seatIds[i]}));

    // create booking
    const booking=await Booking.create({
        _id:bookingId,
        pnr,
        userId:req.user._id,
        scheduleId,
        boardingStationId,
        destinationStationId,
        coachType,
        passengers:passengersWithSeats,
        status:"Confirmed",
        totalFare,
        paymentId:payment._id,
        isTatkal:isTatkal||false,
        travelDate:schedule.journeyDate,
    });

    //mark seats as Booked
    await Seat.updateMany(
        {_id:{$in:seatIds}},
        {status:"Booked",bookedBy:booking._id,lockedBy:null,lockExpiresAt:null}
    );

    //reduce available seats on specific coaches
    const bookedSeats=await Seat.find({_id:{$in:seatIds}});
    const coachCounts={};
    for(const seat of bookedSeats){
        coachCounts[seat.coachId]=(coachCounts[seat.coachId]||0)+1;
    }
    for(const coachId in coachCounts){
        await Coach.findByIdAndUpdate(coachId,{ $inc: { availableSeats: -coachCounts[coachId] } });
    }

    //release Redis locks(only if they were manually locked)
    for(const seatId of seatIds){
        await releaseSeatLock(seatId).catch(()=>{});
    }

    //send E-Ticket Email asynchronously
    try{
        let boardingName;
        if(boardingStation){
            boardingName=boardingStation.name;
        }
        else{
            boardingName="Boarding Station";
        }
        let destName;
        if(destStation){
            destName=destStation.name;
        }
        else{
            destName="Destination Station";
        }
        
        //send e-ticket email
        await emailQueue.add("sendTicket",{
            email:req.user.email,
            subject:`IRCTC — E-Ticket Confirmed (PNR: ${pnr})`,
            message: `Hello ${req.user.username},\n\nYour train ticket has been confirmed!\n\nPNR: ${pnr}\nTrain Route: ${boardingName} to ${destName}\nTravel Date: ${new Date(schedule.journeyDate).toLocaleDateString()}\nTotal Fare: ₹${totalFare}\n\nHave a safe journey!\n- IRCTC Team`,
            bookingDetails: {
                pnr: pnr,
                status: "Confirmed",
                totalFare: totalFare
            }
        });

        //send whatsapp message
        if(req.user.phone){
            await whatsappQueue.add("sendTicket",{
                phone:req.user.phone,
                pnr:pnr,
                totalFare:totalFare,
                date:new Date(schedule.journeyDate).toLocaleDateString()
            });
        }
    } 
    catch(err){
        console.error("Failed to queue booking email:",err);
    }

    return res.status(201).json(
        new APIResponse(201,booking,`Booking confirmed! Your PNR is ${pnr}`)
    );
});


//get booking by pnr
const getBookingByPNR=asyncHandler(async(req,res)=>{

    const pnr=req.params.pnr;
    const upperCasePNR=pnr.toUpperCase();

    const booking=await Booking.findOne({pnr:upperCasePNR})
        .populate("scheduleId","journeyDate status")
        .populate("boardingStationId","name code")
        .populate("destinationStationId","name code")
        .populate("paymentId","amount status");

    if(!booking)throw new ApiError(404,"No booking found with this PNR");

    //only owner or admin can view
    if(booking.userId.toString()!==req.user._id.toString()&&req.user.role!=="admin"){
        throw new ApiError(403,"This is not your booking");
    }

    return res.status(200).json(
        new APIResponse(200,booking,"Booking fetched successfully")
    );
});

//get my bookings
const getMyBookings=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const bookings=await Booking.find({userId})
        .populate("scheduleId","journeyDate status")
        .populate("boardingStationId","name code")
        .populate("destinationStationId","name code")
        .sort({createdAt:-1});

    return res.status(200).json(
        new APIResponse(200,bookings,"Your bookings fetched successfully")
    );
});

//cancel booking
const cancelBooking=asyncHandler(async(req,res)=>{
    const bookingId=req.params.bookingId;
    const booking=await Booking.findById(bookingId);
    if(!booking)throw new ApiError(404,"Booking not found");

    //only owner or admin can cancel the booking
    if(booking.userId.toString()!==req.user._id.toString()&&req.user.role!=="admin"){
        throw new ApiError(403,"You cannot cancel this booking");
    }

    if(booking.status==="Cancelled"){
        throw new ApiError(400,"Booking is already cancelled");
    }

    //refund based on time left for the journey
    const hoursLeft=(new Date(booking.travelDate)-new Date())/(1000*60*60); 
    let refundPercent=0;
    if(hoursLeft>48){
        refundPercent=75;
    }
    else if(hoursLeft>24){
        refundPercent=50;
    }
    else if(hoursLeft>12){
        refundPercent=25;
    }

    const refundAmount=Math.round((booking.totalFare*refundPercent)/100); //approximate refund amount 

    booking.status="Cancelled";
    booking.cancellationTime=new Date();
    booking.refundAmount=refundAmount;
    await booking.save();

    //free up seats

    //from the booking take only that seats which have seatId and then map them to seatIds 
    //filter selects only those passengers who have seatId, map then extracts seatId from each passenger object
    const seatIds=booking.passengers.filter(p=>p.seatId).map(p=>p.seatId);

    //make seats available
    await Seat.updateMany({_id:{$in:seatIds}},{status:"Available",bookedBy:null});

    //increase available seats on specific coaches
    const bookedSeats=await Seat.find({_id:{$in:seatIds}});
    const coachCounts={};
    for(const seat of bookedSeats){
        coachCounts[seat.coachId]=(coachCounts[seat.coachId]||0)+1;
    }
    for(const coachId in coachCounts){
        await Coach.findByIdAndUpdate(coachId,{$inc:{availableSeats:coachCounts[coachId]}});
    }

    //update payment
    if(refundAmount>0){
        await Payment.findByIdAndUpdate(booking.paymentId,{
            status:"Refunded",refundAmount,refundInitiatedAt:new Date(),
        });
    }

    return res.status(200).json(
        new APIResponse(200,{
            pnr:booking.pnr,
            status:"Cancelled",
            refundAmount,
            message:refundAmount>0
                ?`₹${refundAmount} refund will be processed in 5-7 business days`
                :"No refund cancelled too close to departure",
        },"Booking cancelled")
    );
});

export{createBooking,getBookingByPNR,getMyBookings,cancelBooking};
