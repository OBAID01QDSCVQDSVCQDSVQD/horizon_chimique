import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/s3';

export async function POST(request) {
    try {
        const data = await request.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename and add path prefix
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `catalogs/${Date.now()}-${safeName}`;

        // Upload to MinIO
        const fileUrl = await uploadFile(buffer, fileName, 'application/pdf');

        return NextResponse.json({
            success: true,
            url: fileUrl
        });
    } catch (error) {
        console.error("PDF Upload Error:", error);
        return NextResponse.json({ success: false, error: "Upload failed: " + error.message }, { status: 500 });
    }
}

