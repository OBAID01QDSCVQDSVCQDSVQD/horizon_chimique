'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Script from 'next/script';
import { Loader2, Download, ShieldCheck, Globe } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function WarrantyPrintPage() {
    const { id } = useParams();
    const [warranty, setWarranty] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        Promise.all([fetchWarranty(), fetchSettings()]).finally(() => setLoading(false));
    }, [id]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings', { cache: 'no-store' });
            const data = await res.json();
            if (data.success) setCompany(data.data);
        } catch (error) { console.error(error); }
    };

    const fetchWarranty = async () => {
        try {
            // Use Admin API logic but generalized or verify ownership in API if needed.
            // For now assuming artisan can access their own warranty via this print page.
            // Or better, make a public-read API for warranty if ID is known?
            // Actually reusing /api/warranties with role=artisan works if they are the owner.
            const res = await fetch(`/api/warranties?id=${id}`, { cache: 'no-store' });
            const data = await res.json();
            if (data.success && data.data && data.data.length > 0) {
                // If API returns list
                setWarranty(data.data[0]);
            } else if (data.success && data.data?._id) {
                setWarranty(data.data);
            }
        } catch (error) { console.error(error); }
    };

    const handleDownload = () => {
        setIsDownloading(true);
        const element = document.getElementById('certificate-content');
        const opt = {
            margin: 0,
            filename: `Certificat_Garantie_${warranty.contractNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0, windowWidth: document.documentElement.offsetWidth },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Check if html2pdf is loaded
        if (typeof window !== 'undefined' && window.html2pdf) {
            window.html2pdf().set(opt).from(element).save().then(() => setIsDownloading(false));
        } else {
            console.error("html2pdf library not loaded");
            setIsDownloading(false);
            window.print(); // Fallback
        }
    };

    // Auto-print removed upon user request.
    const splitDate = (d) => d ? new Date(d).toLocaleDateString() : '';

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-primary" size={32} /></div>;
    if (!warranty) return <div className="p-8 text-center text-red-500">Document introuvable ou accès refusé.</div>;

    return (
        <div className="bg-slate-100 min-h-screen font-serif text-slate-900 flex flex-col items-center pb-12 relative print:bg-white print:p-0 print:pb-0">
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="lazyOnload" />

            {/* Top Control Bar */}
            <div className="w-full max-w-[210mm] bg-white rounded-b-xl border border-t-0 border-slate-200 p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg"><ShieldCheck className="text-primary" size={24} /></div>
                    <div>
                        <h1 className="text-lg font-black font-sans text-slate-800 leading-tight">Certificat N° {warranty.contractNumber || '---'}</h1>
                        <p className="text-xs font-sans text-slate-500 font-medium">Format A4 {'>'} Prêt pour l'impression</p>
                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-all font-sans font-bold disabled:opacity-70 shadow-md hover:shadow-lg active:scale-95"
                >
                    {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                    {isDownloading ? 'Génération du PDF...' : 'Télécharger le PDF'}
                </button>
            </div>

            <div id="certificate-content" className="w-[210mm] min-h-[297mm] bg-white relative flex flex-col justify-between p-[10mm] shadow-2xl print:shadow-none" style={{ fontFamily: 'Times New Roman, serif' }}>

                {/* HEADER */}
                <div className="border-b-4 border-primary pb-4 mb-6 flex justify-between items-start">
                    <div className="w-1/2">
                        {/* Artisan Info Section - Uses Gold Artisan info if linked */}
                        {(() => {
                            const displayArtisan = warranty.artisan?.parentGoldArtisan || warranty.artisan;
                            const isChild = !!warranty.artisan?.parentGoldArtisan;

                            return (
                                <div className="flex gap-6 items-center">
                                    {displayArtisan?.image ? (
                                        <img src={displayArtisan.image} alt={displayArtisan.companyName} className="max-h-24 max-w-[180px] object-contain" />
                                    ) : (
                                        <div className="h-20 w-20 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center">
                                            <ShieldCheck className="text-slate-300" size={32} />
                                        </div>
                                    )}
                                    <div>
                                        <h1 className="text-2xl font-black text-slate-900 uppercase leading-none mb-1">
                                            {displayArtisan?.companyName || displayArtisan?.name}
                                        </h1>
                                        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] mb-3 border-b-2 border-primary/20 pb-1 inline-block">Applicateur Agréé / Entreprise</p>
                                        <div className="text-[11px] text-slate-600 leading-relaxed font-sans font-medium">
                                            {displayArtisan?.address && <p><span className="text-slate-400 font-bold uppercase mr-1">Siège:</span> {displayArtisan.address}</p>}
                                            {displayArtisan?.phone && <p><span className="text-slate-400 font-bold uppercase mr-1">Tél:</span> {displayArtisan.phone}</p>}
                                            {displayArtisan?.email && <p><span className="text-slate-400 font-bold uppercase mr-1">Email:</span> {displayArtisan.email}</p>}
                                            {displayArtisan?.taxId && <p><span className="text-slate-400 font-bold uppercase mr-1">MF:</span> {displayArtisan.taxId}</p>}
                                        </div>
                                        {isChild && (
                                            <div className="mt-2 text-[8px] italic text-slate-400 uppercase font-sans">
                                                Exécuté par: <span className="font-bold">{warranty.artisan?.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    <div className="text-right flex flex-col items-end">
                        {/* Collaboration Mention */}
                        <div className="flex flex-col items-end mb-4 border-b border-slate-100 pb-2 w-full">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">En Collaboration Avec</span>
                            {company?.logoUrl ? (
                                <img src={company.logoUrl} alt={company.name} className="h-10 object-contain" />
                            ) : (
                                <span className="text-sm font-black text-primary uppercase">{company?.name || 'Horizon Chimique'}</span>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold text-primary uppercase mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>Certificat de Garantie</h1>
                        <p className="font-mono text-base font-bold text-slate-700">Ref: {warranty.contractNumber} <span className="text-[10px] text-slate-400 font-normal ml-1 align-top">CLOUD-ID</span></p>
                        <p className="text-xs text-slate-500">Date d'émission: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                {/* BODY CONTENT */}
                <div className="flex-grow space-y-4 font-serif leading-snug">

                    {/* Project & Client */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h3 className="text-primary font-bold uppercase text-xs mb-3 border-b border-slate-200 pb-1">Détails du Projet & Client</h3>

                        {/* Client & Support Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <span className="block text-[10px] uppercase text-slate-500 font-sans">Client</span>
                                <span className="block font-bold text-sm">{warranty.chantier?.clientName || warranty.clientName}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase text-slate-500 font-sans">Téléphone</span>
                                <span className="block font-bold text-sm">{warranty.chantier?.clientPhone || warranty.clientPhone || '-'}</span>
                            </div>
                        </div>

                        {/* Technical Surfaces */}
                        <div className="grid grid-cols-3 gap-4 mb-4 border-t border-slate-200 pt-2">
                            {(warranty.chantier?.surface_sol > 0) && (
                                <div>
                                    <span className="block text-[10px] uppercase text-slate-500 font-sans">Surface Sol</span>
                                    <span className="block font-bold text-sm">{warranty.chantier.surface_sol} m²</span>
                                </div>
                            )}
                            {(warranty.chantier?.surface_murs > 0) && (
                                <div>
                                    <span className="block text-[10px] uppercase text-slate-500 font-sans">Surface Murs</span>
                                    <span className="block font-bold text-sm">{warranty.chantier.surface_murs} m²</span>
                                </div>
                            )}
                            {(warranty.chantier?.lineaire_acrotere > 0) && (
                                <div>
                                    <span className="block text-[10px] uppercase text-slate-500 font-sans">Acrotère</span>
                                    <span className="block font-bold text-sm">{warranty.chantier.lineaire_acrotere} ml</span>
                                </div>
                            )}
                        </div>

                        {/* Products */}
                        {warranty.chantier?.products && warranty.chantier.products.length > 0 && (
                            <div className="border-t border-slate-200 pt-2">
                                <span className="block text-[10px] uppercase text-slate-500 font-sans mb-1">Produits Utilisés</span>
                                <ul className="list-disc list-inside text-sm font-bold grid grid-cols-2 gap-x-4">
                                    {warranty.chantier.products.map((p, i) => (
                                        <li key={i}>{p.designation}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Terms */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-primary font-bold uppercase text-xs mb-2 border-b border-slate-200 pb-1">Applicateur Agréé</h3>
                            <p className="font-bold text-base">{warranty.artisan?.name}</p>
                            <p className="text-xs text-slate-600">{warranty.artisan?.email}</p>
                        </div>
                        <div>
                            <h3 className="text-primary font-bold uppercase text-xs mb-2 border-b border-slate-200 pb-1">Période de Validité</h3>
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <span>Durée:</span>
                                <span className="font-bold">{warranty.duration}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span>Date de début:</span>
                                <span className="font-bold">{warranty.startDate ? new Date(warranty.startDate).toLocaleDateString() : 'Non définie'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Coverage Text */}
                    <div>
                        <h3 className="text-primary font-bold uppercase text-xs mb-2 border-b border-slate-200 pb-1">Garantie & Couverture</h3>
                        <div className="text-justify whitespace-pre-wrap text-sm leading-relaxed max-h-[40mm] overflow-hidden">
                            {warranty.coverageDetails || "Détails non spécifiés."}
                        </div>
                    </div>

                    {/* Maintenance Schedule */}
                    {warranty.maintenanceVisits && warranty.maintenanceVisits.length > 0 && (
                        <div>
                            <h3 className="text-primary font-bold uppercase text-xs mb-2 border-b border-slate-200 pb-1">Planning de Maintenance (Extrait)</h3>
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="border p-1 text-left">Visite</th>
                                        <th className="border p-1 text-left">Date Prévue</th>
                                        <th className="border p-1 text-left">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {warranty.maintenanceVisits.slice(0, 5).map((visit, i) => {
                                        const date = visit.date || visit; // Handle object or string
                                        const status = visit.status || 'pending';
                                        let label = 'À réaliser';
                                        let color = 'text-slate-400';
                                        if (status === 'completed') { label = 'Réalisée'; color = 'text-green-600 font-bold'; }
                                        if (status === 'missed') { label = 'Non réalisée'; color = 'text-red-500 font-bold'; }

                                        return (
                                            <tr key={i}>
                                                <td className="border p-1">Visite de contrôle N°{i + 1}</td>
                                                <td className="border p-1 font-bold">{new Date(date).toLocaleDateString()}</td>
                                                <td className={`border p-1 ${color}`}>{label}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="mt-8 pt-4 border-t border-slate-300">
                    <div className="flex justify-between items-end gap-4">
                        <div className="text-center w-1/3">
                            <p className="font-bold mb-12 text-sm">Signature de l'Applicateur</p>
                            <div className="border-t border-slate-400 w-2/3 mx-auto"></div>
                        </div>

                        {/* QR CODE */}
                        <div className="text-center flex flex-col items-center justify-end pb-2">
                            <div className="bg-white p-2 border border-slate-200 rounded-lg">
                                <QRCodeSVG
                                    value={typeof window !== 'undefined' ? `${window.location.origin}/verify/warranty/${id}` : ''}
                                    size={80}
                                    level="M"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Scanner pour vérifier</p>
                        </div>

                        <div className="text-center w-1/3">
                            <p className="font-bold mb-2 text-sm">Pour HORIZON CHIMIQUE</p>
                            <div className="w-24 h-24 border-4 border-primary/30 rounded-full mx-auto flex items-center justify-center -rotate-12 mb-2">
                                <span className="text-primary/50 font-black text-[10px] uppercase text-center">Horizon Chimique<br />Approuvé<br />Validé</span>
                            </div>
                            <div className="border-t border-slate-400 w-2/3 mx-auto"></div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Print Media Query CSS inject */}
            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white; }
                    .print-hidden { display: none; }
                }
             `}</style>
        </div>
    );
}
