import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import { emailQueue } from "./queues/emailQueue.js";
import connectDB from "./db/index.js";

async function testEmail() {
    try {
        await connectDB();
        console.log("Adding test email to queue...");
        
        await emailQueue.add("sendOTP", {
            email: process.env.TEST_EMAIL || "test@example.com", 
            subject: "IRCTC — Manual Test Email",
            message: "Hello! This is a manual test email from the IRCTC backend to verify the email worker is functioning correctly.",
        });
        
        console.log("Email added to queue. Check the worker logs to see if it processes successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

testEmail();
