'use client';

import { useState, useEffect } from 'react';
import { FileText, ExternalLink } from 'lucide-react';

/**
 * Affichage via le lecteur PDF natif du navigateur (Chrome/Edge/Safari/Firefox) :
 * streaming + première page plus rapide qu’un viewer PDF.js personnalisé.
 */
export default function PDFViewer({ url }) {
  const [ready, setReady] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  if (!url) return null;

  const isExternal = url.startsWith('http://') || url.startsWith('https://');
  const pdfUrl = isExternal ? url : `/api/stream-pdf?url=${encodeURIComponent(url)}`;

  // #view=FitH : largeur utile ; le navigateur gère le PDF sans télécharger tout le JS pdf.js
  const iframeSrc = `${pdfUrl}#view=FitH`;

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowFallback(true), 12000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full relative">
      {/* Bandeau actions — visible tout de suite */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
        <p className="text-sm text-slate-600 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Consultation en ligne — pour une lecture plus fluide sur mobile, utilisez{' '}
            <strong>Télécharger le PDF</strong> ci-dessus.
          </span>
        </p>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="w-4 h-4" />
          Ouvrir dans un nouvel onglet
        </a>
      </div>

      <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-100 min-h-[72vh]">
        {!ready && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/40"
            aria-hidden={ready}
          >
            <div className="w-full max-w-lg mx-4 space-y-4">
              <div className="h-4 bg-slate-200/80 rounded w-3/4 animate-pulse" />
              <div className="h-72 bg-white rounded-xl shadow-inner border border-slate-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Préparation de l’aperçu…</p>
                  <p className="text-slate-400 text-sm mt-2">Lecture optimisée par votre navigateur</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-5/6 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        <iframe
          title="Catalogue PDF"
          src={iframeSrc}
          className={`w-full min-h-[72vh] border-0 bg-white block transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setReady(true)}
          loading="lazy"
          allow="fullscreen"
        />

        {showFallback && (
          <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md pointer-events-none">
            <div className="pointer-events-auto rounded-xl bg-slate-900/90 text-white text-sm px-4 py-3 shadow-lg backdrop-blur-sm">
              <p className="font-semibold mb-1">Affichage lent ou bloqué ?</p>
              <p className="text-slate-300 text-xs mb-2">
                Ouvrez le fichier dans un nouvel onglet ou téléchargez-le (bouton en haut de page).
              </p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-300 font-bold hover:text-white"
              >
                Ouvrir le PDF →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
