'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';
import PDFViewer from '@/components/PDFViewer';

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
          <div className="relative mb-6">
            <div className="w-20 h-24 rounded-lg bg-white shadow-lg border border-slate-200 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-blue-500 animate-pulse" />
            </div>
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow" />
          </div>
          <p className="text-slate-700 font-semibold">Chargement des informations du catalogue…</p>
          <p className="text-slate-400 text-sm mt-2 max-w-sm">
            Récupération du lien depuis le serveur
          </p>
        </div>
      ) : catalogUrl ? (
        <div className="w-full animate-in fade-in duration-500">
          <PDFViewer url={catalogUrl} />
        </div>
      ) : (
        <div className="text-center max-w-md mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-100 my-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Catalogue non disponible</h3>
          <p className="text-slate-500 text-sm">
            Le lien du catalogue n’est pas encore configuré. Contactez le support technique.
          </p>
        </div>
      )}
    </div>
  );
}
