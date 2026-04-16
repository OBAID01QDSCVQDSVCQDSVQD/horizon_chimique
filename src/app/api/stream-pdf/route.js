import { NextResponse } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
        return new NextResponse('URL manquante', { status: 400 });
    }

    try {
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
            // Proxy external (e.g. MinIO S3) URLs
            const fetchRes = await fetch(fileUrl);
            if (!fetchRes.ok) throw new Error("Failed to fetch PDF from MinIO/S3");
            
            return new NextResponse(fetchRes.body, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Length': fetchRes.headers.get('Content-Length'),
                    'Cache-Control': 'public, max-age=31536000, immutable',
                }
            });
        } else {
            // Fallback for local files (Old behavior)
            const filename = fileUrl.split('/').pop();
            const filePath = path.join(process.cwd(), 'public', 'uploads', 'catalogs', filename);
            const fileBuffer = await readFile(filePath);

            return new NextResponse(fileBuffer, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Length': fileBuffer.length.toString(),
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            });
        }
    } catch (error) {
        console.error("Erreur lecture PDF:", error);
        return new NextResponse('Fichier introuvable', { status: 404 });
    }
}
