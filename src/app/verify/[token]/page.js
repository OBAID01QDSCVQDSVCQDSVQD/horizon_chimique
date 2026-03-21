'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, AlertTriangle, Star, ShieldCheck, User, Ruler, Package } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function VerifyPage() {
    const { token } = useParams();
    const [chantier, setChantier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rating, setRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchChantier = async () => {
            try {
                const res = await fetch(`/api/verify/${token}`);
                const data = await res.json();
                if (data.success) {
                    setChantier(data.chantier);
                } else {
                    setError(data.error);
                }
            } catch (err) {
                setError("Erreur de connexion.");
            } finally {
                setLoading(false);
            }
        };
        fetchChantier();
    }, [token]);

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/verify/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating })
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                toast.success("Validation enregistrée !");
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error("Erreur lors de la validation.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <AlertTriangle size={32} />
                </div>
                <h1 className="text-xl font-bold text-slate-800 mb-2">Lien Invalide ou Expiré</h1>
                <p className="text-slate-500 mb-6">{error}</p>
                <p className="text-sm text-slate-400">Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le support HORIZON CHIMIQUE.</p>
            </div>
        </div>
    );

    if (success) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-green-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-bounce">
                    <CheckCircle size={40} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Merci pour votre confiance !</h1>
                <p className="text-slate-600 mb-6">La validation a été effective. Votre artisan vous remercie.</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-500 flex items-center gap-2 justify-center">
                    <ShieldCheck size={16} className="text-primary" />
                    <span>Garantie Digitale enregistrée.</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
            <Toaster />
            <div className="max-w-xl mx-auto space-y-6">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-primary mb-2">Validation de Chantier</h1>
                    <p className="text-slate-600">Veuillez vérifier que ces informations correspondent aux travaux réalisés chez vous par <span className="font-bold text-slate-900">{chantier.artisan?.name || "l'artisan"}</span>.</p>
                </div>

                {/* Recap Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-2">
                        <User size={18} className="text-slate-500" />
                        <span className="font-bold text-slate-700">Client : {chantier.clientName}</span>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Technical Specs */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Ruler size={14} /> Surfaces Déclarées
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="text-center">
                                    <span className="block text-2xl font-bold text-slate-800">{chantier.surface_sol || 0}</span>
                                    <span className="text-xs text-slate-500 uppercase">m² Sol</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-2xl font-bold text-slate-800">{chantier.lineaire_acrotere || 0}</span>
                                    <span className="text-xs text-slate-500 uppercase">ml Acrotère</span>
                                </div>
                                <div className="text-center col-span-2 border-t border-slate-200 pt-2 mt-2">
                                    <span className="block font-bold text-slate-700">{chantier.support_type}</span>
                                    <span className="text-xs text-slate-500 uppercase">Type de Support</span>
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Package size={14} /> Produits Utilisés
                            </h3>
                            <div className="space-y-2">
                                {chantier.products.map((p, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                                        <span className="font-medium text-slate-700">{p.designation}</span>
                                        <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full text-sm">x{p.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rating & Submission */}
                <div className="bg-white rounded-2xl shadow-lg border border-primary/20 p-6 text-center">
                    <h3 className="font-bold text-slate-800 mb-4">Notez la prestation</h3>
                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className={`transition-all hover:scale-110 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
                            >
                                <Star size={36} className={rating >= star ? 'fill-current' : ''} />
                            </button>
                        ))}
                    </div>

                    <p className="text-sm text-slate-500 mb-6 italic">
                        "Je certifie l'exactitude des informations ci-dessus."
                    </p>

                    <button
                        onClick={handleConfirm}
                        disabled={submitting}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                Confirmer et Valider
                            </>
                        )}
                    </button>
                </div>

                <div className="text-center pt-8 text-slate-300">
                    <p className="text-xs">Secured by Horizon Chimique</p>
                </div>
            </div>
        </div>
    );
}
