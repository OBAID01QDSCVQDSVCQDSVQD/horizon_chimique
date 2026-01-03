'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, CheckCircle, Droplets, FlaskConical, ShieldCheck, ArrowRight, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products?id=${id}`);
                const data = await res.json();
                if (data.success && data.data && data.data.length > 0) {
                    setProduct(data.data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">
            <h2 className="text-2xl font-bold mb-4">Produit introuvable</h2>
            <Link href="/products" className="text-primary hover:underline">Retour au catalogue</Link>
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/" className="hover:text-primary"><Home size={16} /></Link>
                    <ChevronRight size={16} />
                    <Link href="/products" className="hover:text-primary">Produits</Link>
                    <ChevronRight size={16} />
                    <span className="text-slate-900 font-medium">{product.designation}</span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Top Section: Gallery & Key Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-square bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden relative group"
                        >
                            <img
                                src={product.images && product.images.length > 0 ? product.images[activeImage] : '/placeholder-product.jpg'}
                                alt={product.designation}
                                className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                            />
                        </motion.div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-20 h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden ${activeImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent bg-white hover:border-slate-300'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col justify-center">
                        <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2">{product.gamme}</span>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">{product.designation}</h1>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                            {product.description_courte}
                        </p>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {product.caracteristiques?.rendement && (
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-primary"><Droplets size={20} /></div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Rendement</p>
                                        <p className="text-sm font-semibold text-slate-900">{product.caracteristiques.rendement}</p>
                                    </div>
                                </div>
                            )}
                            {product.caracteristiques?.temps_sechage && (
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                                    <div className="p-2 bg-orange-50 rounded-lg text-orange-500"><FlaskConical size={20} /></div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Séchage</p>
                                        <p className="text-sm font-semibold text-slate-900">{product.caracteristiques.temps_sechage}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4">
                            <Link href="/contact" className="flex-1 sm:flex-none bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                Demander un Devis <ArrowRight size={20} />
                            </Link>

                            {product.pdf_url && (
                                <a
                                    href={product.pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 sm:flex-none border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={20} /> Fiche Technique
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detailed Sections - Tabs/Cards Style */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Description & Application */}
                        <section>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm">1</span>
                                Description & Usage
                            </h3>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6 text-slate-600 leading-relaxed">
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-2">Présentation</h4>
                                    <p className="whitespace-pre-line">{product.informations || "Aucune description détaillée disponible."}</p>
                                </div>
                                {product.domaine_application && (
                                    <div className="pt-6 border-t border-slate-100">
                                        <h4 className="font-bold text-slate-900 mb-2">Domaines d'application</h4>
                                        <p className="whitespace-pre-line">{product.domaine_application}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Advantages */}
                        {product.avantages && product.avantages.length > 0 && (
                            <section>
                                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm">2</span>
                                    Pourquoi choisir ce produit ?
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {product.avantages.map((av, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                                            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                                            <span className="text-slate-700 font-medium">{av}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Implementation */}
                        <section>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm">3</span>
                                Mise en Œuvre
                            </h3>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8">
                                {product.preparation_support && (
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary"></div> Préparation du support
                                        </h4>
                                        <p className="text-slate-600 whitespace-pre-line pl-4 border-l-2 border-slate-100">{product.preparation_support}</p>
                                    </div>
                                )}
                                {product.mise_en_oeuvre && (
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary"></div> Application
                                        </h4>
                                        <p className="text-slate-600 whitespace-pre-line pl-4 border-l-2 border-slate-100">{product.mise_en_oeuvre}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Consommation */}
                        {product.consommation && (
                            <section>
                                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm">4</span>
                                    Consommation
                                </h3>
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-slate-600 leading-relaxed">
                                    <p className="whitespace-pre-line">{product.consommation}</p>
                                </div>
                            </section>
                        )}

                        {/* Nettoyage & Stockage Detailed */}
                        {(product.nettoyage || product.stockage) && (
                            <section>
                                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm">5</span>
                                    Informations Complémentaires
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {product.nettoyage && (
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                            <h4 className="font-bold text-slate-900 mb-3">Nettoyage des outils</h4>
                                            <p className="text-slate-600 whitespace-pre-line">{product.nettoyage}</p>
                                        </div>
                                    )}
                                    {product.stockage && (
                                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                            <h4 className="font-bold text-slate-900 mb-3">Stockage</h4>
                                            <p className="text-slate-600 whitespace-pre-line">{product.stockage}</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                    </div>

                    {/* Sidebar / Tech Specs Column */}
                    <div className="space-y-8">

                        {/* Tech Data Card */}
                        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <FlaskConical className="text-primary" /> Données Techniques
                            </h3>
                            <div className="space-y-4">
                                <SpecRow label="Aspect" value={product.caracteristiques?.aspect} />
                                <SpecRow label="Couleur" value={product.donnees_techniques?.couleur} />
                                <SpecRow label="Densité" value={product.donnees_techniques?.densite} />
                                <SpecRow label="Extrait Sec" value={product.donnees_techniques?.extrait_sec} />
                                <div className="h-px bg-slate-800 my-4"></div>
                                <SpecRow label="Conditionnement" value={product.caracteristiques?.conditionnement} />
                                <SpecRow label="Stockage" value={product.stockage} />
                            </div>
                        </div>

                        {/* Safety & Security */}
                        {product.securite && product.securite.length > 0 && (
                            <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                                    <ShieldCheck size={20} /> Sécurité
                                </h3>
                                <ul className="space-y-2">
                                    {product.securite.map((sec, idx) => (
                                        <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-red-400"></span>
                                            {sec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </div>
                </div>

            </main>
        </div>
    );
}

function SpecRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex justify-between items-start border-b border-slate-800 pb-2 last:border-0">
            <span className="text-slate-400 text-sm">{label}</span>
            <span className="font-semibold text-right text-sm max-w-[60%]">{value}</span>
        </div>
    );
}
