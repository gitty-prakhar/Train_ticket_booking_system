import PDFDocument from "pdfkit";   //pdfkit library allows use to 

//creates ticket
export const generateTicketPDF=async(bookingDetails)=>{
    return new Promise((resolve,reject)=>{
        const doc=new PDFDocument();
        const buffers=[];

        //every time a chunk of the PDF is drawn,save it to our array
        //this is like a loop 
        doc.on("data",(chunk)=>buffers.push(chunk));

        //when finished drawing,merge chunks into one final buffer
        doc.on("end",()=>resolve(Buffer.concat(buffers)));
        doc.on("error",reject);

        //draw the pdf
        doc.fontSize(25).text("IRCTC E-Ticket",{align:"center"});   //set font size 25 px and write IRCTC E-Ticket
        doc.moveDown(); //change line like endl
        doc.fontSize(16).text(`PNR Number: ${bookingDetails.pnr}`);
        doc.text(`Status: ${bookingDetails.status}`);
        doc.text(`Total Fare: Rs. ${bookingDetails.totalFare}`);
        doc.moveDown();
        doc.fontSize(12).text("Thank you for traveling with us!",{align:"center"});

        //tell pdfkit we are done drawing
        doc.end();
    });
};