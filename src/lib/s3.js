import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getImageUrl } from './imgproxy';

const s3Client = new S3Client({
    endpoint: `https://${process.env.MINIO_ENDPOINT}`,
    region: "us-east-1",
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
    },
    forcePathStyle: true,
});

export async function uploadFile(buffer, fileName, contentType) {
    const bucketName = process.env.MINIO_BUCKET || "horizon-chimique";
    
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read',
    });

    await s3Client.send(command);

    // If it's an image, return the optimized imgproxy URL
    if (contentType.startsWith('image/')) {
        // Return optimized URL from MinIO path
        return getImageUrl(fileName);
    }

    // For other files (PDFs), return the direct MinIO URL
    return `https://${process.env.MINIO_ENDPOINT}/${bucketName}/${fileName}`;
}



export default s3Client;

