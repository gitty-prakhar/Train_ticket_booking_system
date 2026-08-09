import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({path: "./.env"});

const testEmail = async () => {
    try {
        console.log("Testing email credentials...");
        console.log("EMAIL_USER:", process.env.EMAIL_USER);
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("❌ Missing EMAIL_USER or EMAIL_PASS in .env file!");
            process.exit(1);
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        // Verify connection configuration
        await transporter.verify();
        console.log("✅ Server is ready to take our messages (Credentials are correct!)");

        console.log("Sending test email...");
        await transporter.sendMail({
            from: `IRCTC Test <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // send to yourself
            subject: "Test Email from IRCTC Backend",
            text: "If you are reading this, your email configuration is working perfectly!"
        });
        
        console.log("✅ Test email sent successfully! Check your inbox.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Email test failed!");
        console.error(error.message);
        if (error.message.includes("Application-specific password required")) {
            console.log("\n💡 FIX: You are using your normal Gmail password. You must generate an 'App Password' from your Google Account settings and use that in your .env file instead!");
        }
        process.exit(1);
    }
};

testEmail();
