import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Schedule } from "../models/schedule.model.js";
import { Train } from "../models/train.model.js";
import { Route } from "../models/route.model.js";
import { Coach } from "../models/coach.model.js";
import { Seat } from "../models/seat.model.js";

//how many coaches and seats per train type
const COACH_CONFIG={
    Rajdhani:[{coachType:"1A",count:2,seats:18},{coachType:"2A",count:4,seats:46},{coachType:"3A",count:8,seats:64}],
    Shatabdi:[{coachType:"CC",count:16,seats:78},{coachType:"1A",count:2,seats:18}],
    Express:[{coachType:"SL",count:8,seats:72},{coachType:"3A",count:4,seats:64},{coachType:"2A",count:2,seats:46},{coachType:"GEN",count:2,seats:90}],
    Superfast:[{coachType:"SL",count:10,seats:72},{coachType:"3A",count:5,seats:64},{coachType:"2A",count:2,seats:46},{coachType:"GEN",count:2,seats:90}],
    VandeBharat:[{coachType:"CC",count:14,seats:78},{coachType:"1A",count:2,seats:56}],
    Passenger:[{coachType:"SL",count:4,seats:72},{coachType:"GEN",count:6,seats:90}],
};

//berth type pattern per class
const BERTH_PATTERN={
    SL:["Lower","Middle","Upper","Lower","Middle","Upper","Side-Lower","Side-Upper"],
    "3A":["Lower","Middle","Upper","Lower","Middle","Upper","Side-Lower","Side-Upper"],
    "2A":["Lower","Upper","Lower","Upper","Side-Lower","Side-Upper"],
    "1A":["Lower","Upper"],
    CC:["Seat"],
    GEN:["None"],
};

//create schedule auto creates all coaches and seats
const createSchedule=asyncHandler(async(req,res)=>{
    const{trainId,journeyDate}=req.body;

    if(!trainId||!journeyDate){
        throw new ApiError(400,"trainId and journeyDate are required");
    }

    const train=await Train.findById(trainId);
    if(!train)throw new ApiError(404,"Train not found");

    const route=await Route.findOne({trainId});
    if(!route)throw new ApiError(404,"Route not found for this train");

    //check if schedule already exists
    const existing=await Schedule.findOne({trainId,journeyDate:new Date(journeyDate)});
    if(existing){
        throw new ApiError(409,"Schedule already exists for this train on this date");
    }

    //create schedule
    const schedule=await Schedule.create({
        trainId,
        routeId:route._id,
        journeyDate:new Date(journeyDate),
    });

    //create coaches and seats for this schedule
    const configs=COACH_CONFIG[train.trainType]||COACH_CONFIG["Express"];
    let totalCoaches=0;
    let totalSeats=0;

    for(const config of configs){
        for(let i=1;i<=config.count;i++){
            const coachNumber=`${config.coachType.replace("A","")}${i}`;

            const coach=await Coach.create({
                scheduleId:schedule._id,
                coachNumber,
                coachType:config.coachType,
                totalSeats:config.seats,
                availableSeats:config.seats,
            });

            //create seats for this coach
            const pattern=BERTH_PATTERN[config.coachType]||["None"];
            const seatsToInsert=[];

            for(let s=1;s<=config.seats;s++){
                seatsToInsert.push({
                    scheduleId:schedule._id,
                    coachId:coach._id,
                    seatNumber:String(s),
                    berthType:pattern[(s-1)%pattern.length],
                    status:"Available",
                });
            }

            await Seat.insertMany(seatsToInsert);
            totalCoaches++;
            totalSeats+=config.seats;
        }
    }

    return res.status(201).json(
        new APIResponse(201,{schedule,totalCoaches,totalSeats},
            `Schedule created with ${totalCoaches} coaches and ${totalSeats} seats`)
    );
});

//get schedule by id
const getScheduleById=asyncHandler(async(req,res)=>{
    const schedule=await Schedule.findById(req.params.id)
        .populate("trainId","trainNumber trainName trainType")
        .populate({path:"routeId",populate:{path:"stops.stationId",select:"name code city"}});

    if(!schedule) throw new ApiError(404,"Schedule not found");

    const coaches=await Coach.find({scheduleId:req.params.id})
        .select("coachNumber coachType totalSeats availableSeats waitlistCount");

    return res.status(200).json(
        new APIResponse(200,{schedule,coaches},"Schedule fetched successfully")
    );
});

//get all schedules for a train
const getSchedulesByTrain=asyncHandler(async(req,res)=>{
    const schedules=await Schedule.find({trainId:req.params.trainId})
        .populate("trainId","trainNumber trainName")
        .sort({journeyDate:1});

    return res.status(200).json(
        new APIResponse(200,schedules,"Schedules fetched successfully")
    );
});

//update schedule status
const updateScheduleStatus=asyncHandler(async(req,res)=>{
    const{status,currentDelayMinutes}=req.body;

    const schedule=await Schedule.findByIdAndUpdate(
        req.params.id,
        {status,currentDelayMinutes:currentDelayMinutes||0},
        {new:true}
    );

    if(!schedule)throw new ApiError(404,"Schedule not found");

    return res.status(200).json(
        new APIResponse(200,schedule,"Schedule status updated")
    );
});

export{createSchedule,getScheduleById,getSchedulesByTrain,updateScheduleStatus};
