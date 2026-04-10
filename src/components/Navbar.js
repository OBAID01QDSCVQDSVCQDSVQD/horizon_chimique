'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LogIn, UserCircle, LogOut, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState('/logo.png');
    const [userImage, setUserImage] = useState(null);

    useEffect(() => {
        if (session?.user) {
            setUserImage(session.user.image);
            // Fetch fresh data to handle stale sessions
            fetch('/api/profile')
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.user.image) {
                        setUserImage(data.user.image);
                    }
                })
                .catch(err => console.error("Failed to refresh profile", err));
        }
    }, [session]);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                // We fetch settings for other purposes, but we keep the local logo as default 
                // as requested to prevent it from changing after 2 seconds.
                await fetch('/api/settings');
            } catch (e) {
                console.error("Failed to load settings in Navbar", e);
            }
        };
        fetchLogo();
    }, []);

    // ... (rest of code)

    // Desktop View Update (Searching for line 83 approx)
    // I need to use replace_file_content carefully.


    const navLinks = [
        { name: 'Accueil', href: '/' },
        { name: 'À propos', href: '/about' },
        { name: 'Produits', href: '/products' },
        { name: 'Solutions', href: '/solutions' },
        { name: 'Réalisations', href: '/realisations' },
        { name: 'Galerie', href: '/gallery' },
        { name: 'Contact', href: '/contact' },
    ];

    const getDashboardLink = () => {
        if (!session) return '/login';
        if (session.user.role === 'admin') return '/admin';
        if (session.user.role === 'artisan') return '/artisan/dashboard';
        return '/dashboard'; // Client
    };

    return (
        <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 dark:bg-slate-900/95 dark:border-slate-800 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 group flex items-center">
                        <div className="relative w-36 h-10 md:w-48 md:h-12 gap-3">
                            <Image
                                src={logoUrl}
                                alt="SDK BATIMENT"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-slate-600 hover:text-primary font-medium transition-colors text-xs uppercase tracking-wide py-2 whitespace-nowrap"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Auth Section Desktop */}
                        <div className="pl-4 border-l border-slate-200 flex items-center gap-3">
                            <Link 
                                href="/sdk-batiment-app.apk" 
                                target="_blank"
                                className="flex items-center gap-1.5 text-xs font-bold text-[#3DDC84] bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors border border-green-200 whitespace-nowrap"
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997zm11.436-7.2843l1.9-3.292c.1132-.194.0475-.444-.1465-.5562-.194-.1122-.4444-.0475-.5562.1465l-1.927 3.3392C15.698 7.026 13.916 6.5771 12 6.5771s-3.698.449-5.1843 1.1176l-1.927-3.3392c-.1118-.194-.3619-.2587-.5562-.1465-.194.1122-.2597.3622-.1465.5562l1.9 3.292C3.1558 9.6105 1 12.569 1 16.0396V17h22v-.9604c0-3.4706-2.1558-6.4291-5.087-7.9825z"/>
                                </svg>
                                Android
                            </Link>

                            {session ? (
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={getDashboardLink()}
                                        className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-primary transition-colors bg-slate-100 pl-1 pr-3 py-1 rounded-full border border-slate-200"
                                    >
                                        {userImage ? (
                                            <img src={userImage} alt={session.user.name || 'User'} className="w-8 h-8 rounded-full object-cover border border-white shadow-sm" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs border border-white shadow-sm">
                                                {session.user.name ? session.user.name.substring(0, 2).toUpperCase() : 'U'}
                                            </div>
                                        )}
                                        <span className="hidden lg:inline ml-1">{session.user.name ? session.user.name.split(' ')[0] : 'Menu'}</span>
                                    </Link>
                                    <button
                                        onClick={() => signOut()}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                        title="Se déconnecter"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-all shadow-md shadow-blue-200 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap"
                                >
                                    <LogIn size={14} /> Se connecter
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center gap-4">
                        {/* Shortcuts Mobile */}
                        <Link href="/gallery" className="text-slate-600 hover:text-primary transition-colors p-2" aria-label="Galerie">
                            <ImageIcon size={24} />
                        </Link>

                        {/* Auth Icon Mobile (if logged in) */}
                        {session && (
                            <Link href={getDashboardLink()} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary overflow-hidden border border-slate-200">
                                {userImage ? (
                                    <img src={userImage} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle size={20} />
                                )}
                            </Link>
                        )}

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-800 hover:text-primary transition-colors p-2"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-b border-slate-100 overflow-hidden dark:bg-slate-900 shadow-xl"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="block px-4 py-3 text-base font-medium text-slate-700 hover:text-primary hover:bg-blue-50 rounded-md transition-colors border-l-4 border-transparent hover:border-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="border-t border-slate-100 mt-4 pt-4 px-4 space-y-2">
                                <Link
                                    href="/sdk-batiment-app.apk"
                                    target="_blank"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-green-50 text-[#3DDC84] font-bold rounded-lg mb-2 border border-green-200 shadow-sm"
                                >
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                        <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993.0004.5511-.4482.9997-.9993.9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997zm11.436-7.2843l1.9-3.292c.1132-.194.0475-.444-.1465-.5562-.194-.1122-.4444-.0475-.5562.1465l-1.927 3.3392C15.698 7.026 13.916 6.5771 12 6.5771s-3.698.449-5.1843 1.1176l-1.927-3.3392c-.1118-.194-.3619-.2587-.5562-.1465-.194.1122-.2597.3622-.1465.5562l1.9 3.292C3.1558 9.6105 1 12.569 1 16.0396V17h22v-.9604c0-3.4706-2.1558-6.4291-5.087-7.9825z"/>
                                    </svg>
                                    Télécharger l'App Android
                                </Link>
                                {session ? (
                                    <>
                                        <Link
                                            href={getDashboardLink()}
                                            onClick={() => setIsOpen(false)}
                                            className="block w-full text-center py-3 bg-slate-100 text-slate-800 font-bold rounded-lg mb-2"
                                        >
                                            Mon Espace ({session.user.role})
                                        </Link>
                                        <button
                                            onClick={() => signOut()}
                                            className="block w-full text-center py-3 text-red-500 font-medium hover:bg-red-50 rounded-lg"
                                        >
                                            Se déconnecter
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="block w-full text-center py-3 bg-primary text-white font-bold rounded-lg shadow-md"
                                    >
                                        Se connecter
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
