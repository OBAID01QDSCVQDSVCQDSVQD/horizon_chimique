'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Edit2, CheckCircle, XCircle, LayoutTemplate, Link as LinkIcon, Image as ImageIcon, Upload, Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialForm = {
        title: '',
        content: '',
        position: 'left',
        color: 'bg-gradient-to-br from-blue-600 to-blue-800',
        link: '',
        image: '',
        isActive: true
    };
    const [formData, setFormData] = useState(initialForm);

    const colorPresets = [
        { name: 'Océan (Bleu)', value: 'bg-gradient-to-br from-blue-600 to-blue-800' },
        { name: 'Émeraude (Vert)', value: 'bg-gradient-to-br from-teal-500 to-emerald-600' },
        { name: 'Royal (Violet)', value: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
        { name: 'Amber (Orange)', value: 'bg-gradient-to-br from-amber-500 to-orange-600' },
        { name: 'Nuit (Sombre)', value: 'bg-gradient-to-b from-slate-900 to-slate-800' },
    ];

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('/api/campaigns');
            const data = await res.json();
            if (data.success) {
                setCampaigns(data.campaigns);
            }
        } catch (error) {
            toast.error("Erreur chargement");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            });
            const json = await res.json();
            if (json.success) {
                setFormData({ ...formData, image: json.url });
                toast.success("Image téléchargée");
            } else {
                toast.error("Échec du téléchargement");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur de connexion");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingId ? `/api/campaigns/${editingId}` : '/api/campaigns';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                toast.success(editingId ? "Campagne modifiée !" : "Campagne créée !");
                setFormData(initialForm);
                setEditingId(null);
                fetchCampaigns();
            } else {
                toast.error(data.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur de connexion");
        }
    };

    const handleEdit = (camp) => {
        setFormData(camp);
        setEditingId(camp._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cette campagne ?")) return;
        try {
            const res = await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Supprimé !");
                fetchCampaigns();
            }
        } catch (error) {
            toast.error("Erreur");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Megaphone className="text-primary" /> Gestion des Campagnes
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Gérez les publicités affichées sur le tableau de bord des artisans.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit lg:sticky lg:top-8 transition-colors">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                        {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                        {editingId ? 'Modifier Campagne' : 'Nouvelle Campagne'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titre</label>
                            <input
                                type="text" required
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Offre Spéciale"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contenu</label>
                            <textarea
                                required rows="3"
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Détails de l'offre..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Position</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    value={formData.position}
                                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                                >
                                    <option value="left">Gauche (Principal)</option>
                                    <option value="right">Droite (Secondaire)</option>
                                </select>
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-primary rounded focus:ring-primary bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                                <ImageIcon size={14} /> Image de fond
                            </label>

                            {formData.image ? (
                                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 group">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: '' })}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg hover:border-primary/50 dark:hover:border-primary/50 transition-colors cursor-pointer relative bg-slate-50 dark:bg-slate-900/50">
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                    <div className="space-y-1 text-center">
                                        {uploading ? (
                                            <Loader2 className="mx-auto h-12 w-12 text-slate-400 animate-spin" />
                                        ) : (
                                            <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                        )}
                                        <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                                            <span className="font-medium text-primary hover:text-primary-dark">
                                                {uploading ? 'Téléchargement...' : 'Télécharger une image'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, GIF jusqu'à 5MB</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                                <LinkIcon size={14} /> Lien de redirection (Optionnel)
                            </label>
                            <input
                                type="url"
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
                                value={formData.link || ''}
                                onChange={e => setFormData({ ...formData, link: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Thème (Couleur)</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg outline-none mb-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                                value={colorPresets.some(p => p.value === formData.color) ? formData.color : 'custom'}
                            >
                                {colorPresets.map((p, i) => (
                                    <option key={i} value={p.value}>{p.name}</option>
                                ))}
                                <option value="custom">Personnalisé</option>
                            </select>

                            {/* Preview */}
                            <div
                                className={`w-full h-24 rounded-lg ${formData.color.includes('bg-') ? formData.color : 'bg-slate-200 dark:bg-slate-700'} shadow-sm flex items-center justify-center text-white text-sm font-bold bg-cover bg-center transition-all`}
                                style={formData.image ? { backgroundImage: `url(${formData.image})`, backgroundBlendMode: 'overlay', backgroundColor: 'rgba(0,0,0,0.3)' } : {}}
                            >
                                {formData.title || 'Aperçu'}
                            </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button type="submit" disabled={uploading} className="flex-1 bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-lg shadow-primary/20">
                                {editingId ? 'Mettre à jour' : 'Créer'}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={() => { setEditingId(null); setFormData(initialForm); }}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Annuler
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* List Column */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Campagnes Existantes</h3>

                    {loading ? (
                        <div className="text-center py-10 text-slate-400">Chargement...</div>
                    ) : campaigns.length === 0 ? (
                        <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                            <Megaphone className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} />
                            <p className="text-slate-500 dark:text-slate-400">Aucune campagne.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {campaigns.map((camp) => (
                                <div key={camp._id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4 items-start relative overflow-hidden group transition-colors">
                                    {camp.isActive && <div className="absolute top-0 right-0 w-2 h-full bg-green-500"></div>}

                                    {/* Visual Preview */}
                                    <div
                                        className={`w-full sm:w-32 h-24 shrink-0 rounded-lg ${camp.color} flex items-center justify-center text-white shadow-md bg-cover bg-center`}
                                        style={camp.image ? { backgroundImage: `url(${camp.image})`, backgroundBlendMode: 'overlay', backgroundColor: 'rgba(0,0,0,0.3)' } : {}}
                                    >
                                        {!camp.image && <LayoutTemplate size={24} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-lg text-slate-900 dark:text-white truncate">{camp.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold uppercase">{camp.position === 'left' ? 'Gauche' : 'Droite'}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{camp.content}</p>

                                        {/* Meta Links */}
                                        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mb-3">
                                            {camp.link && <span className="flex items-center gap-1"><LinkIcon size={12} /> Lien actif</span>}
                                            {camp.image && <span className="flex items-center gap-1"><ImageIcon size={12} /> Image</span>}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleEdit(camp)}
                                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                            >
                                                <Edit2 size={12} /> Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDelete(camp._id)}
                                                className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                                            >
                                                <Trash2 size={12} /> Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
