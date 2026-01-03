import Link from 'next/link';
import { Package, MessageSquare, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-100 flex">
            <Toaster position="top-right" />

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="h-20 flex items-center px-6 border-b border-slate-800">
                    <span className="text-xl font-bold tracking-tight text-primary-light">HORIZON ADMIN</span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    <NavItem href="/admin" icon={<LayoutDashboard size={20} />} label="Tableau de bord" />
                    <NavItem href="/admin/products" icon={<Package size={20} />} label="Produits" active />
                    <NavItem href="#" icon={<MessageSquare size={20} />} label="Messages Clients" />
                    <NavItem href="#" icon={<Settings size={20} />} label="Paramètres" />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-3 py-2 rounded-md hover:bg-slate-800">
                        <LogOut size={20} />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header (visible only on small screens) */}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Admin Header */}
                <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shadow-sm">
                    {/* Search Bar */}
                    <div className="relative w-96">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full bg-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm placeholder-slate-500 transition-all"
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6">
                        {/* Admin Dropdown Text */}
                        <div className="hidden md:flex items-center gap-1 text-slate-200 text-sm font-medium cursor-pointer hover:text-white">
                            Admin <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-4 text-slate-400">
                            <button className="hover:text-amber-400 transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg></button>
                            <Link href="/" className="hover:text-primary transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg></Link>
                            <button className="hover:text-red-400 transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700 relative">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            </button>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-slate-800">
                                OH
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-semibold text-white leading-none">Obaid HIAOUI</p>
                                <p className="text-xs text-slate-400 mt-1">Super Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto bg-slate-100 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavItem({ href, icon, label, active = false }) {
    // In a real app, use usePathname to determine active state
    return (
        <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            {icon}
            <span>{label}</span>
        </Link>
    )
}
