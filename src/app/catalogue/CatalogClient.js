'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';

const ImageCatalog = dynamic(() => import('@/components/ImageCatalog'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="text-sm font-medium">Chargement du visualiseur haute qualité...</p>
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-slate-700 font-bold">Initialisation du visualiseur...</p>
        </div>
      ) : catalogUrl ? (
        <div className="w-full">
            <div className="mb-4 flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Catalogue Interactif HD - 32 Pages
            </div>
            <ImageCatalog downloadUrl={catalogUrl} />
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
