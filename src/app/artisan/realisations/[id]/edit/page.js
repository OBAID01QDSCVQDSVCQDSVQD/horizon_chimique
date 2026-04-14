'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, UploadCloud, X, Save, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EditRealizationPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: [],
        images: [],
        video: ''
    });

    const definedTags = ['Peinture', 'Etanchéité', 'Isolation', 'Résine', 'Béton', 'Décoration', 'Plomberie', 'Electricité'];

    useEffect(() => {
        if (!id) return;

        fetch(`/api/realizations/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setFormData({
                        title: data.realization.title,
                        description: data.realization.description,
                        tags: data.realization.tags || [],
                        images: data.realization.images || [],
                        video: data.realization.video || ''
                    });
                } else {
                    toast.error("Impossible de charger le projet");
                    router.push('/artisan/realisations');
                }
            })
            .catch(() => toast.error("Erreur de connexion"))
            .finally(() => setLoading(false));
    }, [id, router]);

    const toggleTag = (tag) => {
        setFormData(prev => {
            if (prev.tags.includes(tag)) {
                return { ...prev, tags: prev.tags.filter(t => t !== tag) };
            } else {
                return { ...prev, tags: [...prev.tags, tag] };
            }
        });
    };

    const handleFileUpload = async (e, type = 'image') => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (type === 'image' && formData.images.length + files.length > 10) {
            toast.error("Maximum 10 images autorisées");
            return;
        }

        setUploading(true);
        const newUrls = [];

        try {
            for (const file of files) {
                const data = new FormData();
                data.append('file', file);

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: data
                });

                const json = await res.json();
                if (json.success) {
                    if (type === 'video') {
                        setFormData(prev => ({ ...prev, video: json.url }));
                        toast.success("Vidéo mise à jour");
                        setUploading(false);
                        return;
                    }
                    newUrls.push(json.url);
                } else {
                    toast.error(`Erreur upload: ${file.name}`);
                }
            }

            if (type === 'image') {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...newUrls]
                }));
                if (newUrls.length > 0) toast.success(`${newUrls.length} image(s) ajoutée(s)`);
            }

        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'upload");
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const removeVideo = () => {
        setFormData(prev => ({ ...prev, video: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/realizations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Modifications enregistrées !");
                router.push('/artisan/realisations');
            } else {
                toast.error(data.error || "Erreur de sauvegarde");
            }
        } catch (error) {
            toast.error("Erreur réseau");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin text-primary" size={40} /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-8 pb-24">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <Link href="/artisan/realisations" className="flex items-center text-slate-500 hover:text-slate-800 mb-2 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Annuler
                    </Link>
                    <h1 className="text-2xl font-black text-slate-900">Modifier le Projet</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Titre du projet</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-400 font-medium"
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Catégories</label>
                            <div className="flex flex-wrap gap-2">
                                {definedTags.map(tag => {
                                    const isSelected = formData.tags.includes(tag);
                                    return (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleTag(tag)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border flex items-center gap-2 ${isSelected
                                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary/50'
                                                }`}
                                        >
                                            {tag}
                                            {isSelected && <Check size={14} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <textarea
                                required
                                rows={6}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-400"
                            ></textarea>
                        </div>

                        {/* Multimedia Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Images */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Photos (Max 10)</label>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    {formData.images.map((url, index) => (
                                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden group bg-slate-100 border border-slate-200">
                                            <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.images.length < 10 && (
                                        <div className="relative aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary hover:bg-slate-100 transition-all cursor-pointer group">
                                            {uploading ? (
                                                <Loader2 className="animate-spin" />
                                            ) : (
                                                <>
                                                    <UploadCloud size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                                                    <span className="text-xs font-bold">Ajouter Photo</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => handleFileUpload(e, 'image')}
                                                disabled={uploading}
                                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                             {/* Video */}
                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Vidéo du projet</label>
                                {formData.video ? (
                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black group border border-slate-200">
                                        <video src={formData.video} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                             <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                                 <Check size={24} />
                                             </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeVideo}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative aspect-video bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-primary hover:text-primary hover:bg-slate-100 transition-all cursor-pointer group">
                                        {uploading ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <>
                                                <UploadCloud size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                                                <span className="text-sm font-bold">Ajouter une Vidéo</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => handleFileUpload(e, 'video')}
                                            disabled={uploading}
                                            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving || uploading}
                            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
