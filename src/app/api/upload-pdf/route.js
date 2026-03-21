import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
    try {
        const data = await request.formData();
        const file = data.get('file');

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads dir exists
        const uploadDir = path.join(process.cwd(), 'public/uploads/catalogs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Sanitize filename
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = Date.now() + '-' + safeName;
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // Return public URL
        const publicUrl = `/uploads/catalogs/${filename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl
        });
    } catch (error) {
        console.error("PDF Upload Error:", error);
        return NextResponse.json({ success: false, error: "Upload failed: " + error.message }, { status: 500 });
    }
}
