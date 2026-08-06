import nodemailer from "nodemailer";

const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS,
    }
});

export const sendEmail=async({email,subject,message})=>{
    const mailOptions={
        from:`IRCTC <${process.env.EMAIL_USER}>`,
        to:email,
        subject,
        text:message
    };

    await transporter.sendMail(mailOptions);
}