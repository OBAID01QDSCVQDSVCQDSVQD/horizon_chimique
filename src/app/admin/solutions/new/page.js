'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Save, Loader2, ArrowLeft, Search, Check, Plus, X } from 'lucide-react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const ICONS = ['Droplets', 'Layers', 'ShieldCheck', 'Hammer', 'Component', 'Paintbrush', 'Zap', 'Archive', 'Box', 'Building2'];
const COLORS = [
    { label: 'Bleu', value: 'bg-blue-500' },
    { label: 'Vert', value: 'bg-emerald-500' },
    { label: 'Orange', value: 'bg-orange-500' },
    { label: 'Violet', value: 'bg-purple-500' },
    { label: 'Rouge', value: 'bg-red-500' },
    { label: 'Cyan', value: 'bg-cyan-500' },
    { label: 'Slate', value: 'bg-slate-700' },
];

export default function NewSolutionPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        features: '',
        icon: 'Layers',
        color: 'bg-blue-500',
        relatedProducts: []
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                if (data.success) {
                    setProducts(data.data);
                }
            } catch (error) {
                console.error('Failed to load products');
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDescriptionChange = (content) => {
        setFormData({ ...formData, description: content });
    };

    const toggleProduct = (productId) => {
        setFormData(prev => {
            if (prev.relatedProducts.includes(productId)) {
                return { ...prev, relatedProducts: prev.relatedProducts.filter(id => id !== productId) };
            } else {
                return { ...prev, relatedProducts: [...prev.relatedProducts, productId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                features: formData.features.split('\n').filter(line => line.trim() !== '')
            };

            const res = await fetch('/api/solutions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success('Solution créée avec succès');
                router.push('/admin/solutions');
            } else {
                throw new Error('Erreur');
            }
        } catch (error) {
            toast.error('Erreur lors de la création');
        } finally {
            setSubmitting(false);
        }
    };

    const renderIcon = (iconName) => {
        const Icon = LucideIcons[iconName];
        return Icon ? <Icon size={24} /> : null;
    };

    const filteredProducts = products.filter(p =>
        p.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <Link href="/admin/solutions" className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-sm flex items-center gap-1 mb-6">
                <ArrowLeft size={16} /> Retour
            </Link>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">Ajouter une Nouvelle Solution</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="font-bold text-slate-700 dark:text-slate-300">Titre de la Solution</label>
                            <input name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Ex: Étanchéité Liquide" />
                        </div>

                        <div className="space-y-2">
                            <label className="font-bold text-slate-700 dark:text-slate-300">Description Détaillée</label>
                            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-primary/20">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.description}
                                    onChange={handleDescriptionChange}
                                    className="h-80 mb-12" // Add margin bottom for toolbar
                                />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Vous pouvez copier-coller du texte formaté (Word, Web) directement ici.
                            </p>
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <div className="space-y-2">
                            <label className="font-bold text-slate-700 dark:text-slate-300">Icône</label>
                            <div className="grid grid-cols-5 gap-2 border border-slate-300 dark:border-slate-600 p-2 rounded-lg max-h-40 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
                                {ICONS.map(icon => (
                                    <button
                                        type="button"
                                        key={icon}
                                        onClick={() => setFormData({ ...formData, icon })}
                                        className={`p-2 rounded flex flex-col items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 ${formData.icon === icon ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-primary dark:text-primary' : ''}`}
                                    >
                                        {renderIcon(icon)}
                                        <span className="text-[10px] truncate w-full text-center">{icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="font-bold text-slate-700 dark:text-slate-300">Couleur</label>
                            <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-300 dark:border-slate-600">
                                {COLORS.map(c => (
                                    <label key={c.value} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-700 dark:text-slate-300">
                                        <input type="radio" name="color" value={c.value} checked={formData.color === c.value} onChange={handleChange} className="text-primary bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-500" />
                                        <div className={`w-6 h-6 rounded-full ${c.value} border border-slate-200 dark:border-slate-600`}></div>
                                        <span className="text-sm font-medium">{c.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="font-bold text-slate-700 dark:text-slate-300">Caractéristiques (Une par ligne)</label>
                        <textarea name="features" rows="4" value={formData.features} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white" placeholder="Toitures&#10;Terrasses&#10;Fondations"></textarea>
                    </div>

                    {/* Related Products Selection */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                        <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Check className="text-primary" size={18} /> Produits Associés
                            <span className="text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">Optionnel</span>
                        </label>

                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                                {loadingProducts ? (
                                    <div className="text-center py-4 text-slate-500">Chargement...</div>
                                ) : filteredProducts.map(product => {
                                    const isSelected = formData.relatedProducts.includes(product._id);
                                    return (
                                        <div
                                            key={product._id}
                                            onClick={() => toggleProduct(product._id)}
                                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${isSelected ? 'bg-primary/10 border-primary dark:bg-primary/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                                        >
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary text-white' : 'border-slate-300 dark:border-slate-500'}`}>
                                                {isSelected && <Check size={12} />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{product.designation}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-2 text-xs text-slate-500 text-right">
                                {formData.relatedProducts.length} produit(s) sélectionné(s)
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 mt-4">
                        {submitting ? <Loader2 className="animate-spin" /> : <Save />} Enregistrer la Solution
                    </button>
                </form>
            </div>

            {/* Custom Styles for Quill in Dark Mode */}
            <style jsx global>{`
                .ql-toolbar {
                    background-color: #f8fafc;
                    border-color: #e2e8f0 !important;
                    border-top-left-radius: 0.5rem;
                    border-top-right-radius: 0.5rem;
                }
                .dark .ql-toolbar {
                    background-color: #1e293b;
                    border-color: #475569 !important;
                }
                .dark .ql-toolbar .ql-stroke {
                    stroke: #cbd5e1;
                }
                .dark .ql-toolbar .ql-fill {
                    fill: #cbd5e1;
                }
                .dark .ql-toolbar .ql-picker {
                    color: #cbd5e1;
                }
                .ql-container {
                    border-color: #e2e8f0 !important;
                    border-bottom-left-radius: 0.5rem;
                    border-bottom-right-radius: 0.5rem;
                    font-size: 1rem;
                }
                .dark .ql-container {
                    border-color: #475569 !important;
                }
                .ql-editor {
                    min-height: 200px;
                }
            `}</style>
        </div>
    );
}
