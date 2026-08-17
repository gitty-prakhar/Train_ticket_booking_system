import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { Payment } from "../models/payment.model.js";
import { Booking } from "../models/booking.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";

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

    const keyId=process.env.RAZORPAY_KEY_ID;
    const keySecret=process.env.RAZORPAY_KEY_SECRET;

    // Create fresh Razorpay instance with current env vars
    const razorpayInstance=new Razorpay({
        key_id:keyId,
        key_secret:keySecret,
    });

    //create order on razorpay
    const order=await razorpayInstance.orders.create({
        amount:booking.totalFare*100,   //razorpay expects amount in paise
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
                currency:order.currency,
                pnr:booking.pnr,
                keyId:keyId
            },
            "Razorpay order created"
        )
    );
});


//verify payment
const verifyPayment=asyncHandler(async(req,res)=>{
    const{razorpay_order_id,razorpay_payment_id,razorpay_signature,bookingId}=req.body;
    //check required fields
    if(!razorpay_order_id||!razorpay_payment_id||!razorpay_signature){
        throw new ApiError(400,"Payment details are required");
    }

    //find booking
    const booking=await Booking.findById(bookingId);
    if(!booking){
        throw new ApiError(404,"Booking not found");
    }




    //generate signature
    const body=razorpay_order_id+"|"+razorpay_payment_id;
    const expectedSignature=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");

    //verify signature
    if(expectedSignature!==razorpay_signature){
        throw new ApiError(400,"Payment verification failed. Invalid signature.");
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
                pnr:booking.pnr
            },
            "Payment successful! Booking confirmed."
        )
    );
});

/*
 * PAYMENT VERIFICATION FLOW:
 *
 * 1. Backend creates an order on Razorpay.
 *    Razorpay returns an Order ID.
 *
 * 2. User completes the payment through Razorpay Checkout.
 *
 * 3. After successful payment, Razorpay provides:
 *       - razorpay_order_id
 *       - razorpay_payment_id
 *       - razorpay_signature
 *
 * 4. Razorpay Checkout sends these details to the frontend.
 *
 * 5. The frontend sends these details to our backend
 *    through the verify-payment API.
 *
 * 6. The backend receives the details in req.body.
 *
 * 7. Backend creates its own expected signature using:
 *       Order ID + "|" + Payment ID + Razorpay Secret Key
 *       → HMAC-SHA256
 *       → Expected Signature
 *
 * 8. Backend compares:
 *
 *       Razorpay Signature
 *                VS
 *       Expected Signature
 *
 *    If both are the same:
 *       → Payment is genuine and verification succeeds.
 *
 *    If they are different:
 *       → Payment verification fails.
 *
 * 9. After successful verification, the backend updates
 *    the Payment document in MongoDB:
 *
 *       status             → "Completed"
 *       gatewayPaymentId  → Razorpay Payment ID
 *       gatewaySignature  → Razorpay Signature
 *
 * 10. Finally, the backend sends the booking's PNR
 *     and a payment-success response to the frontend.
 *
 *
 * COMPLETE FLOW:
 *
 * User
 *   ↓
 * Razorpay Checkout
 *   ↓
 * Payment Successful
 *   ↓
 * Razorpay
 *   ↓
 * order_id + payment_id + signature
 *   ↓
 * Frontend
 *   ↓
 * Backend /verify-payment
 *   ↓
 * Generate Expected Signature
 *   ↓
 * Compare Signatures
 *   ↓
 * Payment Verified
 *   ↓
 * Update Payment in MongoDB
 *   ↓
 * Return Success + PNR
 */


//get my payments
const getMyPayments=asyncHandler(async(req,res)=>{
    //fetch payments
    const payments=await Payment.find({userId:req.user._id}).populate("bookingId","pnr travelDate totalFare status").sort({createdAt:-1});
    return res.status(200).json(new APIResponse(200,payments,"Payments fetched successfully"));
});

export{createOrder,verifyPayment,getMyPayments};