import { Train } from "../models/train.model.js";
import { Route } from "../models/route.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

const createTrain=asyncHandler(async(req,res)=>{
    const {trainNumber,trainName,trainType,runningDays,stops}=req.body;
    if (!trainNumber || !trainName || !trainType || !stops || stops.length<2){
        throw new ApiError(400, "All fields required. At least 2 stops needed.");
    }

    const existing=await Train.findOne({trainNumber});
    if(existing){
        throw new ApiError(409,`Train ${trainNumber} already exists`);
    }

    const train = await Train.create({
        trainNumber,
        trainName,
        trainType,
        runningDays:runningDays||[],
    });

    const sortedStops = stops.sort((a,b)=>a.stopNumber-b.stopNumber);
    const route = await Route.create({
        trainId:train._id,
        stops:sortedStops,
    });
    
    return res.status(201).json(
        new APIResponse(201, { train, route }, "Train created successfully")
    );
})
