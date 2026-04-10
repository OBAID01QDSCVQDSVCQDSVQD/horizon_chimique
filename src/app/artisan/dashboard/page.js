import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { Hammer, Wallet, PlusSquare, UserCircle, Briefcase, Image as ImageIcon, ScrollText, Calculator } from 'lucide-react';
import Link from 'next/link';
import LocationUpdater from '@/components/LocationUpdater';

// Force dynamic rendering to ensure fresh point/rank data
export const dynamic = 'force-dynamic';

export default async function ArtisanDashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    if (session.user.role !== 'artisan') {
        redirect('/'); // Redirect non-artisans
    }

    await dbConnect();
    const user = await User.findById(session.user.id);

    // Rank Calculation
    let rank = 'Membre Bronze 🥉';
    let rankId = user.fidelityRank || 'bronze'; // Map to manual rank if exists

    // If manual rank is set, use it. Otherwise fallback to points
    if (user.fidelityRank === 'gold') {
        rank = 'Maître Or 🥇';
    } else if (user.fidelityRank === 'silver') {
        rank = 'Artisan Argent 🥈';
    } else if (user.fidelityRank === 'bronze') {
        rank = 'Membre Bronze 🥉';
    } else {
        // Fallback point calculation for legacy or undefined
        if (user.points >= 5000) {
            rank = 'Maître Or 🥇';
            rankId = 'gold';
        } else if (user.points >= 1000) {
            rank = 'Artisan Argent 🥈';
            rankId = 'silver';
        }
    }

    let nextRankPoints = rankId === 'gold' ? 0 : (rankId === 'silver' ? 5000 : 1000);
    let progress = 0;
    if (rankId === 'bronze') progress = Math.min((user.points / 1000) * 100, 100);
    else if (rankId === 'silver') progress = Math.min(((user.points - 1000) / 4000) * 100, 100);
    else progress = 100;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <LocationUpdater />
            {/* Header */}
            <div className="bg-slate-900 text-white pt-24 pb-12 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center overflow-hidden">
                        {user.image ? (
                            <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle size={64} className="text-slate-500" />
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-3">
                            <h1 className="text-3xl font-bold">{user.companyName || user.name}</h1>
                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 shadow-sm animate-pulse">
                                {rank}
                            </span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-slate-300">
                            <Briefcase size={16} />
                            <span className="uppercase tracking-wide font-bold text-sm bg-primary/20 px-3 py-1 rounded-full text-primary border border-primary/30">
                                {user.specialty || 'Artisan'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20 space-y-6">

                {/* Points Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider">Mon Solde Fidelité</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-slate-900">{user.points}</span>
                            <span className="text-sm font-bold text-primary">PTS</span>
                        </div>
                        {/* Progress Bar for next rank */}
                        {user.points < 5000 && (
                            <div className="mt-2 w-32 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-amber-400 h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            </div>
                        )}
                    </div>
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
                        <Wallet size={32} />
                    </div>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/artisan/chantiers/new" className="bg-primary text-white p-6 rounded-2xl shadow-lg hover:bg-primary-dark transition-all flex items-center justify-between group">
                        <div className="text-left">
                            <span className="block font-bold text-lg">Nouveau Chantier</span>
                            <span className="text-blue-100 text-sm">Déclarer un achat & gagner</span>
                        </div>
                        <PlusSquare size={32} className="group-hover:scale-110 transition-transform" />
                    </Link>

                    <Link href="/artisan/chantiers" className="bg-white text-slate-700 p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between group">
                        <div className="text-left">
                            <span className="block font-bold text-lg">Mes Chantiers</span>
                            <span className="text-slate-400 text-sm">Historique des déclarations</span>
                        </div>
                        <Hammer size={32} className="text-slate-300 group-hover:text-primary transition-colors" />
                    </Link>

                    {/* Warranty Button */}
                    <Link href="/artisan/warranties" className="bg-white text-slate-700 p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between group">
                        <div className="text-left">
                            <span className="block font-bold text-lg">Mes Garanties</span>
                            <span className="text-slate-400 text-sm">Certificats & Demandes</span>
                        </div>
                        <ScrollText size={32} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                    </Link>

                    {/* AI Calculator Button - NEW */}
                    <Link href="/artisan/calculator" className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between group transform hover:-translate-y-1">
                        <div className="text-left">
                            <span className="block font-bold text-lg flex items-center gap-2">Smart Devis <span className="bg-primary px-2 py-0.5 rounded text-[10px] font-black uppercase">IA</span></span>
                            <span className="text-slate-300 text-sm">Calculateur intelligent</span>
                        </div>
                        <Calculator size={32} className="text-white/50 group-hover:text-white transition-colors" />
                    </Link>

                    {/* Portfolio Button */}
                    <Link href="/artisan/realisations" className="bg-white text-slate-700 p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between group">
                        <div className="text-left">
                            <span className="block font-bold text-lg">Mon Portfolio</span>
                            <span className="text-slate-400 text-sm">Galerie de mes projets</span>
                        </div>
                        <ImageIcon size={32} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
                    </Link>

                    <Link href="/artisan/settings" className="bg-slate-50 text-slate-700 p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between group">
                        <div className="text-left">
                            <span className="block font-bold text-lg">Mon Profil</span>
                            <span className="text-slate-400 text-sm">Paramètres et infos</span>
                        </div>
                        <UserCircle size={32} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </Link>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                    <p>
                        <strong>Comment gagner des points ?</strong> Déclarez vos chantiers et soumettez vos factures pour cumuler des points et débloquer des cadeaux exclusifs.
                    </p>
                </div>

            </div>
        </div>
    );
}
