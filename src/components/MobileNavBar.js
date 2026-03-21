'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Phone, User, Briefcase } from 'lucide-react';

export default function MobileNavBar() {
    const pathname = usePathname();

    const isActive = (path) => pathname === path;

    const navItems = [
        { name: 'Accueil', path: '/', icon: <Home size={22} /> },
        { name: 'Produits', path: '/products', icon: <Package size={22} /> },
        { name: 'Réalisations', path: '/realisations', icon: <Briefcase size={22} /> },
        { name: 'Contact', path: '/contact', icon: <Phone size={22} /> },
        { name: 'Profil', path: '/profile', icon: <User size={22} /> },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 md:hidden z-40 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(item.path)
                            ? 'text-primary'
                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        {item.icon}
                        <span className="text-[10px] font-medium">{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
