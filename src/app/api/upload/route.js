import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/s3';
import { rateLimit } from '@/lib/ratelimit';

export async function POST(req) {
    try {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        
        // Rate limit: 10 uploads per 15 minutes
        const { success } = await rateLimit(`upload_${ip}`, 10, 900);
        if (!success) {
            return NextResponse.json({ success: false, error: "Trop d'uploads. Veuillez patienter 15 minutes." }, { status: 429 });
        }

        const data = await req.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate a unique filename
        const timestamp = Date.now();
        const originalName = file.name || 'upload';
        const extension = originalName.split('.').pop();
        const fileName = `uploads/${timestamp}-${Math.random().toString(36).substring(2, 7)}.${extension}`;

        // Upload to S3/MinIO
        const fileUrl = await uploadFile(buffer, fileName, file.type);

        return NextResponse.json({ success: true, url: fileUrl });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ success: false, error: "Upload failed: " + error.message }, { status: 500 });
    }
}
