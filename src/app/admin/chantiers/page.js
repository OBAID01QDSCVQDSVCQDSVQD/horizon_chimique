'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Search, Eye, Calendar, User, Phone, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminChantiersPage() {
    const [chantiers, setChantiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
    const [selectedChantier, setSelectedChantier] = useState(null); // For Modal
    const [pointsToAward, setPointsToAward] = useState(100); // Default points
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchChantiers();
    }, []);

    const fetchChantiers = async () => {
        try {
            const res = await fetch('/api/chantiers');
            const data = await res.json();
            if (data.success) {
                setChantiers(data.chantiers);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleValidation = async (status) => {
        if (!selectedChantier) return;
        setProcessing(true);

        try {
            const res = await fetch(`/api/chantiers/${selectedChantier._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    points: pointsToAward,
                })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(status === 'approved' ? `Validé (+${pointsToAward} pts)` : "Refusé");
                // Update local state
                setChantiers(prev => prev.map(c => c._id === selectedChantier._id ? { ...c, status, pointsEarned: status === 'approved' ? pointsToAward : 0 } : c));
                setSelectedChantier(null);
            } else {
                toast.error(data.error || "Erreur");
            }
        } catch (error) {
            toast.error("Erreur technique");
        } finally {
            setProcessing(false);
        }
    };

    const filteredChantiers = chantiers.filter(c => filter === 'all' ? true : c.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestion des Chantiers</h1>
                <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                    <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-slate-900 dark:bg-slate-950 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>En attente</button>
                    <button onClick={() => setFilter('approved')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'approved' ? 'bg-green-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Validés</button>
                    <button onClick={() => setFilter('rejected')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'rejected' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Refusés</button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400" /></div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="p-4">Artisan</th>
                                <th className="p-4">Client</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Produits</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredChantiers.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-slate-400 italic">Aucun chantier trouvé.</td></tr>
                            ) : filteredChantiers.map(chantier => (
                                <tr key={chantier._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800 dark:text-white">{chantier.artisan?.name || 'Inconnu'}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{chantier.artisan?.phone}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-900 dark:text-slate-100">{chantier.clientName}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">{chantier.clientPhone}</div>
                                    </td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400">
                                        {new Date(chantier.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                            <Package size={16} />
                                            <span className="font-bold">{chantier.products?.length || 0}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${chantier.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                            chantier.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                                'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                            }`}>
                                            {chantier.status === 'approved' ? 'Validé' : chantier.status === 'rejected' ? 'Refusé' : 'En attente'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => setSelectedChantier(chantier)}
                                            className="text-primary hover:text-primary-dark font-medium text-sm border border-primary/20 bg-primary/5 hover:bg-primary/10 dark:bg-primary/20 dark:hover:bg-primary/30 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            Voir / Valider
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {selectedChantier && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Détails du Chantier</h2>
                            <button onClick={() => setSelectedChantier(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 text-xs tracking-wider">Artisan</h3>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                            {selectedChantier.artisan?.name?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{selectedChantier.artisan?.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{selectedChantier.artisan?.phone}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 text-xs tracking-wider">Client</h3>
                                    <div className="flex items-center gap-3">
                                        <User size={20} className="text-slate-400" />
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{selectedChantier.clientName}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <Phone size={20} className="text-slate-400" />
                                        <span className="text-slate-600 dark:text-slate-400">{selectedChantier.clientPhone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Technical Details */}
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-2">Détails Techniques (Surfaces & Support)</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="block text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">Surface Sol</span>
                                        <span className="font-bold text-lg text-slate-700 dark:text-slate-300">{selectedChantier.surface_sol || 0} <span className="text-xs text-slate-400">m²</span></span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">Acrotère</span>
                                        <span className="font-bold text-lg text-slate-700 dark:text-slate-300">{selectedChantier.lineaire_acrotere || 0} <span className="text-xs text-slate-400">ml</span></span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">Murs</span>
                                        <span className="font-bold text-lg text-slate-700 dark:text-slate-300">{selectedChantier.surface_murs || 0} <span className="text-xs text-slate-400">m²</span></span>
                                    </div>
                                    <div>
                                        <span className="block text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">Support</span>
                                        <span className="font-bold text-lg text-slate-700 dark:text-slate-300">{selectedChantier.support_type || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Products */}
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white mb-2">Produits Utilisés ({selectedChantier.products?.length})</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedChantier.products && selectedChantier.products.map((prod, i) => (
                                        <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-100 dark:border-blue-800 flex items-center gap-2">
                                            <span className="font-bold">{prod.quantity}x</span>
                                            {prod.designation}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Image */}
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white mb-2">Preuve (Facture / Photo)</h3>
                                <div className="bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <a href={selectedChantier.invoiceImage} target="_blank" rel="noopener noreferrer">
                                        <img src={selectedChantier.invoiceImage} alt="Preuve" className="w-full h-auto max-h-80 object-contain hover:scale-105 transition-transform cursor-zoom-in" />
                                    </a>
                                </div>
                            </div>

                            {/* Validation Actions */}
                            {selectedChantier.status === 'pending' && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-6">
                                    <h3 className="font-bold text-amber-900 dark:text-amber-400 mb-4">Validation du chantier</h3>

                                    <div className="flex flex-col md:flex-row gap-4 items-end">
                                        <div className="flex-1 w-full">
                                            <label className="block text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">Points à attribuer</label>
                                            <input
                                                type="number"
                                                value={pointsToAward}
                                                onChange={(e) => setPointsToAward(Number(e.target.value))}
                                                className="w-full px-4 py-2 border border-amber-200 dark:border-amber-800 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto">
                                            <button
                                                onClick={() => handleValidation('rejected')}
                                                disabled={processing}
                                                className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                            >
                                                Refuser
                                            </button>
                                            <button
                                                onClick={() => handleValidation('approved')}
                                                disabled={processing}
                                                className="flex-1 md:flex-none px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                                            >
                                                {processing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                                Valider & Créditer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedChantier.status !== 'pending' && (
                                <div className={`p-4 rounded-xl text-center font-bold ${selectedChantier.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                                    Ce chantier a été {selectedChantier.status === 'approved' ? `validé (+${selectedChantier.pointsEarned} pts)` : 'refusé'}.
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
