'use client';

import { useState, useEffect } from 'react';
import { Loader2, Filter, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminMaintenancePage() {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'completed'

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/maintenance');
            const data = await res.json();
            if (data.success) {
                setVisits(data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (warrantyId, visitDate, newStatus) => {
        // Optimistic Update
        const oldVisits = [...visits];
        setVisits(visits.map(v =>
            (v._id === warrantyId && v.visitDate === visitDate)
                ? { ...v, visitStatus: newStatus }
                : v
        ));

        try {
            const res = await fetch('/api/admin/maintenance', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ warrantyId, visitDate, status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Statut mis à jour");
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            setVisits(oldVisits); // Revert
            toast.error("Erreur de mise à jour");
        }
    };

    const filteredVisits = visits.filter(v => {
        if (filter === 'all') return true;
        if (filter === 'pending') return v.visitStatus === 'pending' || !v.visitStatus;
        if (filter === 'completed') return v.visitStatus === 'completed';
        if (filter === 'missed') return v.visitStatus === 'missed';
        return true;
    });

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        Gestion de Maintenance
                    </h1>
                    <p className="text-slate-500">Suivi global des visites de contrôle</p>
                </div>

                <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                    {['pending', 'completed', 'missed', 'all'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === f
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {f === 'pending' && 'À Faire'}
                            {f === 'completed' && 'Réalisées'}
                            {f === 'missed' && 'Manquées'}
                            {f === 'all' && 'Toutes'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-4">Date Prévue</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4">Client / Contrat</th>
                                <th className="p-4">Applicateur</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredVisits.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">Aucune maintenance trouvée.</td>
                                </tr>
                            ) : (
                                filteredVisits.map((visit, i) => (
                                    <tr key={`${visit._id}-${i}`} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-700 flex items-center gap-2">
                                                <Calendar size={16} className="text-slate-400" />
                                                {new Date(visit.visitDate).toLocaleDateString()}
                                            </div>
                                            {/* Highlight if overdue and pending */}
                                            {visit.visitStatus === 'pending' && new Date(visit.visitDate) < new Date() && (
                                                <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full mt-1 inline-block">En retard</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={visit.visitStatus || 'pending'}
                                                onChange={(e) => handleStatusChange(visit._id, visit.visitDate, e.target.value)}
                                                className={`text-sm font-bold p-2 rounded-lg border outline-none cursor-pointer ${visit.visitStatus === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        visit.visitStatus === 'missed' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                    }`}
                                            >
                                                <option value="pending">⏳ À faire</option>
                                                <option value="completed">✅ Réalisée</option>
                                                <option value="missed">❌ Manquée</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{visit.clientName}</div>
                                            <div className="text-xs text-slate-500 font-mono">Ref: {visit.contractNumber}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium">{visit.artisanName}</div>
                                            <div className="text-xs text-slate-400">{visit.artisanEmail}</div>
                                        </td>
                                        <td className="p-4">
                                            <Link
                                                href={`/admin/warranties/${visit._id}`}
                                                className="text-primary text-sm font-bold hover:underline"
                                            >
                                                Voir Dossier
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
