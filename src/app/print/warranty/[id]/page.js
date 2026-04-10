'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Script from 'next/script';
import { Loader2, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function WarrantyPrintPage() {
    const { id } = useParams();
    const [warranty, setWarranty] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [includeCachet, setIncludeCachet] = useState(true);

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
            const res = await fetch(`/api/warranties?id=${id}`, { cache: 'no-store' });
            const data = await res.json();
            if (data.success && data.data && data.data.length > 0) {
                setWarranty(data.data[0]);
            } else if (data.success && data.data?._id) {
                setWarranty(data.data);
            }
        } catch (error) { console.error(error); }
    };

    const handleDownload = () => {
        const hasCachet = warranty.artisan?.cachet || warranty.artisan?.parentGoldArtisan?.cachet;
        if (hasCachet) {
            setShowConfirmModal(true);
        } else {
            generatePdf(false);
        }
    };

    const generatePdf = (withStamp) => {
        setShowConfirmModal(false);
        setIsDownloading(true);
        setIncludeCachet(withStamp);

        // We wait a bit for React to re-render the stamp hidden/shown state
        setTimeout(() => {
            const element = document.getElementById('certificate-content');
            const opt = {
                margin: 0,
                filename: `Certificat_Garantie_${warranty.contractNumber}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            if (typeof window !== 'undefined' && window.html2pdf) {
                window.html2pdf().set(opt).from(element).save().then(() => {
                    setIsDownloading(false);
                    setIncludeCachet(true); // Reset to default
                });
            } else {
                setIsDownloading(false);
                setIncludeCachet(true);
                window.print();
            }
        }, 300);
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-primary" size={32} /></div>;
    if (!warranty) return <div className="p-8 text-center text-red-500 font-sans font-bold">Document introuvable ou accès refusé.</div>;

    return (
        <div className="bg-slate-100 min-h-screen text-black flex flex-col items-center pb-12 print:bg-white print:p-0">
            <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="lazyOnload" />

            {/* Top Control Bar */}
            <div className="w-full max-w-[210mm] bg-white rounded-b-xl border border-t-0 border-slate-200 p-4 mb-4 flex justify-between items-center print:hidden shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg"><ShieldCheck className="text-primary" size={24} /></div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 leading-tight">Certificat N° {warranty.contractNumber}</h1>
                        <p className="text-xs text-slate-500">Prêt pour l'impression A4</p>
                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-600 transition-all font-bold shadow-md disabled:opacity-70"
                >
                    {isDownloading ? <Loader2 className="animate-spin" size={18} /> : null}
                    {isDownloading ? 'Génération...' : 'Télécharger le PDF'}
                </button>
            </div>

            <div id="certificate-content" className="w-[210mm] min-h-[297mm] bg-white relative flex flex-col justify-between p-[10mm] shadow-2xl print:shadow-none" style={{ fontFamily: 'serif' }}>
                
                {/* HEADER SECTION */}
                <div className="border-b-[3px] border-primary pb-2 mb-3 flex justify-between items-start">
                    <div className="w-[55%] flex gap-3 items-start">
                        {warranty.artisan?.image ? (
                            <img src={warranty.artisan.image} alt="Logo Artisan" className="max-h-16 max-w-[130px] object-contain border border-slate-200 rounded" crossOrigin="anonymous" />
                        ) : (
                            <div className="h-12 w-12 bg-slate-50 border border-dashed border-slate-300 rounded flex items-center justify-center shrink-0">
                                <ShieldCheck className="text-slate-300" size={20} />
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="text-lg font-black text-black uppercase leading-tight mb-0.5">{warranty.artisan?.companyName || warranty.artisan?.name}</h1>
                            <p className="text-[9px] font-bold text-primary uppercase tracking-wider mb-1 px-1 border-b border-primary/20 inline-block">Pro Certifié Approuvé</p>
                            <div className="text-[9px] text-black leading-tight space-y-0.5 font-sans">
                                {warranty.artisan?.address && <p>Siège: {warranty.artisan.address}</p>}
                                {warranty.artisan?.phone && <p>Tél: {warranty.artisan.phone}</p>}
                                {warranty.artisan?.taxId && <p>MF: {warranty.artisan.taxId}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="text-right w-[42%] flex flex-col items-end">
                        <div className="border-b border-slate-300 pb-1.5 mb-1.5 w-full flex flex-col items-end">
                            {warranty.artisan?.parentGoldArtisan ? (
                                <>
                                    <span className="text-[7px] font-black uppercase text-black mb-0.5">Membre du Réseau</span>
                                    <img src={warranty.artisan.parentGoldArtisan.image || "/logo.png"} alt="Network" className="max-h-10 object-contain" crossOrigin="anonymous" />
                                    <span className="text-[6px] font-bold text-black uppercase mt-0.5">Partenaire HORIZON CHIMIQUE</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-[7px] font-black uppercase text-black mb-0.5">Propulsé Par</span>
                                    <img src={company?.logoUrl || "/logo.png"} alt="Horizon" className="max-h-10 object-contain" crossOrigin="anonymous" />
                                </>
                            )}
                        </div>
                        <h1 className="text-xl font-black text-primary uppercase leading-none mb-1">Garantie d'Étanchéité</h1>
                        <p className="font-mono text-xs font-bold text-black">Réf: {warranty.contractNumber}</p>
                        <p className="text-[9px] font-sans text-black">Émis le: {new Date(warranty.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-grow space-y-3">
                    
                    {/* Project Info Block */}
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                        <h3 className="text-primary font-black uppercase text-[10px] mb-2 border-b border-slate-300 pb-0.5">Identité du Projet</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <p className="text-[8px] uppercase font-bold text-black">Maître d'Ouvrage (Client)</p>
                                <p className="font-black text-black">{warranty.chantier?.clientName || warranty.clientName}</p>
                            </div>
                            <div>
                                <p className="text-[8px] uppercase font-bold text-black">Contact Téléphonique</p>
                                <p className="font-black text-black">{warranty.chantier?.clientPhone || warranty.clientPhone || '-'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[8px] uppercase font-bold text-black">Localisation du Projet</p>
                                <p className="font-bold text-black leading-tight">{warranty.chantier?.address || '-'}</p>
                            </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-300 grid grid-cols-4 gap-2 text-[9px] uppercase font-sans font-bold text-black">
                            {warranty.chantier?.surface_sol > 0 && <span>Toiture: {warranty.chantier.surface_sol} m²</span>}
                            {warranty.chantier?.surface_murs > 0 && <span>Murs: {warranty.chantier.surface_murs} m²</span>}
                            {warranty.chantier?.lineaire_acrotere > 0 && <span>Acrotère: {warranty.chantier.lineaire_acrotere} ml</span>}
                            <span>Support: {warranty.chantier?.support_type || 'Béton'}</span>
                        </div>
                    </div>

                    {/* Products Used */}
                    {warranty.chantier?.products?.length > 0 && (
                        <div className="p-2 border border-slate-200 rounded">
                            <p className="text-[9px] font-black uppercase text-primary mb-1">Système d'Étanchéité Horizon Chimique :</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-black text-black">
                                {warranty.chantier.products.map((p, i) => <span key={i}>• {p.designation}</span>)}
                            </div>
                        </div>
                    )}

                    {/* Terms & Validity */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-2 rounded border border-slate-200">
                            <h3 className="text-primary font-bold uppercase text-[9px] border-b border-slate-300 mb-1 pb-0.5">Applicateur de Certification</h3>
                            <p className="font-black text-[13px] text-black uppercase">{warranty.artisan?.name}</p>
                            <p className="text-[9px] font-sans font-bold text-black truncate">{warranty.artisan?.email}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col justify-center">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <span className="text-[8px] font-bold uppercase">Durée de Garantie:</span>
                                <span className="text-[13px] font-black text-black">{warranty.duration}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-[8px] font-bold uppercase">Date de Début:</span>
                                <span className="text-[11px] font-black text-primary">{warranty.startDate ? new Date(warranty.startDate).toLocaleDateString('fr-FR') : '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Coverage Details */}
                    <div className="space-y-1">
                        <h3 className="text-primary font-black uppercase text-[10px] border-b border-slate-300 pb-0.5">Conditions de Garantie</h3>
                        <div className="text-justify text-[11px] leading-relaxed text-black italic">
                            {warranty.coverageDetails || "La garantie couvre l'étanchéité de l'ouvrage selon les normes en vigueur."}
                        </div>
                        
                        {/* Maintenance Expert Tip */}
                        <div className="bg-primary/5 p-2 rounded border border-primary/20 mt-1.5 flex gap-2 items-start">
                             <div className="bg-primary p-1 rounded-full shrink-0 mt-0.5"><ShieldCheck size={10} className="text-white" /></div>
                             <div className="text-justify">
                                <p className="text-[10px] font-black text-primary uppercase mb-0.5">Note de Maintenance Préventive :</p>
                                <p className="text-[10px] text-black leading-snug">
                                    "Afin de garantir l'efficacité optimale de l'étanchéité au-delà de sa durée contractuelle, 
                                    nous recommandons la réalisation d'un entretien périodique tous les 3 ans. 
                                    Ces opérations de maintenance préventive sont à la charge du client."
                                </p>
                             </div>
                        </div>
                    </div>

                    {/* Visits Table */}
                    {warranty.maintenanceVisits?.length > 0 && (
                        <div>
                            <p className="text-[8px] font-black text-primary uppercase mb-0.5 font-sans tracking-tight">Planning des Contrôles Techniques</p>
                            <table className="w-full text-[8px] border border-slate-300 border-collapse">
                                <tr className="bg-slate-100 font-bold uppercase">
                                    <th className="border border-slate-300 p-0.5 text-left">Visite</th>
                                    <th className="border border-slate-300 p-0.5 text-center">Date</th>
                                    <th className="border border-slate-300 p-0.5 text-right w-20">Statut</th>
                                </tr>
                                {warranty.maintenanceVisits.slice(0, 5).map((v, i) => (
                                    <tr key={i} className="font-bold">
                                        <td className="border border-slate-300 p-0.5 uppercase">N°{i + 1}</td>
                                        <td className="border border-slate-300 p-0.5 text-center">{new Date(v.date || v).toLocaleDateString('fr-FR')}</td>
                                        <td className="border border-slate-300 p-0.5 text-right text-[7px]">{v.status === 'completed' ? 'RÉALISÉE ✅' : 'À PRÉVOIR'}</td>
                                    </tr>
                                ))}
                            </table>
                        </div>
                    )}
                </div>

                {/* SIGNATURES FOOTER - Symmetric 2-Column Design */}
                <div className="mt-8 pt-4 border-t border-slate-300">
                    <div className="grid grid-cols-2 items-center px-2">
                        
                        {/* Left Column: QR Verification */}
                        <div className="flex flex-col items-start pl-4">
                            <div className="bg-white p-2 border border-slate-200 rounded-xl shadow-sm">
                                <QRCodeSVG
                                    value={typeof window !== 'undefined' ? `${window.location.origin}/verify/warranty/${id}` : ''}
                                    size={80}
                                    level="L"
                                />
                            </div>
                            <p className="text-[8px] font-black uppercase mt-2 tracking-[0.3em] text-slate-500">Authenticité Cloud</p>
                        </div>

                        {/* Right Column: Artisan Signature & Stamp */}
                        <div className="flex flex-col items-end pr-4">
                            <p className="text-[10px] font-black uppercase text-black mb-1 border-b-[2px] border-primary pb-0.5 px-3">Signature Applicateur</p>
                            <div className="h-[40mm] w-[100mm] flex items-center justify-end relative">
                                {(includeCachet && (warranty.artisan?.cachet || warranty.artisan?.parentGoldArtisan?.cachet)) ? (
                                    <img 
                                        src={warranty.artisan?.cachet || warranty.artisan?.parentGoldArtisan?.cachet} 
                                        alt="Cachet de l'Applicateur" 
                                        crossOrigin="anonymous"
                                        className="max-h-[40mm] max-w-[100mm] object-contain mix-blend-multiply" 
                                        style={{ transform: 'rotate(-1deg)' }}
                                    />
                                ) : (
                                    <div className="h-full flex items-center text-[10px] text-slate-300 italic">Signature & Cachet</div>
                                )}
                            </div>
                            <p className="text-[9px] font-black text-slate-900 uppercase mt-1 italic leading-tight">{warranty.artisan?.companyName || warranty.artisan?.name}</p>
                            {warranty.artisan?.phone && (
                                <p className="text-[8px] font-bold text-slate-600 font-sans mt-0.5 italic">Tél: {warranty.artisan.phone}</p>
                            )}
                            {warranty.artisan?.taxId && (
                                <p className="text-[8px] font-bold text-slate-600 font-sans italic uppercase">MF: {warranty.artisan.taxId}</p>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Download Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-primary/10 p-4 rounded-full mb-4">
                                <ShieldCheck className="text-primary" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Options du PDF</h3>
                            <p className="text-slate-500 text-sm mb-6 font-sans">Souhaitez-vous inclure le <span className="font-bold text-slate-800">cachet de l'artisan</span> dans ce document ?</p>
                            
                            <div className="grid grid-cols-1 gap-3 w-full">
                                <button
                                    onClick={() => generatePdf(true)}
                                    className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg"
                                >
                                    Oui, inclure le cachet
                                </button>
                                <button
                                    onClick={() => generatePdf(false)}
                                    className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Non, sans cachet
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="w-full text-slate-400 text-xs mt-2 hover:text-red-500"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: A4; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
