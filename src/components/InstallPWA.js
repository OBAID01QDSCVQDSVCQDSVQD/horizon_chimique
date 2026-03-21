'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        setDeferredPrompt(null);
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:w-96 bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between z-50 animate-in slide-in-from-bottom border border-slate-700">
            <div className="flex items-center gap-4">
                <div className="bg-primary p-2 rounded-lg">
                    <Download size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Installer l'application</h3>
                    <p className="text-xs text-slate-400">Accès rapide et hors ligne</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => setShowBanner(false)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>
                <button
                    onClick={handleInstallClick}
                    className="bg-primary hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                >
                    INSTALLER
                </button>
            </div>
        </div>
    );
}
