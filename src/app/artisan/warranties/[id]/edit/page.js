'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Check, Search, Trash2, Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditWarrantyPage({ params }) {
    const router = useRouter();
    const { id } = params;

    const toTitleCase = (str) => {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    };

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        clientName: '',
        clientPhone: '',
        address: '',
        surface_sol: '',
        lineaire_acrotere: '',
        surface_murs: '',
        support_type: 'Béton',
        startDate: '',
        duration: '10 Ans',
        maintenanceVisits: []
    });

    const [selectedProducts, setSelectedProducts] = useState([]);

    // Products DB state
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch catalogue products
                const prodRes = await fetch('/api/products', { cache: 'no-store' });
                const prodData = await prodRes.json();
                if (prodData.success) {
                    setProducts(prodData.data || []);
                }

                // Fetch Warranty & Chantier
                const res = await fetch(`/api/warranties/${id}`, { cache: 'no-store' });
                const wData = await res.json();

                if (wData.success && wData.data) {
                    const warranty = wData.data;
                    const chantier = warranty.chantier;

                    setFormData({
                        clientName: chantier.clientName || warranty.clientName || '',
                        clientPhone: chantier.clientPhone || warranty.clientPhone || '',
                        address: chantier.address || '',
                        surface_sol: chantier.surface_sol || 0,
                        lineaire_acrotere: chantier.lineaire_acrotere || 0,
                        surface_murs: chantier.surface_murs || 0,
                        support_type: chantier.support_type || 'Béton',
                        startDate: warranty.startDate ? new Date(warranty.startDate).toISOString().split('T')[0] : '',
                        duration: warranty.duration || '10 Ans',
                        maintenanceVisits: warranty.maintenanceVisits && warranty.maintenanceVisits.length > 0
                            ? warranty.maintenanceVisits.map(v => v.date ? new Date(v.date).toISOString().split('T')[0] : '')
                            : ['']
                    });

                    if (chantier.products && chantier.products.length > 0) {
                        setSelectedProducts(chantier.products);
                    }
                } else {
                    toast.error("Garantie introuvable");
                    router.push('/artisan/warranties');
                }
            } catch (error) {
                console.error(error);
                toast.error("Erreur de chargement");
            } finally {
                setLoadingProducts(false);
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id, router]);

    const handleDateChange = (index, value) => {
        const newVisits = [...formData.maintenanceVisits];
        newVisits[index] = value;
        setFormData({ ...formData, maintenanceVisits: newVisits });
    };

    const addDate = () => setFormData({ ...formData, maintenanceVisits: [...formData.maintenanceVisits, ''] });
    const removeDate = (index) => setFormData({ ...formData, maintenanceVisits: formData.maintenanceVisits.filter((_, i) => i !== index) });

    const toggleProduct = (productDesignation) => {
        const exists = selectedProducts.find(p => p.designation === productDesignation);
        if (exists) {
            setSelectedProducts(prev => prev.filter(p => p.designation !== productDesignation));
        } else {
            setSelectedProducts(prev => [...prev, { designation: productDesignation, quantity: 1 }]);
        }
    };

    const updateQuantity = (designation, qty) => {
        setSelectedProducts(prev => prev.map(p =>
            p.designation === designation ? { ...p, quantity: parseInt(qty) || 1 } : p
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.clientName || !formData.clientPhone) {
            toast.error("Veuillez remplir les informations du client.");
            return;
        }

        const validVisits = formData.maintenanceVisits.filter(d => d && d !== '');

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                maintenanceVisits: validVisits.map(d => ({ date: d, status: 'pending' })),
                products: selectedProducts
            };

            const res = await fetch(`/api/warranties/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Modifications enregistrées !");
                router.push('/artisan/warranties');
            } else {
                toast.error(data.error || "Erreur de sauvegarde.");
            }
        } catch (error) {
            toast.error("Erreur technique");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p => (p.designation || '').toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 size={40} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Retour aux garanties
                </button>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="bg-primary p-6 text-white flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Modifier la Garantie</h1>
                            <p className="text-blue-100">Modifiez les informations de la garantie et du chantier associé.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* Informations Client */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">1. Informations Client</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Nom du Client</label>
                                    <input type="text" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: toTitleCase(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Téléphone Client</label>
                                    <input type="text" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Adresse du Client</label>
                                    <input type="text" placeholder="Ex: Tunis, Centre Ville" value={formData.address} onChange={(e) => setFormData({ ...formData, address: toTitleCase(e.target.value) })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Détails Techniques */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">2. Détails Techniques (Chantier)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Surface Sol (m²)</label>
                                    <input type="number" value={formData.surface_sol} onChange={(e) => setFormData({ ...formData, surface_sol: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Linéaire Acrotère (ml)</label>
                                    <input type="number" value={formData.lineaire_acrotere} onChange={(e) => setFormData({ ...formData, lineaire_acrotere: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Surface Murs (m²)</label>
                                    <input type="number" value={formData.surface_murs} onChange={(e) => setFormData({ ...formData, surface_murs: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Type de Support</label>
                                    <select value={formData.support_type} onChange={(e) => setFormData({ ...formData, support_type: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
                                        <option value="Béton">Béton</option>
                                        <option value="Enduit">Enduit</option>
                                        <option value="Carrelage">Carrelage</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Produits */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">3. Produits Utilisés</h3>
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                <div className="relative mb-3">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input type="text" placeholder="Rechercher un produit..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary" />
                                </div>

                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {loadingProducts ? <div className="text-center py-4 text-slate-400 italic text-sm">Chargement...</div> : filteredProducts.length === 0 ? <div className="text-center py-4 text-slate-400 italic text-sm">Aucun produit trouvé.</div> : (
                                        filteredProducts.map(product => {
                                            const isSelected = selectedProducts.find(p => p.designation === product.designation);
                                            return (
                                                <div key={product._id} onClick={() => toggleProduct(product.designation)} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border-primary' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white'}`}>
                                                        {isSelected && <Check size={12} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-800">{product.designation}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <input type="number" min="1" value={isSelected.quantity} onChange={(e) => updateQuantity(product.designation, e.target.value)} className="w-20 px-2 py-1 text-sm border border-primary rounded-md focus:outline-none font-bold text-center" placeholder="Qté" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 mt-2 text-right">{selectedProducts.length} produit(s) sélectionné(s)</p>
                            </div>
                        </div>

                        {/* Garantie Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">4. Informations de la Garantie</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Date de début</label>
                                    <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Durée de Garantie</label>
                                    <select value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
                                        <option value="1 An">1 An</option>
                                        <option value="2 Ans">2 Ans</option>
                                        <option value="5 Ans">5 Ans</option>
                                        <option value="10 Ans">10 Ans</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 mb-2 block">Dates de Maintenance / Contrôle</label>
                                <div className="space-y-2">
                                    {formData.maintenanceVisits.map((date, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input type="date" value={date} onChange={(e) => handleDateChange(index, e.target.value)} className="flex-1 p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-primary/20 outline-none" />
                                            {formData.maintenanceVisits.length > 1 && (
                                                <button type="button" onClick={() => removeDate(index)} className="px-4 text-red-500 hover:bg-red-50 border border-red-100 rounded-xl transition-colors">
                                                    <Trash2 size={20} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={addDate} className="text-primary text-sm font-bold flex items-center gap-1 mt-3 hover:underline">
                                        <Plus size={16} /> Ajouter une date de contrôle
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button type="submit" disabled={submitting} className="w-full md:w-auto px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70">
                                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                Enregistrer les modifications
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
