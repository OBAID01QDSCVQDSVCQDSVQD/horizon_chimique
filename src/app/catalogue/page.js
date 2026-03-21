'use client';
import { useState, useEffect } from 'react';
import { Loader2, FileText, Download, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-slate-100 flex items-center justify-center text-slate-400">Chargement du visualiseur...</div>
});

export default function CataloguePage() {
    const [catalogUrl, setCatalogUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Clean up any old Service Workers that might block PDF downloads
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => registration.unregister());
            });
        }

        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data.catalogUrl) {
                    setCatalogUrl(data.data.catalogUrl);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[80vh] flex flex-col relative border border-slate-100">
                <div className="bg-white/80 backdrop-blur-md p-4 md:p-6 flex flex-col md:flex-row justify-between items-center border-b border-slate-100 sticky top-0 z-10 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                            Catalogue Général
                        </h1>
                        <p className="text-slate-500 text-sm">Découvrez nos produits et solutions.</p>
                    </div>
                    {catalogUrl && (
                        <a href={catalogUrl} download target="_blank" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
                            <Download size={18} /> Télécharger PDF
                        </a>
                    )}
                </div>

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
            </div>
        </div>
    );
}
