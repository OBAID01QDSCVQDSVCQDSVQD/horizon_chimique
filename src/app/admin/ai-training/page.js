
'use client';

import { useState, useEffect } from 'react';
import { Bot, Plus, Save, Trash2, XCircle, Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AiTrainingPage() {
    const [systems, setSystems] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        triggerKeywords: '', // stored as comma-separated string for input
        basePrompt: '',
        products: [] // { product: id, role: string, consumptionRate: number, usageInstructions: string }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [sRes, pRes] = await Promise.all([
                fetch('/api/admin/ai-systems'),
                fetch('/api/products/bulk') // Reuse existing bulk product fetch or create simple one
            ]);

            const sData = await sRes.json();
            const pData = await pRes.json(); // Assuming this returns { products: [] }

            if (sData.success) setSystems(sData.data);
            if (pData.products) setProducts(pData.products); // Adjust based on your products API structure
        } catch (error) {
            console.error(error);
            toast.error("Erreur chargement");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (sys) => {
        setEditingId(sys._id);
        setFormData({
            name: sys.name,
            triggerKeywords: sys.triggerKeywords.join(', '),
            basePrompt: sys.basePrompt,
            products: sys.products.map(p => ({
                product: p.product?._id || p.product, // handle populated or ID
                role: p.role || 'primary',
                consumptionRate: p.consumptionRate || 0,
                usageInstructions: p.usageInstructions || ''
            }))
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ name: '', triggerKeywords: '', basePrompt: '', products: [] });
    };

    const addProductRow = () => {
        setFormData({
            ...formData,
            products: [...formData.products, { product: '', role: 'primary', consumptionRate: 0, usageInstructions: '' }]
        });
    };

    const removeProductRow = (index) => {
        const newProds = formData.products.filter((_, i) => i !== index);
        setFormData({ ...formData, products: newProds });
    };

    const handleProductChange = (index, field, value) => {
        const newProds = [...formData.products];
        newProds[index] = { ...newProds[index], [field]: value };
        setFormData({ ...formData, products: newProds });
    };

    const handleSave = async () => {
        if (!formData.name || !formData.basePrompt) return toast.error("Nom et Prompt requis");

        const payload = {
            ...formData,
            triggerKeywords: formData.triggerKeywords.split(',').map(k => k.trim()).filter(k => k),
            products: formData.products.filter(p => p.product) // Remove empty rows
        };

        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { id: editingId, ...payload } : payload;

            const res = await fetch('/api/admin/ai-systems', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (data.success) {
                toast.success(editingId ? "Système mis à jour" : "Système créé");
                fetchData(); // Refresh list
                handleCancel();
            } else {
                toast.error(data.error || "Erreur sauvegarde");
            }
        } catch (error) {
            toast.error("Erreur serveur");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer ce système ?")) return;
        try {
            const res = await fetch(`/api/admin/ai-systems?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Supprimé");
                setSystems(systems.filter(s => s._id !== id));
            }
        } catch (error) { toast.error("Erreur"); }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                    <Bot size={32} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">AI Training Center</h1>
                    <p className="text-slate-500">Enseignez à l'IA vos systèmes d'étanchéité et règles de calcul.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Editor Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                {editingId ? <Sparkles className="text-yellow-500" size={20} /> : <Plus className="text-green-500" size={20} />}
                                {editingId ? "Modifier le Système" : "Nouveau Système"}
                            </h2>
                            {editingId && (
                                <button onClick={handleCancel} className="text-sm text-slate-400 hover:text-red-500 flex items-center gap-1">
                                    <XCircle size={16} /> Annuler
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nom du Système</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border rounded-lg bg-slate-50"
                                    placeholder="ex: Système Complet - Sols Béton"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Mots-clés Déclencheurs (séparés par virgule)</label>
                                <input
                                    type="text"
                                    value={formData.triggerKeywords}
                                    onChange={(e) => setFormData({ ...formData, triggerKeywords: e.target.value })}
                                    className="w-full p-2 border rounded-lg bg-slate-50 font-mono text-sm"
                                    placeholder="béton, dalle, ciment, neuf..."
                                />
                                <p className="text-xs text-slate-400 mt-1">L'IA choisira ce système si la demande du client contient ces mots.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Produits & Rôles</label>
                                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    {formData.products.map((p, i) => (
                                        <div key={i} className="flex gap-2 items-start">
                                            <select
                                                value={p.product}
                                                onChange={(e) => handleProductChange(i, 'product', e.target.value)}
                                                className="flex-1 p-2 border rounded bg-white text-sm"
                                            >
                                                <option value="">-- Produit --</option>
                                                {products.map(prod => (
                                                    <option key={prod._id} value={prod._id}>{prod.designation} ({prod.reference})</option>
                                                ))}
                                            </select>
                                            <select
                                                value={p.role}
                                                onChange={(e) => handleProductChange(i, 'role', e.target.value)}
                                                className="w-32 p-2 border rounded bg-white text-sm"
                                            >
                                                <option value="primary">Couche Base</option>
                                                <option value="finish">Finition</option>
                                                <option value="reinforcement">Renfort</option>
                                                <option value="accessory">Accessoire</option>
                                            </select>
                                            <div className="w-24">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="L/m²"
                                                    value={p.consumptionRate}
                                                    onChange={(e) => handleProductChange(i, 'consumptionRate', e.target.value)}
                                                    className="w-full p-2 border rounded text-sm text-center"
                                                />
                                            </div>
                                            <button onClick={() => removeProductRow(i)} className="p-2 text-red-400 hover:text-red-600">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={addProductRow} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-2">
                                        <Plus size={14} /> Ajouter un produit
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Prompt Système ("Le Cerveau")</label>
                                <textarea
                                    value={formData.basePrompt}
                                    onChange={(e) => setFormData({ ...formData, basePrompt: e.target.value })}
                                    rows={5}
                                    className="w-full p-2 border rounded-lg bg-slate-800 text-white font-mono text-sm"
                                    placeholder="Décrivez les règles : 'La couche de base doit être diluée à 20%. Si surface > 100m², ajouter renfort...'"
                                />
                                <p className="text-xs text-slate-500 mt-1">C'est ici que vous expliquez à l'IA comment utiliser les produits sélectionnés.</p>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 transition-colors flex justify-center gap-2"
                            >
                                <Save size={20} /> Enregistrer le Système
                            </button>
                        </div>
                    </div>
                </div>

                {/* List Column */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-600 uppercase text-xs tracking-wider">Systèmes Actifs</h3>
                    {systems.length === 0 && <p className="text-slate-400 text-sm italic">Aucun système défini.</p>}

                    {systems.map(sys => (
                        <div
                            key={sys._id}
                            onClick={() => handleEdit(sys)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${editingId === sys._id ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-white border-slate-200 hover:border-primary/50'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800">{sys.name}</h4>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(sys._id); }}
                                    className="text-slate-300 hover:text-red-500"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                                {sys.triggerKeywords.slice(0, 3).map((k, i) => (
                                    <span key={i} className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600">{k}</span>
                                ))}
                                {sys.triggerKeywords.length > 3 && <span className="text-[10px] text-slate-400">+{sys.triggerKeywords.length - 3}</span>}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded">
                                <span className="font-bold">{sys.products.length}</span> produits liés
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
