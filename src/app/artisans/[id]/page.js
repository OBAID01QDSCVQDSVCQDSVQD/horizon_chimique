import dbConnect from '@/lib/db';
import User from '@/models/User';
import Realization from '@/models/Realization';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, Mail, Globe, Calendar, CheckCircle2, Star, ArrowRight } from 'lucide-react';
import ReviewSection from '@/components/ReviewSection';

export default async function ArtisanProfile({ params }) {
    const { id } = params;

    await dbConnect();

    let artisan;
    let projects = [];

    try {
        artisan = await User.findById(id);
        if (!artisan || artisan.role !== 'artisan') {
            return notFound();
        }
        projects = await Realization.find({ artisan: id, isVisible: true }).sort({ createdAt: -1 });
    } catch (e) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header / Cover */}
            <div className="h-64 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
                    <div className="p-8 sm:p-10 flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar */}
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg bg-slate-200 overflow-hidden flex-shrink-0">
                            {artisan.image ? (
                                <img src={artisan.image} alt={artisan.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-4xl">
                                    {artisan.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 w-full text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                        {artisan.companyName || artisan.name}
                                        {(() => {
                                            const isGold = artisan.fidelityRank === 'gold' || (!artisan.fidelityRank && (artisan.points || 0) >= 5000);
                                            const isSilver = artisan.fidelityRank === 'silver' || (!artisan.fidelityRank && (artisan.points || 0) >= 1000);

                                            if (isGold) return <span className="bg-gradient-to-br from-yellow-300 to-yellow-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white ring-1 ring-yellow-200">🥇</span>;
                                            if (isSilver) return <span className="bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md border-2 border-white ring-1 ring-slate-200">🥈</span>;
                                            return <span className="bg-gradient-to-br from-orange-300 to-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm border-2 border-white ring-1 ring-orange-200">🥉</span>;
                                        })()}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1
                                            ${artisan.fidelityRank === 'gold' || (!artisan.fidelityRank && (artisan.points || 0) >= 5000) ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                                                artisan.fidelityRank === 'silver' || (!artisan.fidelityRank && (artisan.points || 0) >= 1000) ? 'bg-slate-50 text-slate-700 border-slate-200' :
                                                    'bg-orange-50 text-orange-800 border-orange-200'}`}>
                                            <Star size={12} className="fill-current" />
                                            {artisan.fidelityRank === 'gold' || (!artisan.fidelityRank && (artisan.points || 0) >= 5000) ? 'Membre Or' :
                                                artisan.fidelityRank === 'silver' || (!artisan.fidelityRank && (artisan.points || 0) >= 1000) ? 'Membre Argent' : 'Membre Bronze'}
                                        </span>
                                        {artisan.specialty && (
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100">
                                                {artisan.specialty}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <a href={`https://wa.me/${artisan.phone?.replace(/\s+/g, '')}`} target="_blank" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2">
                                    <Phone size={18} /> Contacter
                                </a>
                            </div>

                            {artisan.bio && (
                                <p className="text-slate-600 mb-6 leading-relaxed max-w-2xl">{artisan.bio}</p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-500 border-t border-slate-100 pt-6">
                                {artisan.address && (
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <MapPin size={16} className="text-slate-400" /> {artisan.address}
                                    </div>
                                )}
                                {artisan.email && (
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <Mail size={16} className="text-slate-400" /> {artisan.email}
                                    </div>
                                )}
                                {artisan.website && (
                                    <a href={artisan.website} target="_blank" className="flex items-center justify-center md:justify-start gap-2 hover:text-primary hover:underline">
                                        <Globe size={16} className="text-slate-400" /> Site Web
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mb-12">
                    <ReviewSection artisanId={artisan._id.toString()} />
                </div>

                {/* Projects Gallery Section */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Réalisations</h2>
                            <p className="text-slate-500">Les derniers chantiers de {artisan.name}</p>
                        </div>
                        <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                            {projects.length} Projets
                        </span>
                    </div>

                    {projects.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-400 font-medium">Cet artisan n'a pas encore publié de réalisations.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <Link
                                    href={`/realisations/${project._id}`}
                                    key={project._id}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={project.images[0]}
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            {project.location && (
                                                <div className="flex items-center gap-1 text-xs font-bold mb-1 opacity-90">
                                                    <MapPin size={12} /> {project.location}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">{project.description}</p>

                                        <div className="flex items-center gap-2 mt-auto">
                                            {project.tags?.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-[10px] uppercase font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                                                    {tag}
                                                </span>
                                            ))}
                                            {project.tags?.length > 3 && (
                                                <span className="text-[10px] font-bold text-slate-400">+{project.tags.length - 3}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
