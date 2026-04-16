'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    const [settings, setSettings] = useState({
        companyName: 'SDK BATIMENT',
        address: 'Tunis, Tunisie',
        phone: '+216 53 520 222',
        email: 'contact@sdk-batiment.tn',
        website: 'www.horizon-chimique.tn',
        logoUrl: '/logo.png'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data.success && data.data) {
                    setSettings(prev => ({
                        ...prev,
                        ...data.data,
                        // Always use the hardcoded default logoUrl to prevent disappearing.
                        logoUrl: prev.logoUrl
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch footer settings", error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <footer className="bg-slate-900 text-white border-t border-slate-800 pb-20 md:pb-0"> {/* Extra padding for Mobile Nav */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center md:text-left">
                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="mb-6 relative w-48 mx-auto md:mx-0 h-auto min-h-[64px] flex items-center justify-center md:justify-start">
                            <Image src={settings.logoUrl} alt={settings.companyName} width={192} height={70} className="object-contain grayscale invert brightness-200 opacity-90" />
                        </div>
                        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                            Solutions innovantes d'étanchéité et de protection pour le bâtiment.
                        </p>
                        <div className="flex justify-center md:justify-start space-x-4">
                            <a href="#" className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-primary transition-all"><Facebook size={18} /></a>
                            <a href="#" className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-primary transition-all"><Instagram size={18} /></a>
                            <a href="#" className="bg-slate-800 p-2 rounded-full text-slate-400 hover:text-white hover:bg-primary transition-all"><Linkedin size={18} /></a>
                        </div>
                    </div>

                    {/* Menu - Hidden on Mobile */}
                    <div className="hidden md:block">
                        <h4 className="text-lg font-semibold mb-6 text-slate-200 uppercase tracking-wider text-sm">Navigation</h4>
                        <ul className="space-y-3 text-slate-400 text-sm">
                            <li><Link href="/" className="hover:text-primary transition-colors">Accueil</Link></li>
                            <li><Link href="/about" className="hover:text-primary transition-colors">À propos</Link></li>
                            <li><Link href="/products" className="hover:text-primary transition-colors">Nos Produits</Link></li>
                            <li><Link href="/#solutions" className="hover:text-primary transition-colors">Solutions</Link></li>
                        </ul>
                    </div>

                    {/* Categories - Hidden on Mobile */}
                    <div className="hidden md:block">
                        <h4 className="text-lg font-semibold mb-6 text-slate-200 uppercase tracking-wider text-sm">Produits</h4>
                        <ul className="space-y-3 text-slate-400 text-sm">
                            <li><Link href="/products?category=etancheite" className="hover:text-primary transition-colors">Étanchéité</Link></li>
                            <li><Link href="/products?category=adjuvants" className="hover:text-primary transition-colors">Adjuvants</Link></li>
                            <li><Link href="/products?category=revetements" className="hover:text-primary transition-colors">Revêtements</Link></li>
                        </ul>
                    </div>

                    {/* Contact - Simpler on Mobile */}
                    <div className="col-span-1">
                        <h4 className="text-lg font-semibold mb-6 text-slate-200 uppercase tracking-wider text-sm hidden md:block">Contact</h4>
                        <ul className="space-y-4 text-slate-400 text-sm inline-block text-left md:block">
                            <li className="flex items-start gap-3 justify-center md:justify-start">
                                <MapPin className="flex-shrink-0 mt-1 text-primary" size={18} />
                                <span>{settings.address}</span>
                            </li>
                            <li className="flex items-center gap-3 justify-center md:justify-start">
                                <Phone className="flex-shrink-0 text-primary" size={18} />
                                <span>{settings.phone}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm gap-4">
                    <p>&copy; {new Date().getFullYear()} SDK BATIMENT.</p>
                    <div className="flex space-x-6">
                        <Link href="/privacy" className="hover:text-white transition-colors text-xs">Confidentialité</Link>
                        <Link href="/terms" className="hover:text-white transition-colors text-xs">Conditions</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
