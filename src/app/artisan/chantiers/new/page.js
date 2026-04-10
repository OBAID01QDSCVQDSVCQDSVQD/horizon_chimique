'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Upload, Check, Search, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewChantierPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const toTitleCase = (str) => {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    };

    // Form State
    const [formData, setFormData] = useState({
        clientName: '',
        clientPhone: '',
        address: '',
        invoiceImage: '',
        surface_sol: '',
        lineaire_acrotere: '',
        surface_murs: '',
        support_type: 'Béton',
    });
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Products State
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Image Upload State
    const [uploadingImage, setUploadingImage] = useState(false);

    // Fetch Products on Load
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                if (data.success) {
                    setProducts(data.data || []); // API returns { data: [...] }
                }
            } catch (error) {
                console.error("Error fetching products", error);
                toast.error("Erreur de chargement des produits");
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const toastId = toast.loading("Upload de la facture...");

        try {
            const uploadData = new FormData();
            uploadData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });
            const data = await res.json();

            if (data.success) {
                setFormData(prev => ({ ...prev, invoiceImage: data.url }));
                toast.success("Facture téléchargée !", { id: toastId });
            } else {
                toast.error("Erreur upload", { id: toastId });
            }
        } catch (error) {
            toast.error("Erreur technique", { id: toastId });
        } finally {
            setUploadingImage(false);
        }
    };

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

        if (!formData.clientName || !formData.clientPhone || !formData.address) {
            toast.error("Veuillez remplir tous les champs obligatoires (Client, Téléphone, Adresse).");
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                products: selectedProducts
            };

            const res = await fetch('/api/chantiers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                if (data.smsStatus?.sent) {
                    toast.success("Chantier déclaré ! SMS envoyé au client.");
                } else {
                    toast.success("Chantier déclaré !");
                    if (data.smsStatus?.error) {
                        toast.error(`SMS non envoyé: ${data.smsStatus.error}`, { duration: 5000 });
                    }
                }
                router.push('/artisan/dashboard');
            } else {
                toast.error(data.error || "Erreur lors de la déclaration.");
            }
        } catch (error) {
            toast.error("Erreur technique");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProducts = products.filter(p =>
        (p.designation || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" /> Annuler
                </button>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="bg-primary p-6 text-white">
                        <h1 className="text-2xl font-bold">Nouveau Chantier</h1>
                        <p className="text-blue-100">Remplissez ce formulaire pour valider vos points.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* 1. Client Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">1</span>
                                Informations Client
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Nom du Client</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Ahmed Ben Ali"
                                        value={formData.clientName}
                                        onChange={(e) => setFormData({ ...formData, clientName: toTitleCase(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Téléphone Client</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 50 123 456"
                                        value={formData.clientPhone}
                                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Adresse du Chantier (Client)</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Tunis, Centre Ville"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: toTitleCase(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Technical Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">2</span>
                                Détails Techniques
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Surface Toiture (m²)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.surface_sol}
                                        onChange={(e) => setFormData({ ...formData, surface_sol: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Linéaire Acrotère (ml)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.lineaire_acrotere}
                                        onChange={(e) => setFormData({ ...formData, lineaire_acrotere: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Surface Murs (m²)</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.surface_murs}
                                        onChange={(e) => setFormData({ ...formData, surface_murs: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">Type de Support</label>
                                    <select
                                        value={formData.support_type}
                                        onChange={(e) => setFormData({ ...formData, support_type: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="Béton">Béton</option>
                                        <option value="Enduit">Enduit</option>
                                        <option value="Carrelage">Carrelage</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 3. Products */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">3</span>
                                Produits Utilisés
                            </h3>

                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                <div className="relative mb-3">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher un produit..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {loadingProducts ? (
                                        <div className="text-center py-4 text-slate-400 italic text-sm">Chargement des produits...</div>
                                    ) : filteredProducts.length === 0 ? (
                                        <div className="text-center py-4 text-slate-400 italic text-sm">Aucun produit trouvé.</div>
                                    ) : (
                                        filteredProducts.map(product => {
                                            const isSelected = selectedProducts.find(p => p.designation === product.designation);
                                            return (
                                                <div
                                                    key={product._id}
                                                    onClick={() => toggleProduct(product.designation)}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border-primary' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                                >
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white'}`}>
                                                        {isSelected && <Check size={12} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-800">{product.designation}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-1">
                                                            {Array.isArray(product.gamme) ? product.gamme.join(', ') : (product.gamme || 'Divers')}
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={isSelected.quantity}
                                                                onChange={(e) => updateQuantity(product.designation, e.target.value)}
                                                                className="w-20 px-2 py-1 text-sm border border-primary rounded-md focus:outline-none font-bold text-center"
                                                                placeholder="Qté"
                                                            />
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

                        {/* 4. Invoice Image */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs">4</span>
                                Photo de la Facture <span className="text-slate-400 font-normal text-sm ml-2">(Optionnel)</span>
                            </h3>

                            <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors group">
                                {formData.invoiceImage ? (
                                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                        <img src={formData.invoiceImage} alt="Facture" className="w-full h-full object-contain bg-slate-200" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white font-bold bg-black/50 px-3 py-1 rounded-full">Changer l'image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-4">
                                        {uploadingImage ? (
                                            <Loader2 size={40} className="animate-spin text-primary mx-auto mb-2" />
                                        ) : (
                                            <Upload size={40} className="text-slate-400 group-hover:text-primary transition-colors mx-auto mb-2" />
                                        )}
                                        <p className="text-sm font-medium text-slate-700">Cliquez pour ajouter une photo</p>
                                        <p className="text-xs text-slate-400 mt-1">Format JPG, PNG (Max 5Mo)</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* 5. Summary */}
                        <div className="bg-slate-100 rounded-xl p-5 border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">5</span>
                                Récapitulatif
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Client</h4>
                                    <p className="font-medium text-slate-900">{formData.clientName || 'Non défini'}</p>
                                    <p className="text-slate-600">{formData.clientPhone || 'Non défini'}</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Détails Techniques</h4>
                                    <ul className="text-sm space-y-1 text-slate-600">
                                        <li>Sol: <span className="font-bold text-slate-900">{formData.surface_sol || 0} m²</span></li>
                                        <li>Acrotère: <span className="font-bold text-slate-900">{formData.lineaire_acrotere || 0} ml</span></li>
                                        <li>Murs: <span className="font-bold text-slate-900">{formData.surface_murs || 0} m²</span></li>
                                        <li>Support: <span className="font-bold text-slate-900">{formData.support_type}</span></li>
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Produits ({selectedProducts.length})</h4>
                                {selectedProducts.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic">Aucun produit sélectionné</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProducts.map((p, i) => (
                                            <span key={i} className="bg-white px-3 py-1 rounded-full text-sm font-medium border border-slate-200 shadow-sm">
                                                <span className="font-bold text-primary mr-1">{p.quantity}x</span> {p.designation}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : 'Envoyer la Déclaration'}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}
