
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Sparkles, Loader2, FileText, Printer, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SmartCalculatorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        clientName: '',
        surfaceArea: '',
        supportType: 'Béton',
        specificIssues: ''
    });

    const calculate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/ai/estimate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                router.push('/merci?type=devis');
            } else {
                toast.error(data.error || "Erreur de calcul");
            }
        } catch (error) {
            toast.error("Erreur connexion");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8 print:hidden">
                    <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20 text-white">
                        <Calculator size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Smart Devis <span className="text-primary">AI</span></h1>
                        <p className="text-slate-500 font-medium">Calculateur de quantité intelligent & devis instantané</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* INPUT FORM (Hidden on Print) */}
                    <div className={`lg:col-span-1 print:hidden ${step === 2 ? 'hidden lg:block' : ''}`}>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-700">
                                <Sparkles size={18} className="text-yellow-500" /> Données du Chantier
                            </h2>

                            <form onSubmit={calculate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nom du Client</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.clientName}
                                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                        className="w-full p-3 border rounded-xl bg-slate-50 outline-primary"
                                        placeholder="ex: Ahmed Ben Ali"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Surface (m²)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.surfaceArea}
                                        onChange={(e) => setFormData({ ...formData, surfaceArea: e.target.value })}
                                        className="w-full p-3 border rounded-xl bg-slate-50 outline-primary font-mono font-bold text-lg"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Type de Support</label>
                                    <select
                                        value={formData.supportType}
                                        onChange={(e) => setFormData({ ...formData, supportType: e.target.value })}
                                        className="w-full p-3 border rounded-xl bg-slate-50 outline-primary"
                                    >
                                        <option value="Béton">Béton / Ciment</option>
                                        <option value="Carrelage">Carrelage / Faïence</option>
                                        <option value="Pax">Ancien PaxAlu / Bitume</option>
                                        <option value="Humide">Support Humide</option>
                                        <option value="Métal">Métallique / Zinc</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Problèmes Spécifiques</label>
                                    <textarea
                                        value={formData.specificIssues}
                                        onChange={(e) => setFormData({ ...formData, specificIssues: e.target.value })}
                                        className="w-full p-3 border rounded-xl bg-slate-50 outline-primary text-sm"
                                        placeholder="ex: Fissures importantes, Infiltrations..."
                                        rows={3}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex justify-center items-center gap-2 shadow-xl shadow-slate-900/10"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <>Calculer avec IA <ArrowRight size={18} /></>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RESULT / DEVIS */}
                    <div className="lg:col-span-2">
                        {!result ? (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 print:hidden">
                                {loading ? (
                                    <>
                                        <Loader2 size={48} className="animate-spin mb-4 text-primary" />
                                        <p className="font-medium animate-pulse">Analyse des besoins...</p>
                                        <p className="text-sm">L'IA choisit les meilleurs produits pour vous.</p>
                                    </>
                                ) : (
                                    <>
                                        <Calculator size={48} className="mb-4 opacity-50" />
                                        <p className="font-medium">Entrez les données pour générer un devis.</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 print:shadow-none print:rounded-none">

                                {/* DEVIS HEADER */}
                                <div className="bg-slate-900 text-white p-8 print:bg-white print:text-black print:border-b-2 print:border-slate-800">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-black uppercase tracking-wider mb-2">Devis Estimatif</h2>
                                            <p className="text-slate-400 print:text-slate-600 text-sm">Généré par Horizon Smart System</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{formData.clientName}</p>
                                            <p className="text-sm opacity-80">{new Date().toLocaleDateString()}</p>
                                            <div className="mt-2 inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold border border-white/20 print:border-black print:bg-slate-100">
                                                {result.systemName}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* TECHNICAL SPECS */}
                                <div className="p-8 pb-4 border-b border-slate-100">
                                    <div className="grid grid-cols-3 gap-6 text-sm">
                                        <div>
                                            <span className="block text-xs uppercase text-slate-400 font-bold mb-1">Surface</span>
                                            <span className="block font-bold text-slate-800 text-lg">{formData.surfaceArea} m²</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs uppercase text-slate-400 font-bold mb-1">Support</span>
                                            <span className="block font-bold text-slate-800 text-lg">{formData.supportType}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs uppercase text-slate-400 font-bold mb-1">Complexité</span>
                                            <span className="block font-bold text-slate-800 text-lg">{formData.specificIssues ? 'Haute' : 'Standard'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* PRODUCTS TABLE */}
                                <div className="p-8">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                            <tr>
                                                <th className="py-3 px-4 text-left rounded-l-lg">Produit</th>
                                                <th className="py-3 px-4 text-left">Usage</th>
                                                <th className="py-3 px-4 text-right">Qté Estimée</th>
                                                <th className="py-3 px-4 text-right rounded-r-lg">Conditionnement</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {result.data.items.map((item, i) => (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-4 px-4 font-bold text-slate-800">
                                                        {item.productName}
                                                        <span className="block text-xs text-slate-400 font-normal">{item.reference}</span>
                                                    </td>
                                                    <td className="py-4 px-4 text-slate-600 italic">{item.usage}</td>
                                                    <td className="py-4 px-4 text-right font-mono font-bold text-primary">{item.quantity}</td>
                                                    <td className="py-4 px-4 text-right font-bold">{item.packs}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* AI ADVICE */}
                                <div className="mx-8 mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-100">
                                    <h3 className="text-yellow-700 font-bold text-sm uppercase mb-3 flex items-center gap-2">
                                        <Sparkles size={16} /> Conseil Technique (IA)
                                    </h3>
                                    <p className="text-slate-700 text-sm leading-relaxed italic">
                                        "{result.data.advice}"
                                    </p>
                                </div>

                                {/* ACTIONS */}
                                <div className="bg-slate-50 p-6 flex justify-between items-center print:hidden">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="text-slate-500 font-bold text-sm hover:underline"
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2"
                                    >
                                        <Printer size={18} /> Imprimer / PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
