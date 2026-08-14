import PDFDocument from "pdfkit";

export const generateTicketPDF = async (bookingDetails) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers = [];

        // Every time a chunk of the PDF is drawn, save it to our array
        doc.on("data", (chunk) => buffers.push(chunk));

        // When finished drawing, merge chunks into one final Buffer
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        // --- DRAW THE PDF ---
        doc.fontSize(25).text("IRCTC E-Ticket", { align: "center" });
        doc.moveDown();
        doc.fontSize(16).text(`PNR Number: ${bookingDetails.pnr}`);
        doc.text(`Status: ${bookingDetails.status}`);
        doc.text(`Total Fare: Rs. ${bookingDetails.totalFare}`);
        doc.moveDown();
        doc.fontSize(12).text("Thank you for traveling with us!", { align: "center" });

        // Tell PDFKit we are done drawing
        doc.end();
    });
};