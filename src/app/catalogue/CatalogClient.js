'use client';
import { useState, useEffect } from 'react';
import { Loader2, Download, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-slate-100 flex items-center justify-center text-slate-400">Chargement du visualiseur...</div>
});

export default function CatalogClient({ initialCatalogUrl }) {
    const [catalogUrl, setCatalogUrl] = useState(initialCatalogUrl);
    const [loading, setLoading] = useState(!initialCatalogUrl);

    useEffect(() => {
        if (!initialCatalogUrl) {
            fetch('/api/settings')
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data.catalogUrl) {
                        setCatalogUrl(data.data.catalogUrl);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [initialCatalogUrl]);

    return (
        <div className="flex-grow bg-slate-50 relative flex items-center justify-center p-4">
            {loading ? (
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Chargement du catalogue...</p>
                </div>
            ) : catalogUrl ? (
                <div className="w-full min-h-[60vh]">
                    <PDFViewer url={catalogUrl} />
                </div>
            ) : (
                <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Non Disponible</h3>
                    <p className="text-slate-500">Le catalogue n'est pas encore disponible en ligne. Veuillez contacter notre service technique.</p>
                </div>
            )}
        </div>
    );
}
