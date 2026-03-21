'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Plus, Edit, Trash2, Image as ImageIcon, Video, ToggleLeft, ToggleRight, Check, X, UploadCloud, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminGalleryPage() {
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStats, setUploadStats] = useState({ current: 0, total: 0 });

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        type: 'image',
        url: '',
        images: [],
        title: '',
        description: '',
        category: 'Étanchéité',
        is_published: true
    });

    const CATEGORIES = [
        "Étanchéité (عزل الأسطح)",
        "Piscines (عزل المسابح)",
        "Revêtement Sol (أرضيات)",
        "Façade (واجهات)",
        "Peinture (صباغة)",
        "Autre"
    ];

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const res = await fetch('/api/gallery', { cache: 'no-store' });
            const data = await res.json();
            if (data.success) {
                setMediaList(data.data);
            }
        } catch (error) {
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files || files.length === 0) return;

        setIsUploading(true);
        setUploadStats({ current: 0, total: files.length });
        let uploadedUrls = [];

        try {
            for (const file of files) {
                if (file.size > 20 * 1024 * 1024) {
                    toast.error(`Image ${file.name} est trop grande (Max 20MB) !`);
                    continue;
                }

                const data = new FormData();
                data.append('file', file);

                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

                    const res = await fetch('/api/upload', {
                        method: 'POST',
                        body: data,
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!res.ok) {
                        toast.error(`Échec serveur (${res.status}) pour ${file.name}`);
                        continue;
                    }

                    const result = await res.json();

                    if (result.success && result.url) {
                        uploadedUrls.push(result.url);
                    } else {
                        toast.error(`Erreur pour ${file.name}`);
                    }
                } catch (error) {
                    if (error.name === 'AbortError') {
                        toast.error(`Temps dépassé (Max 60s)`);
                    } else {
                        toast.error(`Connexion perdue: ${file.name}`);
                    }
                } finally {
                    setUploadStats(prev => ({ ...prev, current: prev.current + 1 }));
                }
            }

            if (uploadedUrls.length > 0) {
                setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
                toast.success(`${uploadedUrls.length} image(s) chargée(s) avec succès`);
            }
        } catch (e) {
            toast.error("Processus interrompu");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const togglePublish = async (id, currentStatus) => {
        try {
            const res = await fetch(`/api/gallery/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_published: !currentStatus })
            });
            const data = await res.json();
            if (data.success) {
                setMediaList(prev => prev.map(m => m._id === id ? { ...m, is_published: !currentStatus } : m));
                toast.success(currentStatus ? "Masqué du public" : "Publié en ligne");
            }
        } catch (error) {
            toast.error("Erreur technique");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
        try {
            const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setMediaList(prev => prev.filter(m => m._id !== id));
                toast.success("Élément supprimé");
            }
        } catch (error) {
            toast.error("Erreur, impossible de supprimer");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.type === 'video' && !formData.url) {
            toast.error("Veuillez fournir une URL vidéo.");
            return;
        }

        if (formData.type === 'image' && formData.images.length === 0 && !formData.url) {
            toast.error("Veuillez uploader au moins une image.");
            return;
        }

        setIsSaving(true);
        try {
            const url = editingId ? `/api/gallery/${editingId}` : '/api/gallery';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
                toast.success(editingId ? "Modifié avec succès" : "Ajouté avec succès");
                fetchMedia(); // Refresh
                setShowModal(false);
            } else {
                toast.error(data.error || "Erreur");
            }
        } catch (error) {
            toast.error("Erreur de connexion");
        } finally {
            setIsSaving(false);
        }
    };

    const openModalNew = () => {
        setFormData({ type: 'image', url: '', images: [], title: '', description: '', category: CATEGORIES[0], is_published: true });
        setEditingId(null);
        setShowModal(true);
    };

    const openModalEdit = (item) => {
        setFormData({
            type: item.type,
            url: item.url || '',
            images: item.images && item.images.length > 0 ? item.images : (item.type === 'image' && item.url ? [item.url] : []),
            title: item.title,
            description: item.description || '',
            category: item.category,
            is_published: item.is_published
        });
        setEditingId(item._id);
        setShowModal(true);
    };

    const filteredMedia = mediaList.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Gestion de la Galerie CMS</h1>
                    <p className="text-slate-500 mt-1">Gérez le contenu multimédia visible sur la page réalisations/galerie publique.</p>
                </div>
                <button onClick={openModalNew} className="bg-primary hover:bg-blue-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95">
                    <Plus size={20} /> Ajouter un Média
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center">
                <div className="relative w-full md:w-96 flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher par titre ou catégorie..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-sm font-bold uppercase tracking-wider border-b border-slate-200">
                            <th className="p-4">Aperçu</th>
                            <th className="p-4">Titre & Catégorie</th>
                            <th className="p-4">Type</th>
                            <th className="p-4 text-center">Visibilité</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredMedia.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-slate-400 font-medium italic">Aucun média trouvé.</td></tr>
                        ) : filteredMedia.map(item => (
                            <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-4 w-32">
                                    <div className="w-24 h-16 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center relative">
                                        {item.type === 'image' ? (
                                            <>
                                                <img src={(item.images && item.images.length > 0) ? item.images[0] : item.url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                                                {item.images && item.images.length > 1 && (
                                                    <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded break-keep">
                                                        +{item.images.length - 1}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-slate-400 bg-slate-800 w-full h-full relative">
                                                <Video size={20} className="text-white/80" />
                                                <span className="text-[9px] font-bold text-white mt-1 uppercase tracking-wider absolute bottom-1">Vidéo</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{item.title}</p>
                                    <span className="inline-block px-2 py-0.5 mt-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-md border border-slate-200">{item.category}</span>
                                    {item.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1 truncate max-w-xs" title={item.description}>{item.description}</p>}
                                </td>
                                <td className="p-4">
                                    {item.type === 'image' ? <span className="flex items-center gap-1 text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-max"><ImageIcon size={14} /> Image</span>
                                        : <span className="flex items-center gap-1 text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded w-max"><Video size={14} /> Vidéo</span>}
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => togglePublish(item._id, item.is_published)}
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${item.is_published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                        title={item.is_published ? "Cliquez pour masquer" : "Cliquez pour publier"}
                                    >
                                        {item.is_published ? <><ToggleRight size={16} /> Publié</> : <><ToggleLeft size={16} /> Masqué</>}
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => openModalEdit(item)} className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all" title="Modifier">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Supprimer">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-black text-slate-800">{editingId ? "Modifier le Projet" : "Ajouter au المعرض (Gallery)"}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Titre du Projet <span className="text-red-500">*</span></label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ex: Rénovation piscine..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Catégorie <span className="text-red-500">*</span></label>
                                    <select required value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Type de Média</label>
                                <div className="flex gap-4">
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.type === 'image' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                        <input type="radio" name="type" className="hidden" checked={formData.type === 'image'} onChange={() => setFormData(p => ({ ...p, type: 'image' }))} />
                                        <ImageIcon size={20} /> <span className="font-bold">Image(s)</span>
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.type === 'video' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                        <input type="radio" name="type" className="hidden" checked={formData.type === 'video'} onChange={() => setFormData(p => ({ ...p, type: 'video', url: '' }))} />
                                        <Video size={20} /> <span className="font-bold">Vidéo (Lien)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Dynamic Upload / URL input */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                {formData.type === 'image' ? (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Images ({formData.images.length}) <span className="text-red-500">*</span></label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                            {formData.images.map((img, i) => (
                                                <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 flex items-center justify-center">
                                                    <img src={img} className="max-w-full max-h-full object-contain" />
                                                    <button type="button" onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <div className="aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-white relative hover:border-primary transition-colors cursor-pointer text-center" onClick={() => fileInputRef.current?.click()}>
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileChange} />
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="animate-spin text-primary mb-2" size={24} />
                                                        <p className="text-[10px] font-bold text-slate-500">
                                                            Envoi... {uploadStats.total > 1 ? `(${uploadStats.current}/${uploadStats.total})` : ''}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <><UploadCloud className="text-slate-400 mb-2" size={40} /><p className="font-bold text-slate-700 text-sm">Cliquez ici pour charger une image</p><p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP</p></>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Lien de la Vidéo (YouTube, Vimeo, MP4...) <span className="text-red-500">*</span></label>
                                        <input required type="url" value={formData.url} onChange={e => setFormData(p => ({ ...p, url: e.target.value }))} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 outline-none font-mono text-sm" placeholder="https://..." />
                                        <p className="text-[10px] text-slate-500 mt-1">Assurez-vous que le lien est public ou intégrable (embed).</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description détaillée (Visible dans le Lightbox)</label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                    placeholder="Décrivez ce projet, les défis relevés, les matériaux Horizon Chimique utilisés..."
                                ></textarea>
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <input type="checkbox" checked={formData.is_published} onChange={e => setFormData(p => ({ ...p, is_published: e.target.checked }))} className="w-5 h-5 rounded text-primary focus:ring-primary/50" />
                                <div>
                                    <span className="font-bold text-slate-800 text-sm block">Publier immédiatement</span>
                                    <span className="text-xs text-slate-500">L'élément sera visible sur la galerie publique dès son enregistrement.</span>
                                </div>
                            </label>

                        </form>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors">Annuler</button>
                            <button type="button" onClick={handleSubmit} disabled={isSaving || isUploading} className="bg-primary hover:bg-blue-600 focus:ring-4 ring-primary/20 text-white px-8 py-2 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2">
                                {isSaving ? <><Loader2 className="animate-spin" size={18} /> Enregistrement...</> : <><Check size={18} /> {editingId ? "Mettre à jour" : "Sauvegarder"}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
