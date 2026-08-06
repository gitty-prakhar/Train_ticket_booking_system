import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Station } from "../models/station.model.js";
import { Route } from "../models/route.model.js";
import { Schedule } from "../models/schedule.model.js";
import { Coach } from "../models/coach.model.js";
import { calculateFare } from "../utils/fareCalculator.js";
import { getDistanceBetweenStops } from "../utils/fareCalculator.js";

//get data from url /api/v1/search?from=NDLS&to=BCT&date=2026-08-10
const searchTrains=asyncHandler(async(req,res)=>{
    const {from,to,date}=req.query;
    if(!from||!to||!date){
        throw new ApiError(400,"from, to, and date are required");
    }

    if(from.toUpperCase()===to.toUpperCase()){
        throw new ApiError(400,"Source and destination cannot be same");
    }

    const fromStation=await Station.findOne({code:from.toUpperCase()});
    const toStation=await Station.findOne({code:to.toUpperCase()});

    if(!fromStation)throw new ApiError(404,`Station ${from.toUpperCase()} not found`);
    if(!toStation)throw new ApiError(404,`Station ${to.toUpperCase()} not found`);

    const routes=await Route.find({"stops.stationId":{$all:[fromStation._id,toStation._id]}}).populate("stops.stationId", "name code");
    //all means array must contain all values listed here

    if(routes.length===0){
        return res.status(200).json(new APIResponse(200,[],"No direct trains found"));
    }

    const validRoutes=routes.filter((route)=>{
        const fromStop=route.stops.find((s)=>s.stationId._id.toString()===fromStation._id.toString());
        const toStop=route.stops.find((s)=>s.stationId._id.toString()===toStation._id.toString());
        return fromStop && toStop && fromStop.stopNumber<toStop.stopNumber;
    });


    if(validRoutesroutes.length===0){
        return res.status(200).json(new APIResponse(200,[],"No direct trains found"));
    }


    const journeyDate=new Date(date);
    const nextDay=new Date(date);
    nextDay.setDate(nextDay.getDate()+1);
    const trainIds=validRoutes.map((r)=>r.trainId);
    const schedules=await Schedule.find({
        trainId:{$in:trainIds},
        journeyDate:{$gte:journeyDate,$lt:nextDay},
        status:{$ne:"Cancelled"},
    }).populate("trainId","trainNumber trainName trainType");
    if(schedules.length===0){
        return res.status(200).json(new APIResponse(200,[],`No trains available on ${date}`));
    }


    const results=[];
    for(const schedule of schedules){
        //find the route for this train
        const route=validRoutes.find((r)=>r.trainId.toString()===schedule.trainId._id.toString());
        // get distance between the two stations
        let distanceKm=0;
        try{
            distanceKm=getDistanceBetweenStops(
                route.stops,
                fromStation._id,
                toStation._id
            );
        }
        catch(e){
            distanceKm=0;
        }
        //get stop info for timing display
        const fromStop=route.stops.find((s)=>s.stationId._id.toString()===fromStation._id.toString());
        const toStop=route.stops.find((s)=>s.stationId._id.toString()===toStation._id.toString());
        //get coaches with seat availability
        const coaches=await Coach.find({scheduleId:schedule._id});
        //group by class and sum up seats across all coaches of same type
        const classMap = {};
        for(const coach of coaches){
            if (!classMap[coach.coachType]){
                classMap[coach.coachType]={
                    coachType:coach.coachType,
                    availableSeats:0,
                    totalSeats:0,
                    farePerPerson:distanceKm
                        ? calculateFare(distanceKm, coach.coachType)
                        :0,
                };
            }
            classMap[coach.coachType].availableSeats+=coach.availableSeats;
            classMap[coach.coachType].totalSeats+=coach.totalSeats;
        }
        results.push({
            scheduleId:schedule._id,
            train:schedule.trainId,
            journeyDate:schedule.journeyDate,
            status:schedule.status,
            fromStation:{
                name:fromStation.name,
                code:fromStation.code,
                departureTime:fromStop.departureTime,
            },
            toStation:{
                name:toStation.name,
                code:toStation.code,
                arrivalTime:toStop.arrivalTime,
            },
            distanceKm,
            availability:Object.values(classMap),
        });
    }
    return res.status(200).json(new APIResponse(200,results,`${results.length} train(s) found`));
})

export{searchTrains};