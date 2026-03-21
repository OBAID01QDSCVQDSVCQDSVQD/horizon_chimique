'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Calendar, MapPin, Tag, Edit, X, UserCircle, Maximize2 } from 'lucide-react';

export default function RealizationDetailPage() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    useEffect(() => {
        fetch(`/api/realizations/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProject(data.realization);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const openLightbox = (index) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const nextImage = (e) => {
        e.stopPropagation();
        setLightboxIndex((prev) => (prev + 1) % project.images.length);
    };
    const prevImage = (e) => {
        e.stopPropagation();
        setLightboxIndex((prev) => (prev - 1 + project.images.length) % project.images.length);
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen bg-slate-50"><Loader2 className="animate-spin text-primary" size={40} /></div>;
    if (!project) return <div className="text-center py-20 font-bold text-slate-500">Projet introuvable</div>;

    return (
        <div className="min-h-screen bg-white">
            {/* Header / Actions */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/artisan/realisations" className="flex items-center text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors">
                        <ArrowLeft size={18} className="mr-2" /> Retour
                    </Link>
                    <Link href={`/artisan/realisations/${id}/edit`} className="flex items-center bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-full shadow-lg transition-all active:scale-95 font-bold text-sm">
                        <Edit size={16} className="mr-2" /> Modifier
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">

                {/* Project Header Info */}
                <div className="mb-10 text-center max-w-3xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                        {project.tags?.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-wide border border-blue-100">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">{project.title}</h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-500">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-slate-400" />
                            {new Date(project.createdAt).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {project.location && (
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-slate-400" />
                                <span className="uppercase tracking-wide">{project.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {project.artisan?.image ? (
                                <img src={project.artisan.image} alt="Artisan" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                                <UserCircle size={20} className="text-slate-400" />
                            )}
                            <span className="text-slate-700">{project.artisan?.companyName || project.artisan?.name}</span>
                        </div>
                    </div>
                </div>

                {/* Description Content (Moved Up) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                    <div className="lg:col-span-2">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-primary pl-4">À propos du projet</h3>
                        <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                            {project.description}
                        </div>
                    </div>

                    {/* Sidebar / Context */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 sticky top-24">
                            <h4 className="font-bold text-slate-900 mb-4">Détails techniques</h4>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Catégories</span>
                                    <div className="flex flex-wrap gap-1">
                                        {project.tags?.map(t => <span key={t} className="px-2 py-1 bg-white border rounded text-slate-700">{t}</span>)}
                                    </div>
                                </div>
                                {project.completionDate && (
                                    <div>
                                        <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Date de fin</span>
                                        <span className="text-slate-800 font-medium">{new Date(project.completionDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <hr className="border-slate-200" />
                                <button onClick={() => openLightbox(0)} className="w-full py-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                                    <Maximize2 size={16} /> Voir Galerie
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-slate-900 border-l-4 border-primary pl-4">Galerie Photos</h3>
                        <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{project.images.length} Photos</span>
                    </div>

                    {/* Mobile Carousel (Horizontal Scroll Snap) - Visible up to LG */}
                    <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 scrollbar-hide">
                        {project.images.map((img, i) => (
                            <div key={i} onClick={() => openLightbox(i)} className="snap-center shrink-0 w-[85vw] rounded-2xl overflow-hidden shadow-lg relative aspect-[4/5] border border-slate-100 cursor-pointer active:scale-95 transition-transform">
                                <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
                                    {i + 1} / {project.images.length}
                                </div>
                                <div className="absolute inset-0 bg-black/0 active:bg-black/10 transition-colors"></div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Gallery Grid - Airbnb Style (Visible LG+) */}
                    <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-2 h-[500px] rounded-3xl overflow-hidden shadow-sm">
                        {/* Main Image */}
                        {project.images[0] && (
                            <div
                                className={`relative group cursor-pointer overflow-hidden ${project.images.length === 1 ? 'col-span-4 row-span-2' : 'col-span-2 row-span-2'}`}
                                onClick={() => openLightbox(0)}
                            >
                                <img src={project.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Main" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                        )}

                        {/* Secondary Images */}
                        {project.images.slice(1, 5).map((img, i) => (
                            <div
                                key={i}
                                className="relative group cursor-pointer overflow-hidden bg-slate-100"
                                onClick={() => openLightbox(i + 1)}
                            >
                                <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={`Gallery ${i}`} />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                                {/* "Show All" overlay on last item if more images exist */}
                                {i === 3 && project.images.length > 5 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg backdrop-blur-[2px]">
                                        +{project.images.length - 5} Photos
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lightbox Modal */}
                {lightboxIndex !== null && (
                    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/50 hover:text-white p-2 z-50 transition-colors border-2 border-transparent hover:border-white/20 rounded-full">
                            <X size={32} />
                        </button>

                        <div className="relative w-full max-w-6xl h-full max-h-[90vh] flex items-center justify-center">
                            <img src={project.images[lightboxIndex]} alt="Full view" className="max-w-full max-h-full object-contain rounded-sm shadow-2xl" />

                            {project.images.length > 1 && (
                                <>
                                    <button onClick={prevImage} className="absolute left-2 md:-left-12 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all">
                                        <ArrowLeft size={24} />
                                    </button>
                                    <button onClick={nextImage} className="absolute right-2 md:-right-12 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all">
                                        <ArrowLeft size={24} className="rotate-180" />
                                    </button>
                                </>
                            )}

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur rounded-full text-white font-medium text-sm border border-white/10">
                                {lightboxIndex + 1} / {project.images.length}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
