import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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
        // Remove ACL: 'public-read' as imgproxy will access via S3 keys internally
        // or keep if direct access is still needed. We'll leave it for direct fallback.
        ACL: 'public-read',
    });

    await s3Client.send(command);

    const publicUrl = `https://${process.env.MINIO_ENDPOINT}/${bucketName}/${fileName}`;

    // If it's an image, return the imgproxy URL encoded in Base64
    if (contentType.startsWith('image/')) {
        // Base64 encode the public direct URL for imgproxy
        const b64Url = Buffer.from(publicUrl).toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
            
        return `https://imgproxy.sdkbatiment.com/insecure/${b64Url}.webp`;
    }

    // For other files (PDFs), return the direct MinIO URL
    return publicUrl;
}


export default s3Client;

