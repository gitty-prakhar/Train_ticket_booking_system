import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize the AWS Client using your .env keys
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

export const uploadPdfToS3 = async (pdfBuffer, pnr) => {
    const fileName = `tickets/ticket-${pnr}.pdf`;

    // 1. Prepare the Upload Command
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: pdfBuffer,
        ContentType: "application/pdf"
    });

    // 2. Upload to AWS
    await s3.send(command);

    // 3. Generate a secure download link that expires in 24 hours (86400 seconds)
    const getCommand = new PutObjectCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: fileName });
    const downloadUrl = await getSignedUrl(s3, getCommand, { expiresIn: 86400 });

    return downloadUrl;
};
