import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

//s3client allows nodejs to communicate with s3
//putobjectcommand this represents the instruction to upload an object/file to s3
//getsignedurl is used to generate a secure download link that expires in 24 hours (86400 seconds)

//initialize s3 client using keys from .env 
const s3=new S3Client({
    region:process.env.AWS_REGION,
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY
    }
});

export const uploadPdfToS3=async(pdfBuffer,pnr)=>{
    const fileName=`tickets/ticket-${pnr}.pdf`;

    //prepare the upload command
    const command=new PutObjectCommand({
        Bucket:process.env.AWS_S3_BUCKET_NAME,
        Key:fileName,
        Body:pdfBuffer,
        ContentType:"application/pdf"
    });

    //upload to aws
    await s3.send(command);

    //generate a secure download link that expires in 24 hours (86400 seconds)
    const getCommand=new GetObjectCommand({Bucket:process.env.AWS_S3_BUCKET_NAME,Key:fileName});
    const downloadUrl=await getSignedUrl(s3,getCommand,{expiresIn:86400});

    return downloadUrl;
};
