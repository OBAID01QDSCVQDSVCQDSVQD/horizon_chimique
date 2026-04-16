'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Download, Search, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Mousewheel, Zoom } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

const TOTAL_PAGES = 32;

export default function ImageCatalog({ downloadUrl }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showThumbnails, setShowThumbnails] = useState(false);
    const swiperRef = useRef(null);

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            const el = document.documentElement;
            if (el.requestFullscreen) el.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div className={`
            relative flex flex-col w-full h-full select-none
            ${isFullscreen ? 'fixed inset-0 bg-[#0a0a0b] z-[9999]' : 'min-h-[85vh] bg-slate-100/50 rounded-3xl overflow-hidden border border-slate-200'}
            transition-all duration-500 font-sans
        `}>
            {/* Top Toolbar */}
            <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center p-4 md:p-6 bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 pointer-events-auto"
                >
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full text-white text-xs font-bold tracking-widest uppercase">
                        Catalogue 2026
                    </div>
                </motion.div>

                <div className="flex gap-2 pointer-events-auto">
                    <button 
                        onClick={() => setShowThumbnails(!showThumbnails)}
                        className="bg-white/10 backdrop-blur-xl hover:bg-white/20 p-3 rounded-full text-white transition-all active:scale-90"
                        title="Toutes les pages"
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button 
                        onClick={toggleFullscreen}
                        className="bg-white/10 backdrop-blur-xl hover:bg-white/20 p-3 rounded-full text-white transition-all active:scale-90"
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    {downloadUrl && (
                         <a 
                            href={downloadUrl} 
                            download 
                            className="bg-blue-600 p-3 rounded-full text-white hover:bg-blue-700 transition-all active:scale-90 shadow-lg shadow-blue-500/30"
                        >
                            <Download size={20} />
                        </a>
                    )}
                </div>
            </div>

            {/* Main Viewer Area */}
            <div className="flex-grow flex items-center justify-center relative bg-[#0f1115]">
                <Swiper
                    modules={[Navigation, Pagination, Keyboard, Mousewheel, Zoom]}
                    spaceBetween={30}
                    slidesPerView={1}
                    navigation={{
                        nextEl: '.swiper-next',
                        prevEl: '.swiper-prev',
                    }}
                    pagination={{
                        type: 'progressbar',
                        el: '.swiper-pagination-custom',
                    }}
                    keyboard={{ enabled: true }}
                    mousewheel={true}
                    zoom={{
                        maxRatio: 3,
                        minRatio: 1,
                        toggle: true,
                    }}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    className="w-full h-full"
                    centeredSlides={true}
                    grabCursor={true}
                >
                    {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                        <SwiperSlide key={i} className="flex items-center justify-center p-4 md:p-10">
                            <div className="swiper-zoom-container cursor-zoom-in">
                                <Image
                                    src={`/catalog/${i + 1}.png`}
                                    alt={`Page ${i + 1}`}
                                    width={1200}
                                    height={1600}
                                    className="max-h-full w-auto object-contain rounded-sm shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]"
                                    loading="lazy" // Critical for speed
                                    quality={75}   // Optimized quality
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                    
                    {/* Progress Bar Container */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 md:w-64 z-20">
                        <div className="swiper-pagination-custom h-1 bg-white/10 rounded-full overflow-hidden"></div>
                        <div className="mt-2 text-[10px] text-center text-white/40 font-bold tracking-widest uppercase">
                             Navigation Page par Page
                        </div>
                    </div>
                </Swiper>

                {/* Custom Nav Arrows */}
                <button className="swiper-prev absolute left-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/10 hidden lg:flex">
                    <ChevronLeft size={28} />
                </button>
                <button className="swiper-next absolute right-6 top-1/2 -translate-y-1/2 z-30 w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50 hover:text-white transition-all border border-white/10 hidden lg:flex">
                    <ChevronRight size={28} />
                </button>
            </div>

            {/* Thumbnails Overlay */}
            <AnimatePresence>
                {showThumbnails && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 z-40 bg-slate-900/95 backdrop-blur-2xl p-6 md:p-20 overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-white text-2xl font-black italic tracking-tighter">SDK CATALOGUE INDEX</h2>
                            <button 
                                onClick={() => setShowThumbnails(false)}
                                className="text-white/60 hover:text-white p-2 border border-white/10 rounded-full"
                            >
                                Fermer Index
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        swiperRef.current.slideTo(i);
                                        setShowThumbnails(false);
                                    }}
                                    className="group relative"
                                >
                                    <div className="aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group-hover:border-blue-500 transition-all">
                                        <Image 
                                            src={`/catalog/${i + 1}.png`} 
                                            alt={`Page ${i + 1}`} 
                                            fill
                                            className="object-cover opacity-70 group-hover:opacity-100 transition-all"
                                            sizes="(max-width: 768px) 50vw, 15vw"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-blue-600/20 transition-all">
                                            <span className="bg-white text-blue-600 px-3 py-1 rounded-full font-black text-xs">PAGE {i+1}</span>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-white/40 text-[10px] font-bold group-hover:text-blue-400">PAGE {i+1}</p>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Bottom Info */}
            <div className="md:hidden p-4 bg-slate-900 flex justify-center border-t border-white/5">
                 <p className="text-[10px] text-white/30 font-bold tracking-[0.2em] uppercase">SDK Batiment • Glissez pour tourner la page</p>
            </div>
        </div>
    );
}
