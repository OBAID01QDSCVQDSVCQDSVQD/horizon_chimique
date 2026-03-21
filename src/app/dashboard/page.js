import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, LogOut, Heart, ShoppingBag, Settings } from 'lucide-react';
import Link from 'next/link';

export default async function ClientDashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    // Role redirection
    if (session.user.role === 'admin') {
        redirect('/admin');
    }
    if (session.user.role === 'artisan') {
        redirect('/artisan/dashboard');
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        {session.user.image ? (
                            <img src={session.user.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User size={40} />
                        )}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-2xl font-bold text-slate-900">Bonjour, {session.user.name}</h1>
                        <p className="text-slate-500">Bienvenue sur votre espace client Horizon Chimique.</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
                            Client Particulier
                        </span>
                    </div>
                    {/* Logout Button (managed by Navbar, but nice to have distinct actions here too) */}
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Feature Card 3: Account */}
                    <Link href="/dashboard/settings" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-primary hover:shadow-md transition-all group">
                        <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Settings size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-2">Paramètres</h3>
                        <p className="text-slate-500 text-sm">Modifier votre profil et mot de passe.</p>
                    </Link>

                    {/* Feature Card 1: Favorites (Placeholder) */}
                    <Link href="/products" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-primary hover:shadow-md transition-all group">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Heart size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-2">Mes Favoris</h3>
                        <p className="text-slate-500 text-sm">Retrouvez les produits que vous avez sauvegardés.</p>
                    </Link>

                    {/* Feature Card 2: Catalog */}
                    <Link href="/products" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-primary hover:shadow-md transition-all group">
                        <div className="w-12 h-12 bg-blue-50 text-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={24} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-2">Nos Produits</h3>
                        <p className="text-slate-500 text-sm">Parcourir le catalogue complet.</p>
                    </Link>

                </div>

                {/* Promo Banner */}
                <div className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-2">Besoin d'un conseil technique ?</h2>
                        <p className="text-slate-300 mb-6 max-w-xl">Nos experts sont à votre disposition pour vous guider dans le choix des produits d'étanchéité adaptés à votre projet.</p>
                        <Link href="/contact" className="bg-white text-slate-900 px-6 py-2.5 rounded-lg font-bold hover:bg-slate-100 transition-colors inline-block">
                            Contactez-nous
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
