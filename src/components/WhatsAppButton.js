'use client';

import { MessageCircle } from 'lucide-react';
import { trackFbEvent } from '@/utils/trackFbEvent';

export default function WhatsAppButton({ phone, label = "Discuter par WhatsApp", className, fullWidth = false }) {
    const handleWhatsAppClick = () => {
        trackFbEvent('Contact', { content_name: 'WhatsAppClick' });
    };

    if (!phone) return null;

    const baseClasses = "bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2 justify-center";
    const combinedClasses = `${baseClasses} ${className || 'px-6 py-3'} ${fullWidth ? 'w-full' : ''}`;

    // Clean phone
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.startsWith('216') ? cleanPhone : `216${cleanPhone}`;

    return (
        <a 
            href={`https://wa.me/${finalPhone}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className={combinedClasses}
            onClick={handleWhatsAppClick}
        >
            <MessageCircle size={18} /> {label}
        </a>
    );
}
