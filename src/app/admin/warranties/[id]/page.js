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
                                {/* Artisan Info - Matches the print page layout */}
                                {(() => {
                                    const artisan = warranty.artisan;
                                    return (
                                        <div className="flex gap-4 items-start text-left">
                                            {artisan?.image ? (
                                                <img src={artisan.image} alt={artisan.companyName} className="max-h-16 max-w-[120px] object-contain border border-slate-100 rounded" />
                                            ) : (
                                                <div className="h-14 w-14 bg-slate-50 border border-dashed border-slate-200 rounded flex items-center justify-center shrink-0">
                                                    <ShieldCheck className="text-slate-200" size={20} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h1 className="text-lg font-black text-slate-900 uppercase leading-tight mb-0.5 break-words">
                                                    {artisan?.companyName || artisan?.name}
                                                </h1>
                                                <p className="text-[9px] font-bold text-primary uppercase tracking-wider mb-2 border-b-2 border-primary/20 pb-0.5 inline-block">Pro Certifié / Applicateur</p>
                                                
                                                <div className="text-[9px] text-slate-900 leading-snug space-y-0.5 font-sans">
                                                    {artisan?.address && <p className="flex items-start gap-1"><span className="text-slate-900 font-bold shrink-0 uppercase w-10">Siège:</span> <span>{artisan.address}</span></p>}
                                                    {artisan?.phone && <p className="flex items-start gap-1"><span className="text-slate-900 font-bold shrink-0 uppercase w-10">Tél:</span> <span>{artisan.phone}</span></p>}
                                                    {artisan?.email && <p className="flex items-start gap-1"><span className="text-slate-900 font-bold shrink-0 uppercase w-10">Email:</span> <span>{artisan.email}</span></p>}
                                                    {artisan?.taxId && <p className="flex items-start gap-1"><span className="text-slate-900 font-bold shrink-0 uppercase w-10">MF:</span> <span>{artisan.taxId}</span></p>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="text-right flex flex-col items-end min-w-[200px]">
                                {/* Parent Logo or Horizon Logo */}
                                <div className="flex flex-col items-end mb-4 border-b border-slate-200 pb-3 w-full">
                                    {warranty.artisan?.parentGoldArtisan ? (
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[8px] font-black text-slate-900 uppercase tracking-widest">Membre du Réseau</span>
                                            <img 
                                                src={warranty.artisan.parentGoldArtisan.image || "/logo.png"} 
                                                alt={warranty.artisan.parentGoldArtisan.companyName} 
                                                className="max-h-12 max-w-[150px] object-contain" 
                                            />
                                            <span className="text-[7px] font-bold text-slate-900 uppercase tracking-widest mt-1">En Collaboration Avec HORIZON CHIMIQUE</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[8px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1 text-right">En Collaboration Avec</span>
                                            {company?.logoUrl ? (
                                                <img src={company.logoUrl} alt={company.name} className="h-8 object-contain" />
                                            ) : (
                                                <span className="text-sm font-black text-primary uppercase">{company?.name || 'Horizon Chimique'}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-primary uppercase mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>Certificat de Garantie</h1>
                                <p className="font-mono text-base font-bold text-slate-700">Ref: {formData.contractNumber} <span className="text-[10px] text-slate-900 font-normal ml-1 align-top">CLOUD-ID</span></p>
                                <p className="text-xs text-slate-900 font-sans">Date d'émission: {new Date().toLocaleDateString('fr-FR')}</p>
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
                                        <span className="block text-xs uppercase text-slate-900 font-sans">Client</span>
                                        <span className="block font-bold text-lg text-slate-900">{warranty.chantier?.clientName || warranty.clientName}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs uppercase text-slate-900 font-sans">Téléphone</span>
                                        <span className="block font-bold text-slate-900">{warranty.chantier?.clientPhone || warranty.clientPhone || '-'}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="block text-xs uppercase text-slate-900 font-sans">Adresse</span>
                                        <span className="block font-bold text-slate-900">{warranty.chantier?.address || '-'}</span>
                                    </div>
                                </div>

                                {/* Technical Surfaces In one row */}
                                <div className="flex justify-between items-center border-t border-slate-200 pt-1.5 mt-1.5 uppercase text-[8px] font-sans text-slate-900">
                                    {warranty.chantier?.surface_sol > 0 && <span>Toiture: <b className="text-slate-900 ml-1">{warranty.chantier.surface_sol} m²</b></span>}
                                    {warranty.chantier?.surface_murs > 0 && <span>Murs: <b className="text-slate-900 ml-1">{warranty.chantier.surface_murs} m²</b></span>}
                                    {warranty.chantier?.lineaire_acrotere > 0 && <span>Acrotère: <b className="text-slate-900 ml-1">{warranty.chantier.lineaire_acrotere} ml</b></span>}
                                    <span>Support: <b className="text-slate-900 ml-1">{warranty.chantier?.support_type || 'Béton'}</b></span>
                                </div>
 
                                 {/* Products - Separate Section */}
                                 {warranty.chantier?.products && warranty.chantier.products.length > 0 && (
                                     <div className="border-t border-slate-200 pt-1.5 mt-1.5">
                                         <span className="block text-[9px] uppercase text-primary font-bold mb-0.5">Produits Horizon Chimique Utilisés:</span>
                                         <div className="text-[10px] text-slate-900 font-bold flex flex-wrap gap-x-3 gap-y-0.5 leading-tight">
                                             {warranty.chantier.products.map((p, i) => (
                                                 <span key={i} className="flex items-center gap-0.5"><span className="text-primary">•</span> {p.designation}</span>
                                             ))}
                                         </div>
                                     </div>
                                 )}
                             </div>
 
                             {/* Terms */}
                             <div className="grid grid-cols-2 gap-8">
                                 <div>
                                     <h3 className="text-primary font-bold uppercase text-[9px] mb-2 border-b border-slate-200 pb-0.5 text-left">Applicateur Agréé</h3>
                                     <p className="font-bold text-sm leading-tight text-slate-900">{warranty.artisan?.name}</p>
                                     <p className="text-[10px] text-slate-900 font-sans truncate">{warranty.artisan?.email}</p>
                                 </div>
                                 <div>
                                     <h3 className="text-primary font-bold uppercase text-[9px] mb-2 border-b border-slate-200 pb-0.5 text-left">Validité de Garantie</h3>
                                     <div className="flex justify-between items-center text-[11px] font-sans">
                                         <span className="text-slate-900 uppercase text-[9px]">Période:</span>
                                         <span className="font-bold text-slate-900">{warranty.duration}</span>
                                     </div>
                                     <div className="flex justify-between items-center text-[11px] font-sans">
                                         <span className="text-slate-900 uppercase text-[9px]">Début:</span>
                                         <span className="font-bold text-primary">{formData.startDate ? new Date(formData.startDate).toLocaleDateString('fr-FR') : 'Non définie'}</span>
                                     </div>
                                 </div>
                             </div>

                            {/* Coverage Text */}
                            <div className="mt-2">
                                <h3 className="text-primary font-bold uppercase text-[9px] border-b border-slate-200 pb-0.5 mb-1 text-left">La Garantie & ses Conditions</h3>
                                <div className="text-justify whitespace-pre-wrap text-[11px] leading-relaxed text-slate-900">
                                    {formData.coverageDetails}
                                </div>
                                
                                {/* Maintenance Recommendation Paragraph */}
                                <div className="bg-primary/5 p-1.5 rounded-lg border border-primary/10 mt-1.5 text-justify">
                                    <p className="text-[9px] items-center gap-1.5 text-primary/80 font-bold uppercase mb-0.5 flex">
                                        <ShieldCheck size={10} /> Conseil de durabilité :
                                    </p>
                                    <p className="text-[10px] text-slate-900 italic leading-snug">
                                        "Pour assurer la pérennité de votre étanchéité au-delà de la garantie, 
                                        il est vivement recommandé de confier à un professionnel une visite de maintenance préventive 
                                        tous les trois (3) ans. Ces interventions, réalisées à la charge du client, permettent de garantir la longévité maximale."
                                    </p>
                                </div>
                            </div>

                            {/* Maintenance Schedule */}
                            {formData.maintenanceVisits && formData.maintenanceVisits.length > 0 && (
                                <div>
                                    <h3 className="text-primary font-bold uppercase text-sm mb-4 border-b border-slate-200 pb-2">Planning de Maintenance Obligatoire</h3>
                                    <table className="w-full text-sm border-collapse text-slate-900">
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
                                                    <td className="border p-2 font-bold">{new Date(visit.date).toLocaleDateString('fr-FR')}</td>
                                                    <td className={`border p-2 font-bold ${visit.status === 'completed' ? 'text-green-600' : visit.status === 'missed' ? 'text-red-500' : 'text-slate-900'}`}>
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
                                    <p className="font-bold mb-2">Signature de l'Applicateur</p>
                                    <div className="h-24 flex items-center justify-center">
                                        {warranty.artisan?.cachet ? (
                                            <img 
                                                src={warranty.artisan.cachet} 
                                                alt="Cachet" 
                                                className="max-h-24 object-contain mix-blend-multiply" 
                                                style={{ transform: 'rotate(-2deg)' }}
                                            />
                                        ) : (
                                            <div className="h-16"></div>
                                        )}
                                    </div>
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
