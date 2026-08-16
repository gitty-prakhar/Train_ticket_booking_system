import nodemailer from "nodemailer";

//email sender function that receives an object as parameter
export const sendEmail=async({email,subject,message})=>{
    //configure nodemailer
    //create transport function is used to send mail
    const transporter=nodemailer.createTransport({
        service:"gmail",    //smtp service is gmail,we can also use other services like yahoo,hotmail,outlook
        auth:{              //check authorization for smtp service used.
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS,
        }
    });

    //create mail options object that contains all the details of the mail like from,to,subject,text
    //process.env.EMAIL_USER is the email address of the sender
    //email is the email address of the receiver
    //subject is the subject of the mail
    //text is the message of the mail
    const mailOptions={
        from:`IRCTC <${process.env.EMAIL_USER}>`,
        to:email,
        subject,
        text:message
    };


    //send mail function that sends the mail to the receiver with all the details
    await transporter.sendMail(mailOptions);
}