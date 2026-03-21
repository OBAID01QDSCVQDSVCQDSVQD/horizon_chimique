'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, X, Maximize2 } from 'lucide-react';
import Image from 'next/image';

export default function ProjectGallery({ images }) {
    const [lightboxIndex, setLightboxIndex] = useState(null);

    const openLightbox = (index) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevImage(e);
            if (e.key === 'ArrowRight') nextImage(e);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex]);

    const nextImage = (e) => {
        e?.stopPropagation();
        setLightboxIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e?.stopPropagation();
        setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 border-l-4 border-primary pl-4">Galerie Photos</h3>
                <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{images.length} Photos</span>
            </div>

            {/* Mobile Carousel (Horizontal Scroll Snap) */}
            <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 scrollbar-hide">
                {images.map((img, i) => (
                    <div
                        key={i}
                        onClick={() => openLightbox(i)}
                        className="snap-center shrink-0 w-[85vw] rounded-2xl overflow-hidden shadow-lg relative aspect-[4/5] border border-slate-100 cursor-pointer active:scale-95 transition-transform"
                    >
                        <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm pointer-events-none">
                            {i + 1} / {images.length}
                        </div>
                        <div className="absolute inset-0 bg-black/0 active:bg-black/10 transition-colors pointer-events-none"></div>
                    </div>
                ))}
            </div>

            {/* Desktop Masonry/Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
                {images.map((img, i) => (
                    <div
                        key={i}
                        onClick={() => openLightbox(i)}
                        className={`relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-zoom-in group ${i === 0 ? 'col-span-2 aspect-[2.35/1]' : 'aspect-square'}`}
                    >
                        <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none"></div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={closeLightbox}>
                    <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/50 hover:text-white p-2 z-50 transition-colors border-2 border-transparent hover:border-white/20 rounded-full">
                        <X size={32} />
                    </button>

                    <div className="relative w-full max-w-6xl h-full max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <img src={images[lightboxIndex]} alt="Full view" className="max-w-full max-h-full object-contain rounded-sm shadow-2xl" />

                        {images.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-2 md:-left-12 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all group">
                                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                                </button>
                                <button onClick={nextImage} className="absolute right-2 md:-right-12 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all group">
                                    <ArrowLeft size={24} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </>
                        )}

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur rounded-full text-white font-medium text-sm border border-white/10">
                            {lightboxIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
