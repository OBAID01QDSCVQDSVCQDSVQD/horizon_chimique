
import dbConnect from '@/lib/db';
import Warranty from '@/models/Warranty';
import Chantier from '@/models/Chantier';
import User from '@/models/User'; // Import User model to ensure Artisan reference works
import { CheckCircle, ShieldCheck, XCircle, Calendar, MapPin, User as UserIcon, Clock } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering to ensure fresh data on scan
export const dynamic = 'force-dynamic';

async function getWarranty(id) {
    try {
        await dbConnect();
        // Populate necessary fields
        const warranty = await Warranty.findById(id)
            .populate('chantier', 'address clientName clientPhone')
            .populate({
                path: 'artisan',
                select: 'name email companyName phone parentGoldArtisan',
                populate: {
                    path: 'parentGoldArtisan',
                    select: 'name email companyName phone'
                }
            })
            .lean();

        if (!warranty) return null;

        // Convert dates to string for serialization
        return JSON.parse(JSON.stringify(warranty));
    } catch (error) {
        return null;
    }
}

export default async function VerifyWarrantyPage({ params }) {
    const { id } = params;
    const warranty = await getWarranty(id);

    if (!warranty) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
                    <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Certificat Introuvable</h1>
                    <p className="text-slate-500 mb-6">
                        Le code QR que vous avez scanné ne correspond à aucun certificat de garantie valide dans notre système.
                    </p>
                    <Link href="/" className="text-primary font-bold hover:underline">
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    const isActive = warranty.status === 'approved';
    const startDate = new Date(warranty.startDate);
    const endDate = new Date(startDate);
    // Simple logic to add duration years (assuming duration string like "10 Ans")
    const durationYears = parseInt(warranty.duration) || 0;
    endDate.setFullYear(endDate.getFullYear() + durationYears);

    const isExpired = new Date() > endDate;

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 flex justify-center items-center">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">

                {/* Header Status */}
                <div className={`${isActive && !isExpired ? 'bg-green-600' : 'bg-orange-500'} p-8 text-center text-white relative overflow-hidden`}>
                    <div className="relative z-10">
                        {isActive && !isExpired ? (
                            <>
                                <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                    <ShieldCheck size={40} className="text-white" />
                                </div>
                                <h1 className="text-2xl font-bold mb-1">Certificat Authentique</h1>
                                <p className="text-green-100 text-sm">Ce document est valide et enregistré.</p>
                            </>
                        ) : (
                            <>
                                <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                    <Clock size={40} className="text-white" />
                                </div>
                                <h1 className="text-2xl font-bold mb-1">
                                    {isExpired ? 'Garantie Expirée' : 'En Attente / Non Validé'}
                                </h1>
                                <p className="text-orange-100 text-sm">
                                    {isExpired ? `Date de fin: ${endDate.toLocaleDateString()}` : 'Ce certificat est en cours de traitement.'}
                                </p>
                            </>
                        )}
                    </div>
                    {/* Decorative Circles */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-10 -translate-y-10"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-10 translate-y-10"></div>
                </div>

                {/* Content Details */}
                <div className="p-8 space-y-6">

                    {/* Ref & Date */}
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Référence</p>
                            <p className="font-mono font-bold text-slate-700">{warranty.contractNumber || 'EN COURS'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase">Émis le</p>
                            <p className="font-bold text-slate-700">{new Date(warranty.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Artisan Info */}
                    <div>
                        <h3 className="text-sm font-bold text-primary uppercase mb-3 flex items-center gap-2">
                            <UserIcon size={16} /> Applicateur Agréé
                        </h3>
                        {(() => {
                            const displayArtisan = warranty.artisan?.parentGoldArtisan || warranty.artisan;
                            const isChild = !!warranty.artisan?.parentGoldArtisan;

                            return (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="font-bold text-slate-800 text-lg mb-1">
                                        {displayArtisan?.companyName || displayArtisan?.name}
                                    </p>
                                    <p className="text-slate-500 text-sm">{displayArtisan?.email}</p>
                                    {displayArtisan?.phone && <p className="text-slate-500 text-sm">{displayArtisan.phone}</p>}

                                    {isChild && (
                                        <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-400 italic">
                                            Projet exécuté par: <span className="font-bold text-slate-600">{warranty.artisan?.name}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Project Info */}
                    <div>
                        <h3 className="text-sm font-bold text-primary uppercase mb-3 flex items-center gap-2">
                            <MapPin size={16} /> Détails du Projet
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500 text-sm">Client</span>
                                <span className="font-bold text-slate-800">{warranty.clientName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 text-sm">Durée</span>
                                <span className="font-bold text-slate-800">{warranty.duration}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 text-sm">Date d'effet</span>
                                <span className="font-bold text-slate-800">{new Date(warranty.startDate).toLocaleDateString()}</span>
                            </div>
                            {warranty.chantier?.address && (
                                <div className="pt-2 border-t border-slate-100 mt-2">
                                    <p className="text-slate-500 text-xs mb-1">Localisation</p>
                                    <p className="text-sm font-medium text-slate-700">{warranty.chantier.address}</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer Brand */}
                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                        Vérifié par Horizon Chimique Platform
                    </p>
                </div>
            </div>
        </div>
    );
}
