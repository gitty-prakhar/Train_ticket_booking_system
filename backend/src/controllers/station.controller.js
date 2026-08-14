import { asyncHandler } from "../utils/asyncHandler.js";
import { Station } from "../models/station.model.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";

const createStation=asyncHandler(async(req,res)=>{
    const{name,code,city,state,zone}=req.body;

    if(!name||!code||!city||!state){
        throw new ApiError(400,"Name, code, city and state are required");
    }

    const existing=await Station.findOne({code:code.toUpperCase()});
    if(existing){
        throw new ApiError(409,`Station with code ${code.toUpperCase()} already exists`);
    }

    const station = await Station.create({name,code,city,state,zone});
    return res.status(201).json(
        new APIResponse(201,station,"Station created successfully")
    );
})


const getAllStations=asyncHandler(async(req,res)=>{
    const{search}=req.query;
    let filter={}
    //regex search  ($or) is used to search in multiple fields simultaneously
    if(search){
        filter={
            $or:[
                {
                    name:{
                        $regex:search,  //search for pattern matching
                        $options:"i",   //search case insensitive
                    },
                },
                {
                    code:{
                        $regex:search,
                        $options:"i",
                    },
                },
                {
                    city:{
                        $regex:search,
                        $options:"i",
                    },
                },
            ],
        };
    }   
    const stations=await Station.find(filter).sort({name:1});
    return res.status(200).json(
        new APIResponse(200,stations,"Stations fetched successfully")
    );
});

const getStationByCode = asyncHandler(async(req,res)=>{
    const station=await Station.findOne({code:req.params.code.toUpperCase()});
    if(!station){
        throw new ApiError(404,"Station not found");
    }
    return res.status(200).json(
        new APIResponse(200, station,"Station fetched successfully")
    );
});

const updateStation=asyncHandler(async(req,res)=>{
    const {name,city,state,zone}=req.body;
    const station=await Station.findByIdAndUpdate(
        req.params.id,
        {name,city,state,zone},
        {new:true,runValidators:true}
    );
    if(!station){
        throw new ApiError(404,"Station not found");
    }
    return res.status(200).json(
        new APIResponse(200,station,"Station updated successfully")
    );
});


const deleteStation = asyncHandler(async(req,res)=>{
    const station=await Station.findByIdAndDelete(req.params.id);
    if(!station){
        throw new ApiError(404,"Station not found");
    }
    return res.status(200).json(
        new APIResponse(200,{},"Station deleted successfully")
    );
});

export{createStation,getAllStations,getStationByCode,updateStation,deleteStation};