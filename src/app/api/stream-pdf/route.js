import { NextResponse } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';

/**
 * Proxy PDF avec support Range (bytes) — nécessaire pour pdf.js en mode
 * disableAutoFetch : charge la première page sans tout télécharger.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');

  if (!fileUrl) {
    return new NextResponse('URL manquante', { status: 400 });
  }

  try {
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      const rangeHeader = request.headers.get('range');
      const upstreamHeaders = {};
      if (rangeHeader) {
        upstreamHeaders.Range = rangeHeader;
      }

      const fetchRes = await fetch(fileUrl, { headers: upstreamHeaders });

      if (!fetchRes.ok && fetchRes.status !== 206) {
        throw new Error(`Upstream ${fetchRes.status}`);
      }

      const headers = new Headers();
      const ct = fetchRes.headers.get('Content-Type');
      headers.set('Content-Type', ct && ct.includes('pdf') ? ct : 'application/pdf');

      const ar = fetchRes.headers.get('Accept-Ranges');
      headers.set('Accept-Ranges', ar || 'bytes');

      const cl = fetchRes.headers.get('Content-Length');
      if (cl) headers.set('Content-Length', cl);

      const cr = fetchRes.headers.get('Content-Range');
      if (cr) headers.set('Content-Range', cr);

      headers.set(
        'Cache-Control',
        fetchRes.status === 206
          ? 'public, max-age=300'
          : 'public, max-age=3600, stale-while-revalidate=86400'
      );

      return new NextResponse(fetchRes.body, {
        status: fetchRes.status,
        headers,
      });
    }

    const filename = fileUrl.split('/').pop();
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'catalogs', filename);
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': fileBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Erreur stream PDF:', error);
    return new NextResponse('Fichier introuvable', { status: 404 });
  }
}
