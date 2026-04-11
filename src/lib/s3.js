import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    endpoint: `https://${process.env.MINIO_ENDPOINT}`,
    region: "us-east-1", // MinIO doesn't care much about region, but SDK requires it
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
    },
    forcePathStyle: true, // Required for MinIO
});

export async function uploadFile(buffer, fileName, contentType) {
    const bucketName = process.env.MINIO_BUCKET || "horizon-chimique";
    
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read', // We want the files to be publicly accessible
    });

    await s3Client.send(command);

    // Construct the public URL
    // Format: https://storage.sdkbatiment.com/bucket-name/file-name
    return `https://${process.env.MINIO_ENDPOINT}/${bucketName}/${fileName}`;
}

export default s3Client;
