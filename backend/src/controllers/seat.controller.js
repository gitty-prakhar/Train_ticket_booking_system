import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Seat } from "../models/seat.model.js";
import { Coach } from "../models/coach.model.js";
import { lockSeat, getSeatLockOwner, releaseSeatLock, getLockTTL } from "../utils/seatLock.js";

const getSeatMap=asyncHandler(async(req,res)=>{
    const{coachId}=req.params;

    const coach=await Coach.findById(coachId);
    if(!coach)throw new ApiError(404,"Coach not found");

    const seats=await Seat.find({coachId}).select("seatNumber berthType status lockExpiresAt");

    return res.status(200).json(new APIResponse(200,{coach,seats},"Seat map fetched"));
});

// POST lock seats — user selects seats before filling details
const lockSeats=asyncHandler(async(req,res)=>{
    const {seatIds}=req.body;

    if(!seatIds || seatIds.length===0){
        throw new ApiError(400,"seatIds array is required");
    }

    if(seatIds.length>6){
        throw new ApiError(400,"Cannot lock more than 6 seats at once");
    }

    const seats=await Seat.find({
        _id:{$in:seatIds },
        status:"Available",
    });

    if(seats.length!==seatIds.length){
        throw new ApiError(409,"One or more seats are not available. Please refresh.");
    }

    const failedSeats=[];

    for(const seatId of seatIds){
        const locked = await lockSeat(seatId,req.user._id);
        if(!locked){
            failedSeats.push(seatId);
        }
    }

    if (failedSeats.length>0){
        for (const seatId of seatIds){
            if (!failedSeats.includes(seatId)) {
                await releaseSeatLock(seatId);
            }
        }
        throw new ApiError(409,"Some seats were just taken. Please select again.");
    }

    const lockExpiresAt=new Date(Date.now()+600*1000); //10 min from now

    await Seat.updateMany(
        { _id:{$in:seatIds}},
        {
            status:"Locked",
            lockedBy:req.user._id,
            lockExpiresAt,
        }
    );

    //get how many seconds are left on lock (for frontend timer)
    const ttl=await getLockTTL(seatIds[0]);

    return res.status(200).json(new APIResponse(200,{lockedSeatIds:seatIds,lockExpiresAt,ttlSeconds:ttl},"Seats locked. You have 10 minutes to complete booking."));
});

const releaseSeats = asyncHandler(async(req,res)=>{
    const {seatIds}=req.body;

    if(!seatIds||seatIds.length===0){
        throw new ApiError(400,"seatIds array is required");
    }

    //release Redis locks
    for(const seatId of seatIds){
        await releaseSeatLock(seatId);
    }

    //set status back to Available in MongoDB
    await Seat.updateMany(
        {_id:{$in:seatIds},lockedBy: req.user._id},
        {status:"Available",lockedBy:null,lockExpiresAt:null}
    );

    return res.status(200).json(new APIResponse(200,{},"Seats released successfully"));
});

export{getSeatMap,lockSeats,releaseSeats};
