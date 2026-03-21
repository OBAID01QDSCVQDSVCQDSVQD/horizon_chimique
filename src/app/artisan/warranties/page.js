'use client';

import { useState, useEffect } from 'react';
import { ScrollText, Plus, Search, Loader2, AlertCircle, CheckCircle, Clock, Trash2, Calendar, Edit } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function WarrantiesPage() {
    const [warranties, setWarranties] = useState([]);
    const [chantiers, setChantiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        chantierId: '',
        startDate: '', // Added startDate
        duration: '10 Ans',
        maintenanceVisits: [''] // Start with one empty date field
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [wRes, cRes] = await Promise.all([
                fetch('/api/warranties', { cache: 'no-store' }),
                fetch('/api/chantiers', { cache: 'no-store' }) // Assuming this endpoint returns artisan's chantiers
            ]);
            const wData = await wRes.json();
            const cData = await cRes.json();

            if (wData.success) setWarranties(wData.data);
            if (cData.success) {
                // Filter out chantiers that already have a warranty request
                const warrantyChantierIds = new Set(wData.data.map(w => w.chantier?._id));
                const available = (cData.chantiers || []).filter(c => !warrantyChantierIds.has(c._id));
                setChantiers(available);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur chargement");
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (index, value) => {
        const newVisits = [...formData.maintenanceVisits];
        newVisits[index] = value;
        setFormData({ ...formData, maintenanceVisits: newVisits });
    };

    const addDate = () => {
        setFormData({ ...formData, maintenanceVisits: [...formData.maintenanceVisits, ''] });
    };

    const removeDate = (index) => {
        const newVisits = formData.maintenanceVisits.filter((_, i) => i !== index);
        setFormData({ ...formData, maintenanceVisits: newVisits });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.chantierId) return toast.error("Veuillez sélectionner un chantier");

        // Filter out empty dates
        const validDates = formData.maintenanceVisits.filter(d => d !== '');

        setSubmitting(true);
        try {
            const res = await fetch('/api/warranties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, maintenanceVisits: validDates })
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Demande envoyée !");
                setWarranties([data.data, ...warranties]);
                setShowModal(false);
                setFormData({ chantierId: '', duration: '10 Ans', maintenanceVisits: [''] });
            } else {
                toast.error(data.error || "Erreur");
            }
        } catch (error) {
            toast.error("Erreur connexion");
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Validée</span>;
            case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><AlertCircle size={12} /> Refusée</span>;
            default: return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> En attente</span>;
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Mes Demandes de Garantie</h1>
                    <p className="text-slate-500">Demandez des certificats de garantie pour vos chantiers réalisés.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors"
                >
                    <Plus size={20} /> Nouvelle Demande
                </button>
            </div>

            {warranties.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <ScrollText size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">Aucune garantie demandée</h3>
                    <p className="text-slate-500 mb-6">Commencez par déclarer une garantie pour un chantier terminé.</p>
                    <button onClick={() => setShowModal(true)} className="text-primary font-bold hover:underline">Faire une demande</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {warranties.map(warranty => (
                        <div key={warranty._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-50 p-3 rounded-lg text-primary">
                                    <ScrollText size={24} />
                                </div>
                                {getStatusBadge(warranty.status)}
                            </div>
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-lg text-slate-800">{warranty.clientName}</h3>
                                <Link
                                    href={`/artisan/warranties/${warranty._id}/edit`}
                                    className="text-slate-400 hover:text-primary transition-colors p-1"
                                    title="Modifier la garantie et le chantier"
                                >
                                    <Edit size={18} />
                                </Link>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">Chantier: {warranty.chantier?.address || 'Non spécifié'}</p>

                            <div className="space-y-2 text-sm text-slate-600 mb-4">
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                    <span>Durée:</span>
                                    <span className="font-bold">{warranty.duration}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-50 pb-2">
                                    <span>Visites de contrôle:</span>
                                    <span className="font-bold">{warranty.maintenanceVisits?.length || 0} visite(s)</span>
                                </div>
                                {warranty.maintenanceVisits?.length > 0 && (
                                    <div className="text-xs text-slate-400">
                                        Prochaine: {new Date(warranty.maintenanceVisits[0]).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            {warranty.status === 'approved' && (
                                <button
                                    onClick={() => window.open(`/print/warranty/${warranty._id}`, '_blank')}
                                    className="w-full py-2 border border-primary text-primary rounded-lg font-bold hover:bg-blue-50 transition-colors"
                                >
                                    Télécharger le Certificat
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Nouvelle Garantie</h2>
                            <button onClick={() => setShowModal(false)}><Plus size={24} className="rotate-45 text-slate-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Sélectionner le Chantier</label>
                                <select
                                    value={formData.chantierId}
                                    onChange={(e) => setFormData({ ...formData, chantierId: e.target.value })}
                                    className="w-full p-3 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary/20 outline-none"
                                    required
                                >
                                    <option value="">-- Choisir --</option>
                                    {chantiers.map(c => (
                                        <option key={c._id} value={c._id}>
                                            {c.clientName} - {new Date(c.createdAt).toLocaleDateString()}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Seuls vos chantiers déclarés apparaissent ici.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Date de début de garantie</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full p-3 border rounded-lg bg-slate-50 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Durée de Garantie</label>
                                <select
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full p-3 border rounded-lg bg-slate-50 outline-none"
                                >
                                    <option value="1 An">1 An</option>
                                    <option value="2 Ans">2 Ans</option>
                                    <option value="5 Ans">5 Ans</option>
                                    <option value="10 Ans">10 Ans</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Dates de Maintenance / Contrôle</label>
                                <div className="space-y-2">
                                    {formData.maintenanceVisits.map((date, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="date"
                                                value={date}
                                                onChange={(e) => handleDateChange(index, e.target.value)}
                                                className="flex-1 p-2 border rounded-lg bg-slate-50 outline-none"
                                                required={index === 0} // Only first is strictly required? Or none?
                                            />
                                            {formData.maintenanceVisits.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeDate(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addDate}
                                        className="text-primary text-sm font-bold flex items-center gap-1 mt-2 hover:underline"
                                    >
                                        <Plus size={16} /> Ajouter une date
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors flex justify-center items-center gap-2 mt-4"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : 'Envoyer la demande'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
