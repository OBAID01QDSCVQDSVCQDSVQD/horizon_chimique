'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Filter, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function GalleryPage() {
    const [mediaItems, setMediaItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [categories, setCategories] = useState(['Tous']);
    const [activeCategory, setActiveCategory] = useState('Tous');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await fetch('/api/gallery', { cache: 'no-store' });
                const data = await res.json();
                if (data.success) {
                    setMediaItems(data.data);
                    setFilteredItems(data.data);

                    // Extract unique categories and set random featured image
                    const catSet = new Set(['Tous']);
                    data.data.forEach(item => {
                        if (item.category) catSet.add(item.category);
                        if (item.images && item.images.length > 0) {
                            item.randomFeatured = item.images[Math.floor(Math.random() * item.images.length)];
                        } else {
                            item.randomFeatured = item.url;
                        }
                    });
                    setCategories(Array.from(catSet));
                }
            } catch (error) {
                console.error("Gallery fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    useEffect(() => {
        if (activeCategory === 'Tous') {
            setFilteredItems(mediaItems);
        } else {
            setFilteredItems(mediaItems.filter(m => m.category === activeCategory));
        }
    }, [activeCategory, mediaItems]);

    // Format YouTube/Vimeo/Embed Links nicely for Iframe
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

    const getYoutubeThumbnail = (url) => {
        if (!url) return null;
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            if (match && match[2].length === 11) {
                // Return high-res thumbnail. If not available, it defaults to maxresdefault or hqdefault etc.
                return `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg`;
            }
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 size={48} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">

            {/* Header / Hero */}
            <div className="bg-slate-900 text-white relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/80 to-slate-900 opacity-90"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-white drop-shadow-lg"
                    >
                        معرض الأعمال <span className="text-blue-300 font-serif">/</span> Galerie
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed font-medium"
                    >
                        Découvrez nos réalisations, chantiers d'étanchéité, et solutions innovantes à travers nos meilleures photos et vidéos.
                    </motion.p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-24 -mt-8 relative z-20">
                {/* Filter Bar */}
                <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100 mb-10 overflow-x-auto flex items-center gap-2 custom-scrollbar">
                    <div className="flex bg-slate-100 p-2 rounded-xl sticky left-0 z-10 shrink-0 border border-slate-200">
                        <Filter size={20} className="text-slate-500" />
                    </div>
                    {categories.map((cat, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all select-none ${activeCategory === cat ? 'bg-primary text-white shadow-md' : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid Network (1 Col Mobile, 2 Col Tablet, 3 Col Desktop) */}
                {filteredItems.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Filter size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun Média</h3>
                        <p className="text-slate-500 text-sm">Aucun résultat trouvé pour cette catégorie.</p>
                    </div>
                ) : (
                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredItems.map(item => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    key={item._id}
                                    className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100 cursor-pointer flex flex-col h-full"
                                >
                                    <Link href={`/gallery/${item._id}`} className="flex flex-col h-full">
                                        {/* Media Wrapper */}
                                        <div className="relative w-full aspect-[4/3] bg-slate-200 overflow-hidden shrink-0">
                                            {item.type === 'video' || (item.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be') || item.url.includes('vimeo.com'))) ? (
                                                <div className="w-full h-full relative">
                                                    {/* Use YouTube thumbnail if possible, else gray BG */}
                                                    {getYoutubeThumbnail(item.url) ? (
                                                        <img src={getYoutubeThumbnail(item.url)} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" loading="lazy" onError={(e) => {
                                                            // Fallback to hqdefault if maxresdefault doesn't exist
                                                            if (e.target.src.includes('maxresdefault.jpg')) {
                                                                e.target.src = e.target.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
                                                            } else {
                                                                e.target.style.display = 'none';
                                                            }
                                                        }} />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-slate-900 transition-transform duration-700 group-hover:scale-105" />
                                                    )}

                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-primary/80 transition-all duration-300">
                                                            <PlayCircle size={32} className="text-white ml-1 opacity-90" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <img src={item.randomFeatured} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                                                    {item.images && item.images.length > 1 && (
                                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded shadow text-[10px] font-bold z-10 tracking-widest uppercase">
                                                            +{item.images.length - 1} Vue(s)
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* Overlay Hover Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                                <span className="text-blue-300 text-xs font-black uppercase tracking-wider mb-2 drop-shadow-md" dir="auto">{item.category}</span>
                                                <h3 className="text-white font-bold text-xl drop-shadow-lg leading-tight line-clamp-2" dir="auto">{item.title}</h3>
                                            </div>
                                        </div>

                                        {/* Default Display Below Image (Only shows if not hovered entirely covered) */}
                                        <div className="p-5 flex flex-col flex-1 bg-white">
                                            <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-primary transition-colors" dir="auto">{item.title}</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-500 font-bold uppercase text-[10px] rounded border border-slate-200" dir="auto">{item.category}</span>
                                                {item.type === 'video' && <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-600 font-bold uppercase text-[10px] rounded border border-purple-200 flex items-center gap-1"><PlayCircle size={10} /> Vidéo</span>}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
