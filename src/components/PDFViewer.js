'use client';
import { useRef, useEffect } from 'react';

export default function PDFViewer({ url }) {
    if (!url) return null;

    // Optimize: Use direct URL if it's already an external link (MinIO/S3)
    // Only use proxy for local files or for CORS issues if they arise.
    const isExternal = url.startsWith('http://') || url.startsWith('https://');
    const pdfUrl = isExternal ? url : `/api/stream-pdf?url=${encodeURIComponent(url)}`;
    
    // Pass the optimized URL to the static viewer
    const viewerUrl = `/viewer.html?file=${encodeURIComponent(pdfUrl)}`;

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
