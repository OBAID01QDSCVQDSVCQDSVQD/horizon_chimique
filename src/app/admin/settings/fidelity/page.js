'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Save, RefreshCw, Trophy, Package, Settings, AlertCircle, TrendingUp } from 'lucide-react';

export default function FidelitySettingsPage() {
    const [fidelity, setFidelity] = useState({ bronze: 1.0, silver: 1.2, gold: 1.5 });
    const [products, setProducts] = useState([]);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [savingProducts, setSavingProducts] = useState(false);

    // Fetch Initial Data
    useEffect(() => {
        fetchSettings();
        fetchProducts();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings/fidelity');
            const data = await res.json();
            if (data.success) {
                setFidelity(data.fidelity);
            }
        } catch (error) {
            toast.error("Erreur chargement paramètres");
        } finally {
            setLoadingSettings(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data || []);
            }
        } catch (error) {
            toast.error("Erreur chargement produits");
        } finally {
            setLoadingProducts(false);
        }
    };

    // Handling Inputs
    const handleFidelityChange = (rank, value) => {
        setFidelity(prev => ({ ...prev, [rank]: value }));
    };

    const handleProductPointChange = (id, value) => {
        setProducts(prev => prev.map(p => p._id === id ? { ...p, point_fidelite: value } : p));
    };

    // Save Actions
    const saveSettings = async () => {
        setSavingSettings(true);
        try {
            const res = await fetch('/api/settings/fidelity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fidelity)
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Coefficients mis à jour ! 🚀");
            } else {
                toast.error("Erreur sauvegarde");
            }
        } catch (error) {
            toast.error("Erreur connexion");
        } finally {
            setSavingSettings(false);
        }
    };

    const saveProducts = async () => {
        setSavingProducts(true);
        try {
            // Filter only necessary data
            const payload = products.map(p => ({ _id: p._id, point_fidelite: p.point_fidelite }));

            const res = await fetch('/api/products/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: payload })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Points produits mis à jour ! 📦");
            } else {
                console.error("Save Prods Error:", data);
                toast.error(`Erreur: ${data.error || "Échec de sauvegarde"}`);
            }
        } catch (error) {
            toast.error("Erreur connexion");
        } finally {
            setSavingProducts(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <Toaster position="top-right" />

            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl text-white shadow-lg">
                    <Settings size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Système de Fidélité Avancé</h1>
                    <p className="text-slate-500">Gérez les coefficients de gamification et les points produits.</p>
                </div>
            </div>

            {/* Section 1: Rangs (Coefficient Multiplier) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Trophy className="text-amber-500" size={20} />
                        <h2 className="font-bold text-lg text-slate-800">Configuration des Rangs (Multiplicateurs)</h2>
                    </div>
                    <button
                        onClick={saveSettings}
                        disabled={savingSettings}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70"
                    >
                        {savingSettings ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        Enregistrer Rangs
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Bronze */}
                    <div className="bg-orange-50 rounded-xl p-5 border border-orange-100 transition-all hover:shadow-md">
                        <label className="block text-sm font-bold text-orange-800 mb-2 uppercase tracking-wide">Rang Bronze 🥉</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                step="0.1"
                                value={fidelity.bronze}
                                onChange={(e) => handleFidelityChange('bronze', e.target.value)}
                                className="w-full text-2xl font-bold bg-white border border-orange-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500/20 outline-none text-orange-900"
                            />
                            <span className="text-orange-400 font-bold">x</span>
                        </div>
                        <p className="text-xs text-orange-600/70 mt-2">Coefficient par défaut pour les débutants.</p>
                    </div>

                    {/* Silver */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 transition-all hover:shadow-md">
                        <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Rang Silver 🥈</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                step="0.1"
                                value={fidelity.silver}
                                onChange={(e) => handleFidelityChange('silver', e.target.value)}
                                className="w-full text-2xl font-bold bg-white border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-400/20 outline-none text-slate-700"
                            />
                            <span className="text-slate-400 font-bold">x</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Bonus intermédiaire.</p>
                    </div>

                    {/* Gold */}
                    <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-100 transition-all hover:shadow-md">
                        <label className="block text-sm font-bold text-yellow-700 mb-2 uppercase tracking-wide">Rang Gold 🥇</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                step="0.1"
                                value={fidelity.gold}
                                onChange={(e) => handleFidelityChange('gold', e.target.value)}
                                className="w-full text-2xl font-bold bg-white border border-yellow-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-500/20 outline-none text-yellow-800"
                            />
                            <span className="text-yellow-500 font-bold">x</span>
                        </div>
                        <p className="text-xs text-yellow-600/70 mt-2">Bonus maximum pour les experts.</p>
                    </div>
                </div>
            </div>

            {/* Section 2: Produits (Points Management) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Package className="text-blue-500" size={20} />
                        <h2 className="font-bold text-lg text-slate-800">Gestion des Points par Produit</h2>
                    </div>
                    <button
                        onClick={saveProducts}
                        disabled={savingProducts}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 shadow-lg shadow-primary/20"
                    >
                        {savingProducts ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        Enregistrer Tout ({products.length})
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                                <th className="p-4 font-bold">Produit / Gamme</th>
                                <th className="p-4 font-bold text-center w-48">Points de Base / Unité</th>
                                <th className="p-4 font-bold text-right text-slate-400">ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{product.name || product.designation}</div>
                                        <div className="text-xs text-slate-500">
                                            {Array.isArray(product.gamme) ? product.gamme.join(', ') : product.gamme}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="number"
                                                value={product.point_fidelite || 0}
                                                onChange={(e) => handleProductPointChange(product._id, e.target.value)}
                                                className="w-full max-w-[120px] text-center font-bold text-slate-700 bg-white border border-slate-200 rounded-lg py-2 px-3 focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 text-right text-xs font-mono text-slate-300">
                                        {product._id.substring(0, 8)}...
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && !loadingProducts && (
                        <div className="p-8 text-center text-slate-400 italic">Aucun produit trouvé.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
