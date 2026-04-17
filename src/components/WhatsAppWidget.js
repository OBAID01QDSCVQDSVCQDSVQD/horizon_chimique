'use client';

import { useState, useEffect } from 'react';
import { trackFbEvent } from '@/utils/trackFbEvent';
import { X } from 'lucide-react';

function WhatsAppBusinessIcon({ size = 32 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="#25D366"/>
            <path d="M24 10C16.268 10 10 16.268 10 24c0 2.637.717 5.104 1.963 7.22L10 38l6.98-1.83A13.94 13.94 0 0024 38c7.732 0 14-6.268 14-14S31.732 10 24 10z" fill="white"/>
            <path d="M31.5 27.48c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01s-.52.07-.8.37c-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" fill="#25D366"/>
            <circle cx="35" cy="35" r="8" fill="#128C7E"/>
            <text x="35" y="39" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">B</text>
        </svg>
    );
}

const AGENTS = [
    {
        id: 1,
        name: "SDK Bâtiment Support",
        role: "Support & Assistance",
        phone: "53520222",
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
        message: "Bonjour ! Comment pouvons-nous vous aider aujourd'hui ?"
    }
];

export default function WhatsAppWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show after 3 seconds delay for performance
        const timer = setTimeout(() => setIsVisible(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    const handleWhatsAppClick = (phone) => {
        trackFbEvent('Contact', { content_name: 'WhatsAppClick', agent: 'Service Client' });
        
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const finalPhone = cleanPhone.startsWith('216') ? cleanPhone : `216${cleanPhone}`;
        window.open(`https://wa.me/${finalPhone}?text=Bonjour, j'ai une question concernant vos produits Horizon Chimique.`, '_blank');
    };

    return (
        <div className="fixed bottom-24 lg:bottom-10 right-6 z-[9999] flex flex-col items-end pointer-events-none">
            {/* Popup Window */}
            {isOpen && (
                <div className="mb-4 w-[320px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
                    {/* Header */}
                    <div className="bg-[#25D366] p-5 text-white">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-lg">Discuter avec nous</h3>
                                <p className="text-xs opacity-90 text-green-50">Cliquez sur un conseiller ci-dessous</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Content / Agents List */}
                    <div className="p-4 bg-slate-50 space-y-3">
                        {AGENTS.map((agent) => (
                            <button
                                key={agent.id}
                                onClick={() => handleWhatsAppClick(agent.phone)}
                                className="w-full bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-3 group text-left"
                            >
                                <div className="relative">
                                    <img src={agent.image} alt={agent.name} className="w-12 h-12 rounded-full border-2 border-green-100" />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-green-600 transition-colors">{agent.name}</h4>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{agent.role}</p>
                                </div>
                                <div className="bg-green-50 p-2 rounded-full text-green-600 group-hover:bg-green-100 transition-colors">
                                    <WhatsAppBusinessIcon size={20} />
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Footer / Branding */}
                    <div className="p-3 text-center bg-white">
                        <p className="text-[10px] text-slate-400 font-medium">Réponse rapide via WhatsApp</p>
                    </div>
                </div>
            )}

            {/* Floating Bubble Button */}
            <div className="relative pointer-events-auto group">
                {!isOpen && (
                    <div className="absolute bottom-full right-4 mb-4 whitespace-nowrap bg-white text-slate-700 py-2 px-4 rounded-xl shadow-xl border border-slate-100 font-bold text-xs animate-bounce animate-in fade-in zoom-in group-hover:block hidden">
                        Besoin d'aide ? 💬
                    </div>
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90
                        ${isOpen ? 'bg-slate-100 text-slate-500 rotate-90' : 'bg-[#25D366] text-white hover:bg-[#128C7E] hover:scale-110'}
                    `}
                    aria-label="Contact support"
                >
                    {isOpen ? <X size={28} /> : (
                        <div className="relative">
                            <WhatsAppBusinessIcon size={36} />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-[#25D366] rounded-full animate-ping"></div>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
}
