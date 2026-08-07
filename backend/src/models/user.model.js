import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema=new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false,
        },
        phone: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            enum: ["passenger", "agent", "admin"],
            default: "passenger",
        },
        wallet: {
            type: Number,
            default: 0,
        },
        // user can use this money to book tickets also they can add funds to it

        forgotPasswordOtp: {
            type: String,
        },
        forgotPasswordOtpExpiry: {
            type: Date,
        },
        //for reset password 

        refreshToken:{
            type: String,
            select: false,
        },
    },
    { timestamps: true }
);

userSchema.pre("save",async function(next){
    if(!this.isModified("password"))return next();
    this.password=await bcrypt.hash(this.password,10);
});

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const User = mongoose.model("User", userSchema);
