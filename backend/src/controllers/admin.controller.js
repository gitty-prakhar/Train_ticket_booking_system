import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Booking } from "../models/booking.model.js";
import { Train } from "../models/train.model.js";
import { Payment } from "../models/payment.model.js";

// GET dashboard statistics
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
    const totalPayments=await Payment.aggregate([
        {
            $match:{
                status:"Completed"
            }
        },
        {
            $group:{
                _id:null,
                totalRevenue:{
                    $sum:"$amount"
                }
            }
        }
    ]);
    //convert paise to rupees
    let totalRevenue=0;
    if(totalPayments.length>0){
        totalRevenue=totalPayments[0].totalRevenue/100;
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
    //if status is provided filter bookings
    if(status){
        filter.status=status;
    }
    //pagination
    const skip=(Number(page)-1)*Number(limit);
    //fetch bookings
    const bookings=await Booking.find(filter)
        .populate("userId","username email")
        .populate("boardingStationId","name code")
        .populate("destinationStationId","name code")
        .sort({createdAt:-1})
        .skip(skip)
        .limit(Number(limit));

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
        .select("-password -refreshToken")
        .sort({createdAt:-1})
        .skip(skip)
        .limit(Number(limit));
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