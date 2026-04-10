'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Bell, Search, Home, LogOut, Menu, X, Package, MessageSquare, LayoutDashboard, Settings, Users, Trophy, Megaphone, Lightbulb, Mail, ShieldCheck, BarChart3, ScrollText, Wrench, Image as ImageIcon, Bot, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminHeader({ user, pendingCount, unreadMessages = 0, pendingUsers = 0, pendingChantiers = 0, moderationCount = 0, pendingRequests = 0 }) {
    const [darkMode, setDarkMode] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const toggleTheme = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setDarkMode(true);
        }
    };

    const navItems = [
        { href: '/admin', icon: <LayoutDashboard size={20} />, label: 'Tableau de bord' },
        { href: '/admin/analytics', icon: <BarChart3 size={20} />, label: 'Analytiques' },
        { href: '/admin/moderation', icon: <ShieldCheck size={20} />, label: 'Modération', badge: moderationCount },
        { href: '/admin/products', icon: <Package size={20} />, label: 'Produits' },
        { href: '/admin/solutions', icon: <Lightbulb size={20} />, label: 'Solutions' },
        { href: '/admin/users', icon: <Users size={20} />, label: 'Utilisateurs', badge: pendingUsers },
        { href: '/admin/messages', icon: <Mail size={20} />, label: 'Messagerie', badge: unreadMessages },
        { href: '/admin/requests', icon: <ClipboardList size={20} />, label: 'Demandes Clients', badge: pendingRequests },
        { href: '/admin/chantiers', icon: <MessageSquare size={20} />, label: 'Chantiers', badge: pendingChantiers },
        { href: '/admin/warranties', icon: <ScrollText size={20} />, label: 'Garanties' },
        { href: '/admin/maintenance', icon: <Wrench size={20} />, label: 'Maintenance' },
        { href: '/admin/campaigns', icon: <Megaphone size={20} />, label: 'Campagnes' },
        { href: '/admin/gallery', icon: <ImageIcon size={20} />, label: 'Galerie (CMS)' },
        { href: '/admin/settings/fidelity', icon: <Trophy size={20} />, label: 'Système Fidélité' },
        { href: '/admin/ai-training', icon: <Bot size={20} />, label: 'AI Training Center' },
        { href: '/admin/settings', icon: <Settings size={20} />, label: 'Paramètres' },
    ];

    return (
        <>
            <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 shadow-sm dark:bg-slate-950 dark:border-slate-800 transition-colors">

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>

                {/* Search Bar (Desktop) */}
                <div className="relative w-96 hidden md:block">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-full bg-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm placeholder-slate-500 transition-all dark:bg-slate-900"
                    />
                </div>

                {/* Mobile Title */}
                <div className="md:hidden text-white font-bold text-lg">HORIZON</div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 text-slate-400">
                        <button
                            onClick={toggleTheme}
                            className="hover:text-amber-400 transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                            title={darkMode ? "Mode Clair" : "Mode Sombre"}
                        >
                            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        <Link href="/" className="hover:text-primary transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800" title="Voir le site">
                            <Home size={18} />
                        </Link>

                        <button className="hover:text-red-400 transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700 relative dark:bg-slate-900 dark:hover:bg-slate-800">
                            <Bell size={18} />
                            {pendingCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        </button>
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-700">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-slate-800 dark:ring-slate-900">
                            {user && user.name ? user.name.substring(0, 2).toUpperCase() : '??'}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className="text-sm font-semibold text-white leading-none">{user ? user.name : 'Invité'}</p>
                            <p className="text-xs text-slate-400 mt-1 uppercase">{user ? user.role : 'Visiteur'}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 dark:bg-slate-950 z-50 flex flex-col shadow-2xl md:hidden"
                        >
                            {/* Drawer Header */}
                            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                                <span className="text-xl font-bold tracking-tight text-primary-light">HORIZON ADMIN</span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Nav Items */}
                            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </div>
                                            {item.badge > 0 && (
                                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Logout */}
                            <div className="p-4 border-t border-slate-800">
                                <Link href="/api/auth/signout" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-3 py-2.5 rounded-lg hover:bg-slate-800">
                                    <LogOut size={20} />
                                    <span>Déconnexion</span>
                                </Link>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
