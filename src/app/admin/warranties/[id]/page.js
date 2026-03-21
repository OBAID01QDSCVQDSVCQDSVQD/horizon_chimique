'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Save, Printer, CheckCircle, XCircle, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';

export default function AdminWarrantyDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [warranty, setWarranty] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editable Fields
    const [formData, setFormData] = useState({
        contractNumber: '',
        startDate: '',
        maintenanceVisits: [],
        coverageDetails: "La présente garantie couvre l'étanchéité réalisée selon les normes en vigueur. Elle assure la prise en charge des défauts produits et de l'application sous réserve du respect du planning de maintenance.\n\nCe certificat atteste que les travaux ont été réalisés par un applicateur agréé Horizon Chimique.",
        adminNotes: '',
        status: 'pending'
    });

    const printRef = useRef();

    useEffect(() => {
        Promise.all([fetchWarranty(), fetchSettings()]).finally(() => setLoading(false));
    }, [id]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success) {
                setCompany(data.data);
            }
        } catch (error) {
            console.error("Erreur settings", error);
        }
    };

    const fetchWarranty = async () => {
        try {
            const res = await fetch(`/api/warranties?role=admin&id=${id}`);
            const data = await res.json();
            if (data.success && data.data && data.data.length > 0) {
                const w = data.data[0]; // API returns list
                setWarranty(w);
                setFormData({
                    contractNumber: w.contractNumber || `GAR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                    startDate: w.startDate ? new Date(w.startDate).toISOString().split('T')[0] : '', // Format for input date
                    // Handle both legacy (strings) and new (objects) formats
                    maintenanceVisits: w.maintenanceVisits ? w.maintenanceVisits.map(v => {
                        if (typeof v === 'string' || v instanceof String) return { date: new Date(v).toISOString().split('T')[0], status: 'pending' };
                        return { date: new Date(v.date).toISOString().split('T')[0], status: v.status || 'pending' };
                    }) : [],
                    coverageDetails: w.coverageDetails || formData.coverageDetails,
                    adminNotes: w.adminNotes || '',
                    status: w.status
                });
            } else {
                toast.error("Garantie introuvable");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleVisitChange = (index, field, value) => {
        const newVisits = [...formData.maintenanceVisits];
        newVisits[index] = { ...newVisits[index], [field]: value };
        setFormData({ ...formData, maintenanceVisits: newVisits });
    };

    const addVisit = () => {
        setFormData({ ...formData, maintenanceVisits: [...formData.maintenanceVisits, { date: '', status: 'pending' }] });
    };

    const removeVisit = (index) => {
        const newVisits = formData.maintenanceVisits.filter((_, i) => i !== index);
        setFormData({ ...formData, maintenanceVisits: newVisits });
    };

    const getStatusLabel = (s) => {
        if (s === 'completed') return 'Réalisée';
        if (s === 'missed') return 'Non réalisée';
        return 'À réaliser';
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Need PUT endpoint. 
            // Currently /api/admin/users handles PUT for User.
            // I need /api/warranties PUT or /api/admin/warranties PUT.
            // I haven't implemented PUT in /api/warranties yet! 
            // I added GET, POST, DELETE. I missed PUT.
            // Assuming I will add PUT in next step immediately.
            const res = await fetch('/api/warranties', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...formData })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Modifications enregistrées");
                setWarranty({ ...warranty, ...formData }); // Optimistic update
            } else {
                toast.error(data.error || "Erreur sauvegarde");
            }
        } catch (error) {
            toast.error("Erreur serveur");
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-primary" /></div>;
    if (!warranty) return <div className="p-8">Introuvable</div>;

    return (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8">
            {/* Editor Sidebar (Hidden when printing) */}
            <div className="w-full lg:w-1/3 space-y-6 print:hidden">
                <div className="flex items-center gap-2 mb-4">
                    <Link href="/admin/warranties" className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20} /></Link>
                    <h1 className="text-xl font-bold">Édition Garantie</h1>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><ShieldCheck size={20} /> Validation</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Statut</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFormData({ ...formData, status: 'approved' })}
                                    className={`flex-1 py-2 rounded-lg font-bold border ${formData.status === 'approved' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-slate-500 border-slate-200'}`}
                                >
                                    Approuver
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, status: 'rejected' })}
                                    className={`flex-1 py-2 rounded-lg font-bold border ${formData.status === 'rejected' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-500 border-slate-200'}`}
                                >
                                    Rejeter
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1">Numéro de Contrat</label>
                            <input
                                type="text"
                                value={formData.contractNumber}
                                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                                className="w-full p-2 border rounded-lg bg-slate-50 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1">Date de Début</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full p-2 border rounded-lg bg-slate-50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1">Dates de Maintenance</label>
                            <div className="space-y-2">
                                {formData.maintenanceVisits.map((visit, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <input
                                            type="date"
                                            value={visit.date}
                                            onChange={(e) => handleVisitChange(i, 'date', e.target.value)}
                                            className="flex-1 p-2 border rounded-lg bg-slate-50 text-sm"
                                        />
                                        <select
                                            value={visit.status}
                                            onChange={(e) => handleVisitChange(i, 'status', e.target.value)}
                                            className="p-2 border rounded-lg bg-white text-xs font-bold"
                                        >
                                            <option value="pending">À faire</option>
                                            <option value="completed">Fait</option>
                                            <option value="missed">Raté</option>
                                        </select>
                                        <button onClick={() => removeVisit(i)} className="text-red-500 hover:bg-red-50 p-1 rounded"><XCircle size={16} /></button>
                                    </div>
                                ))}
                                <button onClick={addVisit} className="text-xs font-bold text-primary hover:underline">+ Ajouter une date</button>
                            </div>
                        </div>


                        <div>
                            <label className="block text-sm font-bold mb-1">Détails de Couverture (Texte Riche)</label>
                            <textarea
                                value={formData.coverageDetails}
                                onChange={(e) => setFormData({ ...formData, coverageDetails: e.target.value })}
                                rows={6}
                                className="w-full p-2 border rounded-lg bg-slate-50 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1">Notes Internes</label>
                            <textarea
                                value={formData.adminNotes}
                                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                                rows={2}
                                className="w-full p-2 border rounded-lg bg-yellow-50 text-sm"
                                placeholder="Notes visibles seulement par l'admin..."
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 transition-colors flex justify-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save />} Enregistrer
                        </button>
                    </div>
                </div>

                <div className="bg-slate-800 text-white p-6 rounded-xl">
                    <h3 className="font-bold mb-2">Actions Rapides</h3>
                    <button onClick={handlePrint} className="w-full py-2 bg-white text-slate-900 rounded-lg font-bold flex items-center justify-center gap-2 mb-2 hover:bg-slate-100">
                        <Printer size={18} /> Imprimer / PDF
                    </button>
                    <button className="w-full py-2 bg-slate-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-600">
                        <Mail size={18} /> Envoyer par Email
                    </button>
                </div>
            </div>

            {/* Certificate Preview (Visible in Print) */}
            <div className="w-full lg:w-2/3 print:w-full">
                <div className="bg-slate-200 p-8 rounded-xl print:p-0 print:bg-white overflow-auto flex justify-center">
                    {/* A4 Format Container */}
                    <div
                        className="bg-white w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none p-[15mm] text-slate-900 relative flex flex-col justify-between"
                        style={{ fontFamily: 'Times New Roman, serif' }} // Official look
                    >
                        {/* HEADER */}
                        <div className="border-b-4 border-primary pb-6 mb-8 flex justify-between items-start">
                            <div className="w-1/2">
                                {/* LOGO */}
                                {company?.logoUrl ? (
                                    <img src={company.logoUrl} alt={company.name} className="h-20 mb-3 object-contain" />
                                ) : (
                                    <h1 className="text-3xl font-black text-primary uppercase mb-2">{company?.name || 'ENTREPRISE'}</h1>
                                )}

                                <div className="text-xs text-slate-500 mt-2 leading-relaxed">
                                    <strong className="text-slate-700 uppercase">{company?.name || 'Horizon Chimique'}</strong><br />
                                    {company?.description || 'Solutions Techniques & Bâtiment'}<br />
                                    <span className="block mt-1">
                                        Siège Social: {company?.address || "Avenue de l'Indépendance, Tunis"}<br />
                                        Tél: {company?.phone || '+216 71 000 000'} | Email: {company?.email || 'contact@horizon-chimique.tn'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <h1 className="text-3xl font-bold text-primary uppercase mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>Certificat de Garantie</h1>
                                <p className="font-mono text-lg font-bold text-slate-700">Ref: {formData.contractNumber}</p>
                                <p className="text-sm text-slate-500">Date d'émission: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* BODY CONTENT */}
                        <div className="flex-grow space-y-8 font-serif leading-relaxed">

                            {/* Project & Client */}
                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 print:border-slate-300">
                                <h3 className="text-primary font-bold uppercase text-sm mb-4 border-b border-slate-200 pb-2">Détails du Projet & Client</h3>

                                {/* Client & Support Info */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <span className="block text-xs uppercase text-slate-500 font-sans">Client</span>
                                        <span className="block font-bold text-lg">{warranty.chantier?.clientName || warranty.clientName}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase text-slate-500 font-sans">Téléphone</span>
                                        <span className="block font-bold">{warranty.chantier?.clientPhone || warranty.clientPhone || '-'}</span>
                                    </div>
                                </div>

                                {/* Technical Surfaces */}
                                <div className="grid grid-cols-3 gap-4 mb-4 border-t border-slate-200 pt-2">
                                    {(warranty.chantier?.surface_sol > 0) && (
                                        <div>
                                            <span className="block text-xs uppercase text-slate-500 font-sans">Surface Sol</span>
                                            <span className="block font-bold">{warranty.chantier.surface_sol} m²</span>
                                        </div>
                                    )}
                                    {(warranty.chantier?.surface_murs > 0) && (
                                        <div>
                                            <span className="block text-xs uppercase text-slate-500 font-sans">Surface Murs</span>
                                            <span className="block font-bold">{warranty.chantier.surface_murs} m²</span>
                                        </div>
                                    )}
                                    {(warranty.chantier?.lineaire_acrotere > 0) && (
                                        <div>
                                            <span className="block text-xs uppercase text-slate-500 font-sans">Acrotère</span>
                                            <span className="block font-bold">{warranty.chantier.lineaire_acrotere} ml</span>
                                        </div>
                                    )}
                                </div>

                                {/* Products */}
                                {warranty.chantier?.products && warranty.chantier.products.length > 0 && (
                                    <div className="border-t border-slate-200 pt-2">
                                        <span className="block text-xs uppercase text-slate-500 font-sans mb-1">Produits Utilisés</span>
                                        <ul className="list-disc list-inside text-sm font-bold grid grid-cols-2 gap-x-4">
                                            {warranty.chantier.products.map((p, i) => (
                                                <li key={i}>{p.designation}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Terms */}
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-primary font-bold uppercase text-sm mb-4 border-b border-slate-200 pb-2">Applicateur Agréé</h3>
                                    <p className="font-bold text-lg">{warranty.artisan?.name}</p>
                                    <p className="text-sm text-slate-600">{warranty.artisan?.email}</p>
                                </div>
                                <div>
                                    <h3 className="text-primary font-bold uppercase text-sm mb-4 border-b border-slate-200 pb-2">Période de Validité</h3>
                                    <div className="flex justify-between items-center mb-1">
                                        <span>Durée:</span>
                                        <span className="font-bold">{warranty.duration}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Date de début:</span>
                                        <span className="font-bold">{formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'Non définie'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Coverage Text */}
                            <div>
                                <h3 className="text-primary font-bold uppercase text-sm mb-4 border-b border-slate-200 pb-2">Garantie & Couverture</h3>
                                <div className="text-justify whitespace-pre-wrap">
                                    {formData.coverageDetails}
                                </div>
                            </div>

                            {/* Maintenance Schedule */}
                            {formData.maintenanceVisits && formData.maintenanceVisits.length > 0 && (
                                <div>
                                    <h3 className="text-primary font-bold uppercase text-sm mb-4 border-b border-slate-200 pb-2">Planning de Maintenance Obligatoire</h3>
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100 print:bg-slate-50">
                                                <th className="border p-2 text-left">Visite</th>
                                                <th className="border p-2 text-left">Date Prévue</th>
                                                <th className="border p-2 text-left">Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.maintenanceVisits.filter(v => v.date).map((visit, i) => (
                                                <tr key={i}>
                                                    <td className="border p-2">Visite de contrôle N°{i + 1}</td>
                                                    <td className="border p-2 font-bold">{new Date(visit.date).toLocaleDateString()}</td>
                                                    <td className={`border p-2 font-bold ${visit.status === 'completed' ? 'text-green-600' : visit.status === 'missed' ? 'text-red-500' : 'text-slate-400'}`}>
                                                        {getStatusLabel(visit.status)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        </div>

                        {/* FOOTER SIGNATURES */}
                        <div className="mt-12 pt-8 border-t border-slate-300">
                            <div className="grid grid-cols-2 gap-20">
                                <div className="text-center">
                                    <p className="font-bold mb-16">Signature de l'Applicateur</p>
                                    <div className="border-t border-slate-400 w-1/2 mx-auto"></div>
                                </div>
                                <div className="text-center">
                                    <p className="font-bold mb-4">Pour HORIZON CHIMIQUE</p>
                                    {/* Mock Stamp/Signature */}
                                    <div className="w-32 h-32 border-4 border-primary/30 rounded-full mx-auto flex items-center justify-center -rotate-12 mb-4">
                                        <span className="text-primary/50 font-black text-xs uppercase text-center">Horizon Chimique<br />Approuvé<br />Validé</span>
                                    </div>
                                    <div className="border-t border-slate-400 w-1/2 mx-auto"></div>
                                </div>
                            </div>
                            <p className="text-center text-[10px] text-slate-400 mt-8">
                                Ce certificat est délivré sous réserve du respect des conditions générales de vente et d'application.
                                Horizon Chimique se réserve le droit d'annuler cette garantie en cas de mauvaise utilisation.
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
