'use client';

import { useState, useEffect, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { trackFbEvent } from '@/utils/trackFbEvent';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckCircle, Droplets, FlaskConical, ShieldCheck, ArrowRight, Home, ChevronRight, X, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function ProductClient() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                const data = await res.json();

                if (data.success) {
                    setProduct(data.data);

                    trackFbEvent('ViewContent', {
                        content_name: data.data.designation,
                        content_ids: [data.data._id],
                        content_type: 'product',
                    });

                    // Pixel spécifique au produit
                    if (typeof window !== 'undefined' && data.data.facebookPixelId) {
                        const productPixelId = data.data.facebookPixelId;
                        // Init pixel produit s'il n'est pas déjà initialisé
                        window.fbq('init', productPixelId);
                        window.fbq('trackSingle', productPixelId, 'ViewContent', {
                            content_name: data.data.designation,
                            content_ids: [data.data._id],
                            content_type: 'product',
                        });
                    }
                } else {
                    console.error("Product fetch failed:", data.error);
                }
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    const handleKeyDown = useCallback((e) => {
        if (!lightboxOpen) return;
        if (e.key === 'Escape') setLightboxOpen(false);
        if (e.key === 'ArrowLeft') navigateImage(-1);
        if (e.key === 'ArrowRight') navigateImage(1);
    }, [lightboxOpen, activeImage]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
            <h2 className="text-xl font-bold mb-4">Produit introuvable</h2>
            <Link href="/products" className="text-primary hover:underline text-sm">Retour au catalogue</Link>
        </div>
    );

    const images = product.images || [];

    const navigateImage = (direction) => {
        if (images.length <= 1) return;
        let newIndex = activeImage + direction;
        if (newIndex < 0) newIndex = images.length - 1;
        if (newIndex >= images.length) newIndex = 0;
        setActiveImage(newIndex);
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            {/* Breadcrumb - Compact */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-slate-500">
                    <Link href="/" className="hover:text-primary"><Home size={14} /></Link>
                    <ChevronRight size={14} />
                    <Link href="/products" className="hover:text-primary">Produits</Link>
                    <ChevronRight size={14} />
                    <span className="text-slate-900 font-medium truncate max-w-[200px]">{product.designation}</span>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 py-8">

                {/* Top Section: Gallery & Key Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

                    {/* Image Gallery - Compact */}
                    <div className="space-y-3">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-video lg:aspect-square max-h-[400px] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative group cursor-pointer flex items-center justify-center"
                            onClick={() => setLightboxOpen(true)}
                        >
                            <img
                                src={images.length > 0 ? images[activeImage] : '/placeholder-product.jpg'}
                                alt={product.designation}
                                className="w-auto h-full max-w-full max-h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
                                <span className="bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    Voir en grand
                                </span>
                            </div>
                        </motion.div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-14 h-14 flex-shrink-0 rounded-md border overflow-hidden transition-all ${activeImage === idx ? 'border-primary ring-1 ring-primary/20 opacity-100' : 'border-slate-200 opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info - Compact */}
                    <div className="flex flex-col">
                        <span className="text-primary font-bold tracking-wider uppercase text-xs mb-1">
                            {Array.isArray(product.gamme) ? product.gamme.join(' / ') : product.gamme}
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">{product.designation}</h1>
                        <p className="text-base text-slate-600 mb-6 leading-relaxed">
                            {product.description_courte}
                        </p>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {product.caracteristiques?.rendement && (
                                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-start gap-2">
                                    <div className="p-1.5 bg-blue-50 rounded-md text-primary"><Droplets size={16} /></div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Rendement</p>
                                        <p className="text-xs font-bold text-slate-900">{product.caracteristiques.rendement}</p>
                                    </div>
                                </div>
                            )}
                            {product.caracteristiques?.temps_sechage && (
                                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-start gap-2">
                                    <div className="p-1.5 bg-orange-50 rounded-md text-orange-500"><FlaskConical size={16} /></div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Séchage</p>
                                        <p className="text-xs font-bold text-slate-900">{product.caracteristiques.temps_sechage}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 mt-auto">
                            <Link 
                                href={`/devis?product=${encodeURIComponent(product.designation)}`}
                                onClick={() => trackFbEvent('InitiateCheckout', { 
                                    content_name: product.designation,
                                    content_ids: [product._id],
                                    content_type: 'product'
                                }, {
                                    email: session?.user?.email,
                                    phone: session?.user?.phone,
                                    firstName: session?.user?.firstName,
                                    lastName: session?.user?.lastName
                                })}
                                className="flex-1 sm:flex-none bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm"
                            >
                                Demander un Devis <ArrowRight size={16} />
                            </Link>

                            <button
                                onClick={async () => {
                                    setDownloadingPdf(true);
                                    
                                    // Track PDF Download as an engagement event
                                    trackFbEvent('Contact', { 
                                        content_name: `Download PDF: ${product.designation}`,
                                        content_category: 'Product Documentation'
                                    });

                                    try {
                                        const res = await fetch(`/api/products/${id}/pdf`);
                                        if (!res.ok) throw new Error("Download failed");
                                        const blob = await res.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `Fiche_Technique_${product.code_article || product.designation}.pdf`;
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                    } catch (e) {
                                        console.error("PDF Download error", e);
                                        alert("Erreur lors du téléchargement");
                                    } finally {
                                        setDownloadingPdf(false);
                                    }
                                }}
                                disabled={downloadingPdf}
                                className="flex-1 sm:flex-none border border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {downloadingPdf ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                                ) : (
                                    <Download size={16} />
                                )}
                                {downloadingPdf ? 'Génération...' : 'Fiche Technique'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Detailed Sections - Tabs/Cards Style - Compact */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Description & Application */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center text-xs">1</span>
                                Description & Usage
                            </h3>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4 text-slate-600 text-sm leading-relaxed">
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Présentation</h4>
                                    <p className="whitespace-pre-line">{product.informations || "Aucune description détaillée disponible."}</p>
                                </div>
                                {product.domaine_application && (
                                    <div className="pt-4 border-t border-slate-100">
                                        <h4 className="font-bold text-slate-900 mb-1">Domaines d'application</h4>
                                        <p className="whitespace-pre-line">{product.domaine_application}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Advantages */}
                        {product.avantages && product.avantages.length > 0 && (
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center text-xs">2</span>
                                    Pourquoi choisir ce produit ?
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {product.avantages.map((av, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex items-start gap-2">
                                            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                                            <span className="text-slate-700 font-medium text-sm">{av}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Implementation */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center text-xs">3</span>
                                Mise en Œuvre
                            </h3>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6 text-sm">
                                {product.preparation_support && (
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Préparation du support
                                        </h4>
                                        <p className="text-slate-600 whitespace-pre-line pl-3 border-l-2 border-slate-100">{product.preparation_support}</p>
                                    </div>
                                )}
                                {product.mise_en_oeuvre && (
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Application
                                        </h4>
                                        <p className="text-slate-600 whitespace-pre-line pl-3 border-l-2 border-slate-100">{product.mise_en_oeuvre}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Consommation */}
                        {product.consommation && (
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center text-xs">4</span>
                                    Consommation
                                </h3>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-slate-600 text-sm leading-relaxed">
                                    <p className="whitespace-pre-line">{product.consommation}</p>
                                </div>
                            </section>
                        )}

                        {/* Nettoyage & Stockage Detailed */}
                        {(product.nettoyage || product.stockage) && (
                            <section>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center text-xs">5</span>
                                    Infos Utiles
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {product.nettoyage && (
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                            <h4 className="font-bold text-slate-900 mb-2 text-sm">Nettoyage des outils</h4>
                                            <p className="text-slate-600 text-sm whitespace-pre-line">{product.nettoyage}</p>
                                        </div>
                                    )}
                                    {product.stockage && (
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                            <h4 className="font-bold text-slate-900 mb-2 text-sm">Stockage</h4>
                                            <p className="text-slate-600 text-sm whitespace-pre-line">{product.stockage}</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                    </div>

                    {/* Sidebar / Tech Specs Column - Compact */}
                    <div className="space-y-6">

                        {/* Tech Data Card */}
                        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FlaskConical className="text-primary" size={18} /> Données Techniques
                            </h3>
                            <div className="space-y-3">
                                <SpecRow label="Aspect" value={product.caracteristiques?.aspect} />
                                <SpecRow label="Couleur" value={product.donnees_techniques?.couleur} />
                                <SpecRow label="Densité" value={product.donnees_techniques?.densite} />
                                <SpecRow label="Extrait Sec" value={product.donnees_techniques?.extrait_sec} />
                                <div className="h-px bg-slate-800 my-3"></div>
                                <SpecRow label="Conditionnement" value={product.caracteristiques?.conditionnement} />
                                <SpecRow label="Stockage" value={product.stockage} />
                            </div>
                        </div>

                        {/* Safety & Security */}
                        {product.securite && product.securite.length > 0 && (
                            <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                                <h3 className="text-base font-bold text-red-900 mb-3 flex items-center gap-2">
                                    <ShieldCheck size={18} /> Sécurité
                                </h3>
                                <ul className="space-y-1.5">
                                    {product.securite.map((sec, idx) => (
                                        <li key={idx} className="text-xs text-red-800 flex items-start gap-2">
                                            <span className="mt-1 w-1 h-1 rounded-full bg-red-400 shrink-0"></span>
                                            {sec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </div>
                </div>

            </main>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setLightboxOpen(false)}
                    >
                        <button
                            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20 z-50"
                            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
                        >
                            <X size={24} />
                        </button>

                        {images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-2 md:left-8 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20 z-50"
                                    onClick={(e) => { e.stopPropagation(); navigateImage(-1); }}
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                <button
                                    className="absolute right-2 md:right-8 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20 z-50"
                                    onClick={(e) => { e.stopPropagation(); navigateImage(1); }}
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}

                        <motion.img
                            key={activeImage}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            src={images[activeImage]}
                            alt={product.designation}
                            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {images.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/10">
                                {activeImage + 1} / {images.length}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SpecRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex justify-between items-start border-b border-slate-800/50 pb-1.5 last:border-0">
            <span className="text-slate-400 text-xs">{label}</span>
            <span className="font-semibold text-right text-xs max-w-[60%]">{value}</span>
        </div>
    );
}
