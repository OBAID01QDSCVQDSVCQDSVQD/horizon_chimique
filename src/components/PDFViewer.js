'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';

function resolvePdfSrc(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/stream-pdf?url=${encodeURIComponent(url)}`;
  }
  if (url.startsWith('/')) return url;
  return `/api/stream-pdf?url=${encodeURIComponent(url)}`;
}

export default function PDFViewer({ url }) {
  const [numPages, setNumPages] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [err, setErr] = useState(null);
  const [width, setWidth] = useState(360);
  const touchStartX = useRef(null);

  const pdfSrc = resolvePdfSrc(url);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  useEffect(() => {
    const update = () => {
      if (typeof window === 'undefined') return;
      const w = Math.min(920, Math.max(280, window.innerWidth - 32));
      setWidth(w);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n);
    setLoadingDoc(false);
    setPage(1);
    setErr(null);
  }, []);

  const onDocumentLoadError = useCallback((e) => {
    console.error('PDF document load error:', e);
    setErr(e?.message || 'Impossible de charger le catalogue');
    setLoadingDoc(false);
  }, []);

  const goPrev = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const goNext = useCallback(() => {
    setPage((p) => (numPages ? Math.min(numPages, p + 1) : p + 1));
  }, [numPages]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    touchStartX.current = null;
    if (Math.abs(dx) < 48) return;
    if (dx > 0) goNext();
    else goPrev();
  };

  if (!url || !pdfSrc) return null;

  const openUrl = url.startsWith('http') ? url : pdfSrc;

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-sm text-slate-600">
          Lecture <strong>page par page</strong> — chargement optimisé (une page à la fois sur mobile).
        </p>
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="w-4 h-4" />
          Ouvrir / télécharger le PDF
        </a>
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {err}
          <div className="mt-2">
            <a href={openUrl} className="font-bold underline" target="_blank" rel="noopener noreferrer">
              Ouvrir le fichier directement
            </a>
          </div>
        </div>
      )}

      <div
        className="relative rounded-2xl border border-slate-200 bg-slate-100 shadow-inner overflow-hidden min-h-[55vh] md:min-h-[65vh]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {loadingDoc && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
            <p className="text-slate-600 font-medium text-sm px-4 text-center">
              Chargement du catalogue (métadonnées)…
            </p>
          </div>
        )}

        <div className="flex justify-center py-4 px-2 overflow-x-auto">
          <Document
            file={pdfSrc}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            options={{
              disableAutoFetch: true,
              disableStream: false,
              rangeChunkSize: 65536,
            }}
            className="flex flex-col items-center"
          >
            <Page
              pageNumber={page}
              width={width}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-lg bg-white"
              loading={
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              }
            />
          </Document>
        </div>

      </div>

      {numPages != null && numPages > 0 && (
        <div className="sticky bottom-0 z-30 flex flex-col items-center gap-3 pb-2 pt-2 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
          <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            <button
              type="button"
              onClick={goPrev}
              disabled={page <= 1}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-white font-bold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 min-h-[48px] min-w-[48px] touch-manipulation"
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="hidden sm:inline">Précédent</span>
            </button>

            <div className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-800 shadow border border-slate-200 tabular-nums min-w-[8rem] text-center">
              Page {page} / {numPages}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={page >= numPages}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-white font-bold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 min-h-[48px] min-w-[48px] touch-manipulation"
              aria-label="Page suivante"
            >
              <span className="hidden sm:inline">Suivant</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          <p className="text-xs text-slate-500 text-center px-4">
            Glissez gauche / droite sur mobile pour changer de page
          </p>
        </div>
      )}
    </div>
  );
}
