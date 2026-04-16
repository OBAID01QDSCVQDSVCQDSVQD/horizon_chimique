'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="text-sm font-medium">Chargement du lecteur (page par page)…</p>
    </div>
  ),
});

export default function CatalogClient({ initialCatalogUrl }) {
  const [catalogUrl, setCatalogUrl] = useState(initialCatalogUrl);
  const [loading, setLoading] = useState(!initialCatalogUrl);

  useEffect(() => {
    if (!initialCatalogUrl) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.catalogUrl) {
            setCatalogUrl(data.data.catalogUrl);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [initialCatalogUrl]);

  return (
    <div className="flex-grow bg-gradient-to-b from-slate-50/80 to-white relative flex flex-col p-4 md:p-6">
      {/* Header with quick actions */}
      <div className="max-w-7xl mx-auto w-full mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Catalogue Général 2026</h1>
          <p className="text-slate-500 text-sm mt-1">L'excellence technique pour vos projets d'étanchéité.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a 
            href={catalogUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <BookOpen size={20} />
            Affichage Instantané
          </a>
          <a 
            href={catalogUrl} 
            download="Catalogue-SDK-Batiment.pdf"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-xl font-bold transition-all active:scale-95"
          >
            Télécharger le PDF
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-700 font-bold">Initialisation du visualiseur...</p>
        </div>
      ) : catalogUrl ? (
        <div className="w-full">
            <div className="mb-4 flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Lecture interactive disponbile
            </div>
            <PDFViewer url={catalogUrl} />
        </div>
      ) : (
        <div className="text-center max-w-md mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-100 my-12">
          <AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Catalogue non configuré</h3>
          <p className="text-slate-500 text-sm">Le fichier est en cours de mise à jour.</p>
        </div>
      )}
    </div>
  );
}
