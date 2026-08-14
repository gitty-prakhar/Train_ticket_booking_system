import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Booking } from "../models/booking.model.js";
import { Train } from "../models/train.model.js";
import { Payment } from "../models/payment.model.js";

//get dashboard statistics
const getDashboardStats=asyncHandler(async(req,res)=>{
    //count total users
    //countDocuments() count the total users in db
    const totalUsers=await User.countDocuments();
    //count active trains

    //countDocuments({isActive:true}) counts the total users in db who are active
    const totalTrains=await Train.countDocuments({
        isActive:true
    });
    //count all bookings
    const totalBookings=await Booking.countDocuments();
    //count confirmed bookings
    const confirmedBookings=await Booking.countDocuments({
        status:"Confirmed"
    });
    //count cancelled bookings
    const cancelledBookings=await Booking.countDocuments({
        status:"Cancelled"
    });
    //calculate total revenue
    //this is mongodb aggregation pipelines
    //it returns array
    const totalPayments=await Payment.aggregate([
        {
            $match:{
                status:"Completed"
            }
        },
        //$match is a mongodb filter
        //it will pass only completed payments in the pipeline
        {
            $group:{
                _id:null,
                totalRevenue:{
                    $sum:"$amount"
                }
            }
        }
        //and all that completed payemnts keep them in a group and add their values
    ]);
    //convert paise to rupees
    let totalRevenue=0;
    if(totalPayments.length>0){
        totalRevenue=totalPayments[0].totalRevenue/100;
        //there is only one object in the array
    }
    return res.status(200).json(
        new APIResponse(
            200,
            {
                totalUsers,
                totalTrains,
                totalBookings,
                confirmedBookings,
                cancelledBookings,
                totalRevenue:`₹${totalRevenue}`
            },
            "Dashboard stats fetched"
        )
    );
});

const getAllBookings=asyncHandler(async(req,res)=>{
    const{status,page=1,limit=20}=req.query;
    const filter={};
    //initially filter object is empty so it there is no filter so fetch all the bookings
    //if status is provided filter bookings

    if(status){
        filter.status=status;
        //if there is any filter then fetch all the bookings regarding the filter given
    }

    //pagination
    const skip=(Number(page)-1)*Number(limit);
    //fetch bookings
    const bookings=await Booking.find(filter)
        .populate("userId","username email")         //this will show only username and email of user
        .populate("boardingStationId","name code")      //this will show only name and code of boarding station
        .populate("destinationStationId","name code")   //this will show only name and code of destination station
        .sort({createdAt:-1})                           //sort in descending order
        .skip(skip)                                     //skip the documents
        .limit(Number(limit));                          //limit the documents

    //count total bookings
    const total=await Booking.countDocuments(filter);

    //return response
    return res.status(200).json(
        new APIResponse(
            200,
            {
                bookings,
                total,
                page:Number(page),
                totalPages:Math.ceil(total/Number(limit))
            },
            "All bookings fetched"
        )
    );
});

const getAllUsers=asyncHandler(async(req,res)=>{
    //read query parameters
    const{page=1,limit=20}=req.query;
    //pagination
    const skip=(Number(page)-1)*Number(limit);
    //fetch users
    const users=await User.find()
        .select("-password -refreshToken")   //this will show only username and email of user
        .sort({createdAt:-1})                   //sort in descending order
        .skip(skip)                             //skip the documents
        .limit(Number(limit));                  //limit the documents
    //count total users
    const total=await User.countDocuments();
    //return response
    return res.status(200).json(
        new APIResponse(
            200,
            {
                users,
                total,
                page:Number(page),
                totalPages:Math.ceil(total/Number(limit))
            },
            "All users fetched"
        )
    );
});
export{getDashboardStats,getAllBookings,getAllUsers};