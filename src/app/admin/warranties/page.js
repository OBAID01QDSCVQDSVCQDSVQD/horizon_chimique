'use client';

import { useState, useEffect } from 'react';
import { Loader2, ScrollText, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminWarrantiesPage() {
    const [warranties, setWarranties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWarranties();
    }, []);

    const fetchWarranties = async () => {
        try {
            const res = await fetch('/api/warranties?role=admin');
            const data = await res.json();
            if (data.success) {
                setWarranties(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const deleteWarranty = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ? Action irréversible.')) return;

        try {
            const res = await fetch(`/api/warranties?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Garantie supprimée');
                setWarranties(prev => prev.filter(w => w._id !== id));
            } else {
                toast.error(data.error || 'Erreur suppression');
            }
        } catch (error) {
            toast.error('Erreur connexion');
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                <ScrollText /> Gestion des Garanties
            </h1>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left bg-white dark:bg-slate-800 text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="p-4">Client / Chantier</th>
                            <th className="p-4">Artisan</th>
                            <th className="p-4">Détails</th>
                            <th className="p-4">Statut</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {warranties.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-500">Aucune demande de garantie.</td></tr>
                        ) : warranties.map(w => (
                            <tr key={w._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-slate-900 dark:text-white">{w.clientName}</div>
                                    <div className="text-xs text-slate-500">{w.chantier?.address}</div>
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-slate-900 dark:text-white">{w.artisan?.name}</div>
                                    <div className="text-xs text-slate-500">{w.artisan?.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="text-xs">
                                        <p>Durée: <strong>{w.duration}</strong></p>
                                        <p className="text-slate-500">{w.maintenanceVisits?.length || 0} visite(s) prévue(s)</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold 
                                        ${w.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            w.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-orange-100 text-orange-700'}`}>
                                        {w.status === 'approved' ? 'Validée' : (w.status === 'pending' ? 'En attente' : 'Rejetée')}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/warranties/${w._id}`}
                                            className="inline-flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors"
                                        >
                                            <Eye size={14} /> Traiter
                                        </Link>
                                        <button
                                            onClick={() => deleteWarranty(w._id)}
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
