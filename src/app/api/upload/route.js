import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/s3';

export async function POST(request) {
    try {
        const data = await request.formData();
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

        // Upload to MinIO
        const fileUrl = await uploadFile(buffer, fileName, file.type);

        return NextResponse.json({ success: true, url: fileUrl });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ success: false, error: "Upload failed: " + error.message }, { status: 500 });
    }
}
