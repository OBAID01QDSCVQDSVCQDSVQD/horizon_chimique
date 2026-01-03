'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Accueil', href: '/' },
        { name: 'Produits', href: '/products' },
        { name: 'Solutions par métier', href: '/#solutions' },
        { name: 'Centre Technique', href: '/#technical' },
        { name: 'Actualités & Blog', href: '/blog' },
        { name: 'À propos', href: '/#about' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 dark:bg-slate-900/95 dark:border-slate-800 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-24"> {/* Increased height slightly for logo */}
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0 group flex items-center gap-3">
                        <div className="relative w-48 h-12 md:w-56 md:h-16">
                            <Image
                                src="/logo.png"
                                alt="HORIZON CHIMIQUE"
                                fill
                                className="object-contain" // Ensures logo fits nicely without distortion
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden xl:flex space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-slate-600 hover:text-primary font-medium transition-colors text-sm uppercase tracking-wide py-2"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Button (Desktop) - Optional, keeping for layout balance */}
                    <div className="hidden md:flex xl:hidden">
                        <Link href="/products" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition shadow-lg shadow-blue-200">
                            Produits
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="xl:hidden flex items-center">
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
                        className="xl:hidden bg-white border-b border-slate-100 overflow-hidden dark:bg-slate-900 shadow-xl"
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
