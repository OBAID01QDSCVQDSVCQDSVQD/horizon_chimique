'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Download, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';

const TOTAL_PAGES = 32;

export default function ImageCatalog({ downloadUrl }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef(null);

    const nextPage = () => setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1));
    const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            containerRef.current.requestFullscreen?.() || containerRef.current.webkitRequestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.() || document.webkitExitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleKeys = (e) => {
            if (e.key === 'ArrowRight') nextPage();
            if (e.key === 'ArrowLeft') prevPage();
            if (e.key === 'Escape') setIsFullscreen(false);
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, []);

    return (
        <div 
            ref={containerRef}
            className={`
                relative flex flex-col items-center justify-center 
                ${isFullscreen ? 'fixed inset-0 bg-slate-900 z-[9999] p-4 lg:p-10' : 'w-full min-h-[70vh] py-10 bg-slate-50 rounded-3xl border border-slate-200'}
                transition-all duration-300
            `}
        >
            {/* Header / Toolbar */}
            <div className="absolute top-4 left-0 right-0 px-6 flex justify-between items-center z-20 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/50 text-slate-900 font-black text-sm pointer-events-auto">
                    Page {currentPage} / {TOTAL_PAGES}
                </div>

                <div className="flex gap-2 pointer-events-auto">
                     <button 
                        onClick={() => setZoom(z => z > 1 ? z - 0.5 : 1)}
                        className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 text-slate-700 hover:text-blue-600 transition-all active:scale-90"
                    >
                        <ZoomOut size={20} />
                    </button>
                    <button 
                        onClick={() => setZoom(z => z < 3 ? z + 0.5 : 3)}
                        className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 text-slate-700 hover:text-blue-600 transition-all active:scale-90"
                    >
                        <ZoomIn size={20} />
                    </button>
                    <button 
                        onClick={toggleFullscreen}
                        className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/50 text-slate-700 hover:text-blue-600 transition-all active:scale-90"
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    {downloadUrl && (
                         <a 
                            href={downloadUrl} 
                            download 
                            className="bg-blue-600 p-3 rounded-2xl shadow-xl text-white hover:bg-blue-700 transition-all active:scale-90 flex items-center gap-2"
                        >
                            <Download size={20} />
                        </a>
                    )}
                </div>
            </div>

            {/* Page Display Area */}
            <div className="relative w-full flex-grow flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: zoom }}
                        exit={{ opacity: 0, x: -50, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-[900px] h-full flex items-center justify-center"
                    >
                        <Image
                            src={`/catalog/${currentPage}.png`}
                            alt={`Catalogue Page ${currentPage}`}
                            width={1200}
                            height={1600}
                            className={`
                                w-auto h-auto max-h-full max-w-full rounded-lg shadow-2xl 
                                ${isFullscreen ? 'shadow-blue-500/20' : 'shadow-slate-300'}
                                object-contain select-none
                            `}
                            priority={currentPage <= 2}
                            quality={100}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Desktop Navigation Arrows */}
                <button 
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="absolute left-4 lg:left-10 bg-white/20 hover:bg-white/50 backdrop-blur-sm p-4 rounded-full text-slate-800 disabled:opacity-0 transition-all z-10 hidden md:flex"
                >
                    <ChevronLeft size={32} />
                </button>
                <button 
                    onClick={nextPage}
                    disabled={currentPage === TOTAL_PAGES}
                    className="absolute right-4 lg:right-10 bg-white/20 hover:bg-white/50 backdrop-blur-sm p-4 rounded-full text-slate-800 disabled:opacity-0 transition-all z-10 hidden md:flex"
                >
                    <ChevronRight size={32} />
                </button>
            </div>

            {/* Pagination Thumbnails Scroll (Desktop Only) */}
            <div className={`
                ${isFullscreen ? 'absolute bottom-8 left-1/2 -translate-x-1/2' : 'mt-8'}
                max-w-[700px] w-full px-6 flex gap-2 overflow-x-auto pb-4 hide-scrollbar justify-center
            `}>
                {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`
                            min-w-[40px] h-[54px] rounded-lg border-2 transition-all overflow-hidden flex-shrink-0
                            ${currentPage === i + 1 ? 'border-blue-600 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}
                        `}
                    >
                        <Image 
                            src={`/catalog/${i + 1}.png`} 
                            alt={`Thumb ${i + 1}`} 
                            width={40} 
                            height={54} 
                            className="object-cover w-full h-full"
                        />
                    </button>
                ))}
            </div>

            {/* Mobile Navigation Controls */}
            <div className="flex md:hidden w-full px-6 py-4 justify-between items-center bg-white border-t border-slate-100 rounded-b-3xl mt-auto">
                <button 
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="flex-1 py-3 text-slate-600 font-bold disabled:opacity-30"
                >
                    Précédent
                </button>
                <div className="w-px h-6 bg-slate-200"></div>
                <button 
                    onClick={nextPage}
                    disabled={currentPage === TOTAL_PAGES}
                    className="flex-1 py-3 text-blue-600 font-bold disabled:opacity-30"
                >
                    Suivant
                </button>
            </div>
        </div>
    );
}
