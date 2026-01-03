'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Save, Loader2, ArrowLeft, Upload, FileText, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingPdf, setUploadingPdf] = useState(false);

    const [formData, setFormData] = useState({
        designation: '',
        gamme: 'Étanchéité Liquide',
        description_courte: '',
        informations: '',
        domaine_application: '',
        avantages: '',
        caracteristiques: {
            aspect: '',
            rendement: '',
            temps_sechage: '',
            conditionnement: ''
        },
        donnees_techniques: {
            couleur: '',
            densite: '',
            extrait_sec: '',
            limites_temperature: ''
        },
        preparation_support: '',
        conditions_application: '',
        mise_en_oeuvre: '',
        consommation: '',
        nettoyage: '',
        stockage: '',
        securite: '',
        point_fidelite: 0,
        images: [],
        pdfUrl: ''
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                const data = await res.json();

                if (data.success) {
                    const p = data.data;
                    setFormData({
                        ...p,
                        avantages: p.avantages ? p.avantages.join('\n') : '',
                        securite: p.securite ? p.securite.join('\n') : '',
                        images: p.images || [],
                        pdfUrl: p.pdf_url || '',
                        caracteristiques: p.caracteristiques || { aspect: '', rendement: '', temps_sechage: '', conditionnement: '' },
                        donnees_techniques: p.donnees_techniques || { couleur: '', densite: '', extrait_sec: '', limites_temperature: '' }
                    });
                } else {
                    toast.error('Produit introuvable');
                    router.push('/admin/products');
                }
            } catch (error) {
                console.error(error);
                toast.error('Erreur lors du chargement');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id, router]);

    const handleFileUpload = async (e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = type === 'image';
        if (isImage) setUploadingImage(true);
        else setUploadingPdf(true);

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });
            const data = await res.json();

            if (data.success) {
                setFormData(prev => {
                    if (isImage) {
                        return { ...prev, images: [...prev.images, data.url] };
                    } else {
                        return { ...prev, pdfUrl: data.url };
                    }
                });
                toast.success('Fichier téléchargé avec succès !');
            } else {
                toast.error(data.error || 'Erreur lors du téléversement');
            }
        } catch (error) {
            console.error(error);
            toast.error('Erreur serveur lors de l\'envoi');
        } finally {
            if (isImage) setUploadingImage(false);
            else setUploadingPdf(false);
        }
    };

    const categories = [
        'Étanchéité Liquide',
        'Adjuvants pour Béton',
        'Revêtements de Sol',
        'Mortiers Spéciaux',
        'Protection de Façades',
        'Isolation Thermique'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                avantages: formData.avantages.split('\n').filter(line => line.trim() !== ''),
                securite: formData.securite.split('\n').filter(line => line.trim() !== ''),
                images: formData.images,
                pdf_url: formData.pdfUrl
            };

            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Produit modifié avec succès !');
                router.push('/admin/products');
            } else {
                throw new Error(data.error || 'Erreur lors de la modification');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const SectionHeader = ({ title }) => (
        <div className="bg-primary px-6 py-4 border-b border-primary-dark/10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {title}
            </h3>
        </div>
    );

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="mb-8">
                <Link href="/admin/products" className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1 mb-2">
                    <ArrowLeft size={16} /> Retour à la liste
                </Link>
                <div className="flex justify-between items-end">
                    <h1 className="text-3xl font-bold text-slate-900">Modifier le Produit</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* --- 1. IDENTIFICATION GÉNÉRALE --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800">Identification du Produit</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Désignation (H1) *</label>
                            <input type="text" name="designation" required value={formData.designation} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-lg font-semibold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Gamme / Catégorie *</label>
                            <select name="gamme" required value={formData.gamme} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-bold text-slate-700">Description Courte (Intro Header)</label>
                            <textarea name="description_courte" rows="3" required value={formData.description_courte} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-blue-50/30"></textarea>
                        </div>
                    </div>
                </div>

                {/* --- 2. INFORMATIONS --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader title="Informations" />
                    <div className="p-6">
                        <textarea name="informations" rows="4" value={formData.informations} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
                    </div>
                </div>

                {/* --- 3. DOMAINE D'APPLICATION --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader title="Domaine d'application" />
                    <div className="p-6">
                        <textarea name="domaine_application" rows="4" value={formData.domaine_application} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
                    </div>
                </div>

                {/* --- 4. CARACTÉRISTIQUES ET AVANTAGES --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader title="Caractéristiques et Avantages" />
                    <div className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Liste des Avantages (Un par ligne)</label>
                            <textarea name="avantages" rows="6" value={formData.avantages} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Couleur</label>
                                <input type="text" name="donnees_techniques.couleur" value={formData.donnees_techniques.couleur} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded bg-white" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Densité</label>
                                <input type="text" name="donnees_techniques.densite" value={formData.donnees_techniques.densite} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded bg-white" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Extrait Sec</label>
                                <input type="text" name="donnees_techniques.extrait_sec" value={formData.donnees_techniques.extrait_sec} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded bg-white" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Rendement (Texte)</label>
                                <input type="text" name="caracteristiques.rendement" value={formData.caracteristiques.rendement} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded bg-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 5. PRÉPARATION DU SUPPORT --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader title="Préparation du support" />
                    <div className="p-6">
                        <textarea name="preparation_support" rows="5" value={formData.preparation_support} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
                    </div>
                </div>

                {/* --- 6. APPLICATION --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader title="Application" />
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-bold text-slate-700">Méthode et Étapes</label>
                            <textarea name="mise_en_oeuvre" rows="6" value={formData.mise_en_oeuvre} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Conditions d'application</label>
                            <textarea name="conditions_application" rows="3" value={formData.conditions_application} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Temps de séchage</label>
                            <input type="text" name="caracteristiques.temps_sechage" value={formData.caracteristiques.temps_sechage} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                        </div>
                    </div>
                </div>

                {/* --- 7. CONSOMMATION --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader title="Consommation" />
                    <div className="p-6">
                        <textarea name="consommation" rows="3" value={formData.consommation} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
                    </div>
                </div>

                {/* --- 8. NETTOYAGE DES ÉQUIPEMENTS --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader title="Nettoyage des équipements" />
                    <div className="p-6">
                        <textarea name="nettoyage" rows="2" value={formData.nettoyage} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
                    </div>
                </div>

                {/* --- 9. STOCKAGE --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader title="Stockage" />
                    <div className="p-6">
                        <textarea name="stockage" rows="2" value={formData.stockage} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
                    </div>
                </div>

                {/* --- 10. CONSIGNES DE SÉCURITÉ --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <SectionHeader title="Consignes de sécurité" />
                    <div className="p-6">
                        <textarea name="securite" rows="4" value={formData.securite} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"></textarea>
                    </div>
                </div>

                {/* --- 11. FICHIERS & MÉDIAS --- */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            Galerie & Fichiers
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Images */}
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-sm font-bold text-slate-700 block">Galerie d'Images</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="relative border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer min-h-[150px]">
                                    {uploadingImage ? (
                                        <div className="flex flex-col items-center gap-2 text-primary">
                                            <Loader2 className="animate-spin" size={24} />
                                            <span className="text-xs font-medium">Ajout...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <ImageIcon className="text-slate-400 mb-2" size={32} />
                                            <span className="text-xs font-bold text-slate-600">Ajouter Image</span>
                                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        </>
                                    )}
                                </div>
                                {formData.images.map((url, index) => (
                                    <div key={index} className="relative rounded-lg border border-slate-200 overflow-hidden group min-h-[150px] bg-white">
                                        <img src={url} alt={`Produit`} className="w-full h-full object-contain p-2" />
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* PDF */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 block">Fiche Technique (PDF)</label>
                            <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors text-center min-h-[150px]">
                                {uploadingPdf ? (
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                ) : formData.pdfUrl ? (
                                    <div className="flex flex-col items-center">
                                        <FileText className="text-red-500 mb-2" size={40} />
                                        <p className="text-xs text-slate-500 break-all mb-2">{formData.pdfUrl.split('/').pop()}</p>
                                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, pdfUrl: '' }))} className="text-red-600 text-xs font-bold underline">Supprimer</button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="text-slate-400 mb-2" size={32} />
                                        <span className="text-xs font-bold text-slate-600">Ajouter PDF</span>
                                        <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e, 'pdf')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-2xl flex justify-center gap-4 z-50">
                    <Link href="/admin/products" className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50">Annuler</Link>
                    <button type="submit" disabled={submitting} className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all transform hover:scale-105 shadow-lg flex items-center gap-2">
                        {submitting ? <Loader2 className="animate-spin" /> : <Save />} Mettre à jour le Produit
                    </button>
                </div>

            </form>
        </div>
    );
}
