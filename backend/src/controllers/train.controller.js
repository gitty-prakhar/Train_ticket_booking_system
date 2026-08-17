import { Train } from "../models/train.model.js";
import { Route } from "../models/route.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";

const createTrain=asyncHandler(async(req,res)=>{
    const{trainNumber,trainName,trainType,runningDays,stops}=req.body;
    if(!trainNumber||!trainName||!trainType||!stops||stops.length<2){
        throw new ApiError(400,"All fields required. At least 2 stops needed.");
    }

    const existing=await Train.findOne({trainNumber});
    if(existing){
        throw new ApiError(409,`Train ${trainNumber} already exists`);
    }

    const train=await Train.create({trainNumber,trainName,trainType,runningDays:runningDays||[]});

    //sort the stops by stopNumber
    const sortedStops=stops.sort((a,b)=>a.stopNumber-b.stopNumber);

    //create the route
    const route=await Route.create({trainId:train._id,stops:sortedStops});
    
    return res.status(201).json(new APIResponse(201,{train,route},"Train created successfully"));
})

const getAllTrains=asyncHandler(async(req,res)=>{
    const trains=await Train.find({isActive:true}).sort({trainNumber:1});
    return res.status(200).json(new APIResponse(200,trains,"Trains fetched successfully"));
});

const getTrainById=asyncHandler(async(req,res)=>{
    const{id}=req.params;
    const train=await Train.findById(id);
    if(!train){
        throw new ApiError(404,"Train not found");
    }
    const route=await Route.findOne({trainId:train._id }).populate("stops.stationId","name code city");
    return res.status(200).json(new APIResponse(200,{train,route},"Train fetched successfully"));
});


//update train
const updateTrain=asyncHandler(async(req,res)=>{
    const{trainName,trainType,runningDays,isActive}=req.body;
    const train=await Train.findByIdAndUpdate(req.params.id,
        {trainName,trainType,runningDays,isActive},
        {new:true,runValidators:true}
        //new:true means return the updated document instead of the old one
    );
    if(!train){
        throw new ApiError(404,"Train not found");
    }
    return res.status(200).json(new APIResponse(200,train,"Train updated successfully"));
});

//DELETE train and its route
const deleteTrain=asyncHandler(async(req,res)=>{
    const{id}=req.params;
    const train=await Train.findById(id);
    if(!train){
        throw new ApiError(404,"Train not found");
    }
    await Route.findOneAndDelete({trainId:train._id});
    await Train.findByIdAndDelete(req.params.id);
    return res.status(200).json(new APIResponse(200,{},"Train deleted successfully"));
});

export{createTrain,getAllTrains,getTrainById,updateTrain,deleteTrain};
