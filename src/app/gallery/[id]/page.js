'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Info, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function GalleryDetailsPage({ params }) {
    const { id } = params;
    const [media, setMedia] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fullscreen Slideshow State
    const [activeImageIndex, setActiveImageIndex] = useState(null);

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const res = await fetch(`/api/gallery/${id}`, { cache: 'no-store' });
                const data = await res.json();
                if (data.success) {
                    // Set random image logic if needed for the array
                    const item = data.data;
                    if (item.images && item.images.length > 0) {
                        item.randomFeatured = item.images[Math.floor(Math.random() * item.images.length)];
                    } else {
                        item.randomFeatured = item.url;
                    }
                    setMedia(item);
                }
            } catch (error) {
                console.error("Gallery fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMedia();
    }, [id]);

    const getEmbedUrl = (url) => {
        if (!url) return '';
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            if (match && match[2].length === 11) {
                return `https://www.youtube.com/embed/${match[2]}`;
            }
        }
        return url;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 size={48} className="animate-spin text-primary" />
            </div>
        );
    }

    if (!media) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
                <h1 className="text-3xl font-bold text-slate-800 mb-4">Média introuvable</h1>
                <Link href="/gallery" className="text-primary hover:underline font-bold flex items-center gap-2">
                    <ArrowRight className="rotate-180" size={16} /> Retour à la galerie
                </Link>
            </div>
        );
    }

    const nextImage = (e) => {
        e.stopPropagation();
        if (media && media.images) {
            setActiveImageIndex((prev) => (prev === media.images.length - 1 ? 0 : prev + 1));
        }
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (media && media.images) {
            setActiveImageIndex((prev) => (prev === 0 ? media.images.length - 1 : prev - 1));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* Header */}
            <div className="bg-slate-900 text-white relative py-12 md:py-16 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/80 to-slate-900 opacity-90"></div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 w-full flex flex-col md:flex-row items-center justify-between">
                    <Link href="/gallery" className="text-blue-200 hover:text-white flex items-center gap-2 font-bold transition-colors mb-6 md:mb-0">
                        <ArrowRight className="rotate-180" size={20} /> <span dir="auto">Retour à la Galerie</span>
                    </Link>
                    <div className="text-center md:text-right" dir="auto">
                        <span className="inline-block px-3 py-1 bg-white/10 text-blue-200 font-bold uppercase tracking-wider text-xs rounded-full mb-3 shrink-0 backdrop-blur-sm border border-white/20">{media.category}</span>
                        <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight text-white drop-shadow-lg">{media.title}</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
                <motion.div
                    initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl w-full shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Visual Content (Video or Image) */}
                    {media.type === 'video' || (media.url && (media.url.includes('youtube.com') || media.url.includes('youtu.be') || media.url.includes('vimeo.com'))) ? (
                        <div className="w-full bg-slate-100 flex items-center justify-center relative shadow-inner">
                            <div className="w-full aspect-video bg-black relative">
                                <iframe
                                    src={getEmbedUrl(media.url)}
                                    className="absolute top-0 left-0 w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full bg-slate-900 flex items-center justify-center relative shadow-inner overflow-hidden max-h-[70vh]">
                            {/* Blur background layer */}
                            <div className="absolute inset-0 opacity-40 blur-2xl transform scale-110" style={{ backgroundImage: `url(${media.randomFeatured})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                            <img
                                src={media.randomFeatured}
                                alt={media.title}
                                className="w-full max-h-[70vh] object-contain relative z-10"
                            />
                        </div>
                    )}

                    {/* Details Content */}
                    <div className="p-6 md:p-10 bg-white flex flex-col items-end text-right" dir="auto">

                        {media.description && (
                            <div className="flex flex-row-reverse gap-4 p-6 md:p-8 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium text-base md:text-lg shadow-inner w-full mb-8">
                                <Info className="shrink-0 text-primary mt-1" size={28} />
                                <p className="flex-1 text-right leading-loose break-words whitespace-pre-wrap">{media.description}</p>
                            </div>
                        )}

                        {/* Call to action */}
                        <div className="w-full flex justify-center sm:justify-start mb-8" dir="ltr">
                            <Link
                                href="/contact"
                                onClick={() => {
                                    if (typeof window !== 'undefined' && window.fbq) {
                                        window.fbq('track', 'Lead', {
                                            content_name: 'Diagnostic Technique Initiated',
                                            content_category: 'Gallery Button Click',
                                            source_url: window.location.href
                                        });
                                    }
                                }}
                                className="bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1 active:scale-95 group"
                            >
                                Demander un Diagnostic Technique <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Additional Images Array displayed BELOW description */}
                        {media.images && media.images.length > 0 && (
                            <div className="w-full pt-4 mt-2">
                                <h4 className="text-xl font-bold text-slate-800 mb-6 text-right border-b border-slate-100 pb-4">معرض الصور</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir="ltr">
                                    {media.images.map((img, idx) => (
                                        <div key={idx} onClick={() => setActiveImageIndex(idx)} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer aspect-[4/3] relative flex items-center justify-center">
                                            <div className="absolute inset-0 w-full h-full block">
                                                <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Fallback image if NOT a video, and NO images array, but has a base URL */}
                        {media.type !== 'video' && (!media.images || media.images.length === 0) && media.url && (
                            <div className="w-full mt-4 flex justify-center">
                                <a href={media.url} target="_blank" rel="noopener noreferrer">
                                    <img src={media.url} alt={media.title} className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-md border border-slate-200 hover:scale-[1.02] transition-transform" loading="lazy" />
                                </a>
                            </div>
                        )}

                    </div>
                </motion.div>
            </div>

            {/* FULLSCREEN FACEBOOK-STYLE SLIDESHOW */}
            <AnimatePresence>
                {activeImageIndex !== null && media && media.images && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex justify-center items-center select-none"
                    >
                        {/* Status Bar / Close */}
                        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-[110] bg-gradient-to-b from-black/60 to-transparent text-white">
                            <span className="font-bold text-sm bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
                                {activeImageIndex + 1} / {media.images.length}
                            </span>
                            <button
                                onClick={() => setActiveImageIndex(null)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Navigation Controls */}
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-all active:scale-90 z-[110]"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-all active:scale-90 z-[110]"
                        >
                            <ChevronRight size={32} />
                        </button>

                        {/* Image Track */}
                        <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12 mb-12 sm:mb-0" onClick={() => setActiveImageIndex(null)}>
                            <img
                                src={media.images[activeImageIndex]}
                                alt={`Fullscreen ${activeImageIndex + 1}`}
                                className="max-w-full max-h-full object-contain drop-shadow-2xl"
                                onClick={(e) => e.stopPropagation()} /* Prevent background click closing */
                            />
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
