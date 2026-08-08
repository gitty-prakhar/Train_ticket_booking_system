import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Payment } from "../models/payment.model.js";
import { Booking } from "../models/booking.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";

//razorpay instance to use the functions
const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID || "dummy_key_id",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret",
});

//create razorpay order
const createOrder=asyncHandler(async(req,res)=>{
    const{bookingId}=req.body;
    //find booking
    const booking=await Booking.findById(bookingId);

    if(!booking){
        throw new ApiError(404,"Booking not found");
    }
    //check booking owner
    if(booking.userId.toString()!==req.user._id.toString()){
        throw new ApiError(403,"This is not your booking");
    }
    //create order on razorpay
    const order=await razorpay.orders.create({
        amount:booking.totalFare * 100,
        currency:"INR",
        receipt:booking.pnr
    });

    //save order id
    await Payment.findByIdAndUpdate(
        booking.paymentId,
        {
            gatewayOrderId:order.id
        }
    );

    return res.status(200).json(
        new APIResponse(
            200,
            {
                orderId:order.id,
                amount:order.amount,
                currency: order.currency,
                pnr:booking.pnr,
                keyId:process.env.RAZORPAY_KEY_ID
            },
            "Razorpay order created"
        )
    );
});

//verify payment
const verifyPayment=asyncHandler(async(req,res)=>{
    const{razorpay_order_id,razorpay_payment_id,razorpay_signature,bookingId}=req.body;
    //check required fields
    if (!razorpay_order_id||!razorpay_payment_id ||!razorpay_signature){
        throw new ApiError(400, "Payment details are required");
    }
    //generate signature
    const body=razorpay_order_id+"|"+razorpay_payment_id;
    const expectedSignature=crypto
        .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    //verify signature
    if (expectedSignature!==razorpay_signature) {
        throw new ApiError(400,"Payment verification failed. Invalid signature.");
    }
    //find booking
    const booking=await Booking.findById(bookingId);
    if(!booking){
        throw new ApiError(404,"Booking not found");
    }
    //update payment
    await Payment.findByIdAndUpdate(
        booking.paymentId,
        {
            gatewayPaymentId:razorpay_payment_id,
            gatewaySignature:razorpay_signature,
            status:"Completed",
            method:"Unknown"
        }
    );
    return res.status(200).json(new APIResponse(200,
            {
                pnr: booking.pnr
            },
            "Payment successful! Booking confirmed."
        )
    );
});

//get my payments
const getMyPayments=asyncHandler(async(req,res)=>{
    //fetch payments
    const payments=await Payment.find({userId:req.user._id}).populate("bookingId","pnr travelDate totalFare status").sort({createdAt:-1});
    return res.status(200).json(new APIResponse(200,payments,"Payments fetched successfully"));
});

export{createOrder,verifyPayment,getMyPayments};