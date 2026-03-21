import { NextResponse } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
        return new NextResponse('URL manquante', { status: 400 });
    }

    // Extract filename from the URL (e.g. /uploads/catalogs/filename.pdf)
    const filename = fileUrl.split('/').pop();

    // Construct local filesystem path
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'catalogs', filename);

    try {
        // Read file directly from disk
        const fileBuffer = await readFile(filePath);

        // Return with proper headers ensuring NO CACHE
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
    } catch (error) {
        console.error("Erreur lecture PDF:", error);
        return new NextResponse('Fichier introuvable', { status: 404 });
    }
}
