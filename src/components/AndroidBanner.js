'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AndroidBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosed, setIsClosed] = useState(false);

    useEffect(() => {
        // Check if Android and not already in standalone/pwa mode
        const isAndroid = /Android/i.test(window.navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        
        if (!isAndroid || isStandalone) return;

        const checkVisibility = () => {
            const lastDismissed = localStorage.getItem('android-banner-dismissed');
            const now = Date.now();
            
            // Show only if never dismissed OR dismissed more than 5 minutes ago
            if (!lastDismissed || (now - parseInt(lastDismissed) > 5 * 60 * 1000)) {
                // Show after 3 seconds
                const timer = setTimeout(() => {
                    setIsVisible(true);
                }, 3000);
                return timer;
            }
        };

        const timer = checkVisibility();

        // Check every 30 seconds if we should show it (in case 5 mins passed while on page)
        const interval = setInterval(() => {
            if (!isVisible) {
                checkVisibility();
            }
        }, 30000);

        return () => {
            if (timer) clearTimeout(timer);
            clearInterval(interval);
        };
    }, [isVisible]);

    const handleClose = () => {
        setIsVisible(false);
        setIsClosed(true);
        localStorage.setItem('android-banner-dismissed', Date.now().toString());
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/sdk-batiment-app.apk';
        link.download = 'sdk-batiment-app.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        handleClose();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-24 left-4 right-4 z-[9999] md:hidden"
                >
                    <div className="bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-100 p-3.5 flex items-center justify-between gap-4 overflow-hidden relative">
                        {/* Decorative background element */}
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-50/50 rounded-full z-0"></div>
                        
                        <div className="flex items-center gap-3 z-10">
                            <div className="bg-[#3DDC84] p-2.5 rounded-xl text-white float-animation">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997zm11.436-7.2843l1.9-3.292c.1132-.194.0475-.444-.1465-.5562-.194-.1122-.4444-.0475-.5562.1465l-1.927 3.3392C15.698 7.026 13.916 6.5771 12 6.5771s-3.698.449-5.1843 1.1176l-1.927-3.3392c-.1118-.194-.3619-.2587-.5562-.1465-.194.1122-.2597.3622-.1465.5562l1.9 3.292C3.1558 9.6105 1 12.569 1 16.0396V17h22v-.9604c0-3.4706-2.1558-6.4291-5.087-7.9825z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 text-sm tracking-tight leading-tight">SDK BATIMENT</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Application Officielle</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 z-10">
                            <button
                                onClick={handleDownload}
                                className="bg-[#1D4ED8] hover:bg-blue-700 text-white text-[11px] font-black px-5 py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                            >
                                INSTALLER
                            </button>
                            <button
                                onClick={handleClose}
                                className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                    
                    <style jsx>{`
                        @keyframes float {
                            0% { transform: translateY(0px); }
                            50% { transform: translateY(-3px); }
                            100% { transform: translateY(0px); }
                        }
                        .float-animation {
                            animation: float 3s ease-in-out infinite;
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
