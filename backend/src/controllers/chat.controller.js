import { GoogleGenerativeAI } from "@google/generative-ai"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";

const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const handleChat=asyncHandler(async(req,res)=>{
    const{message,history}=req.body;

    if(!message){
        throw new ApiError(400,"Message is required\n");
    }

    const model=genAI.getGenerativeModel({model:"gemini-1.5-flash"})
    
    const systemInstruction=`You are a helpful AI assistant for the 'IRCTC Pro' train booking website. 
    Keep your answers concise, polite, and directly related to train travel in India. 
    If a user asks how to book a ticket, guide them to log in, search for a train, and click 'Book'.`;


    //try block for the 
    try{
        //setting up the chat with the model and history (previous messages)
        const chat=model.startChat({
            history:history||[],
            systemInstruction:{parts:[{text:systemInstruction}]},
        });
        //sending the message to the model
        const result=await chat.sendMessage(message);
        //get the response from the model
        const responseText=result.response.text();
        //returning the response to the client
        return res.status(200).json(
            new APIResponse(200,{reply:responseText},"Success")
        );
    }
    //catch block for the error
    catch(error){
        //logging the error
        console.error("Gemini API Error:",error);
        //throwing the error
        throw new ApiError(500,"Failed to generate AI response.");
    }
});