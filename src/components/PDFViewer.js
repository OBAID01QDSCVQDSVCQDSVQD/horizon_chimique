'use client';
import { useRef, useEffect } from 'react';

export default function PDFViewer({ url }) {
    if (!url) return null;

    // Use our Proxy Stream API to load the file
    // This transforms: /uploads/catalogs/file.pdf -> /api/stream-pdf?url=/uploads/catalogs/file.pdf
    const proxyUrl = `/api/stream-pdf?url=${encodeURIComponent(url)}`;

    // Pass this proxy URL to the static viewer
    const viewerUrl = `/viewer.html?file=${encodeURIComponent(proxyUrl)}`;

    return (
        <div className="w-full h-[85vh] bg-slate-100 rounded-xl overflow-hidden shadow-md border border-slate-200">
            <iframe
                src={viewerUrl}
                className="w-full h-full border-0 block bg-white"
                title="Catalogue Viewer"
                allowFullScreen
            />
        </div>
    );
}
