'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Loader2, Upload, Trash2, Building, Wand2, Settings, Smartphone, RefreshCcw } from 'lucide-react';
import { compressImage } from '@/utils/compressImage';
import Link from 'next/link';
// import { removeBackground } from "@imgly/background-removal"; // Removed in favor of manual white removal

// Custom helper to remove white background using Canvas
const removeWhiteBackground = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const threshold = 230; // Sensitivity for "white" (0-255). Higher = strictly white.

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // If pixel is very light/white, make it transparent
                if (r > threshold && g > threshold && b > threshold) {
                    data[i + 3] = 0; // Alpha = 0 (Transparent)
                }
            }
            ctx.putImageData(imageData, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "_nobg.png", { type: "image/png" });
                    resolve(newFile);
                } else {
                    reject(new Error("Canvas export failed"));
                }
            }, 'image/png');
        };
        img.onerror = (e) => reject(e);
        img.src = URL.createObjectURL(file);
    });
};

export default function SettingsPage() {
    // ... component state ...
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [removeBg, setRemoveBg] = useState(false);
    const [processingBg, setProcessingBg] = useState(false);
    const [uploadingCatalog, setUploadingCatalog] = useState(false);

    // ... formData state ...
    const [formData, setFormData] = useState({
        companyName: '',
        subtitle: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        logoUrl: '',
        catalogUrl: '',
        facebookPixelId: '',
        mobileApp: {
            latestVersion: '1.0.1',
            buildNumber: 3,
            forceUpdate: true,
            updateMessage: '',
            downloadUrl: ''
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data.success) {
                    setFormData(prev => ({
                        ...data.data,
                        mobileApp: data.data.mobileApp || prev.mobileApp
                    }));
                }
            } catch (error) {
                console.error(error);
                toast.error("Impossible de charger les paramètres");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleMobileChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            mobileApp: {
                ...(prev.mobileApp || {}),
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    const pushNewVersion = () => {
        setFormData(prev => ({
            ...prev,
            mobileApp: {
                ...prev.mobileApp,
                buildNumber: (prev.mobileApp.buildNumber || 0) + 1
            }
        }));
        toast.success("Build incrementé ! Cliquez sur Enregistrer pour forcer la mise à jour.");
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        try {
            let fileToUpload = file;

            // 1. Remove White Background if requested (Manual Algo)
            if (removeBg) {
                setProcessingBg(true);
                toast.loading("Suppression du blanc (Algo simple)...", { id: 'bg-remove' });
                try {
                    fileToUpload = await removeWhiteBackground(file);
                    toast.success("Fond blanc supprimé !", { id: 'bg-remove' });
                } catch (err) {
                    console.error("Simple BG Removal failed", err);
                    toast.error("Échec: " + err.message, { id: 'bg-remove' });
                } finally {
                    setProcessingBg(false);
                }
            }

            // 2. Compress (optional, but good for logos if large)
            // Note: If we just removed BG, it's a PNG. Compression might lose transparency if converted to JPG, 
            // but compressImage utility usually handles types. Ensure it preserves PNG or use as is.
            if (!removeBg) {
                // Only compress input if we didn't just generate a fresh PNG, to be safe.
                // Or ensure compressImage handles PNG transparency.
                // We'll skip compression for the generated PNG to avoid complications for now.
                try {
                    fileToUpload = await compressImage(fileToUpload, 0.8);
                } catch (e) {
                    console.warn("Compression skipped", e);
                }
            }

            // 3. Upload
            const uploadData = new FormData();
            uploadData.append('file', fileToUpload);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });
            const data = await res.json();

            if (data.success) {
                setFormData(prev => ({ ...prev, logoUrl: data.url }));
                toast.success("Logo mis à jour");
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'upload du logo");
        } finally {
            setUploadingLogo(false);
            // reset file input
            e.target.value = '';
        }
    };

    const handleCatalogUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingCatalog(true);
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);

            const res = await fetch('/api/upload-pdf', {
                method: 'POST',
                body: uploadData
            });
            const data = await res.json();

            if (data.success) {
                const newCatalogUrl = data.url;
                setFormData(prev => ({ ...prev, catalogUrl: newCatalogUrl }));

                // Auto-save to DB to prevent loss on reload
                toast.loading("Sauvegarde automatique...", { id: 'autosave' });
                await fetch('/api/settings', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, catalogUrl: newCatalogUrl })
                });

                toast.success("Catalogue uploadé et enregistré automatiquement !", { id: 'autosave' });
            } else {
                throw new Error(data.error || "Erreur inconnue");
            }
        } catch (error) {
            console.error(error);
            toast.error("Échec: " + error.message, { id: 'autosave' });
        } finally {
            setUploadingCatalog(false);
            e.target.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            // Handle non-JSON responses (like redirects to login or HTML error pages)
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                const snippet = text.substring(0, 80).replace(/<[^>]*>?/gm, '').trim();
                throw new Error(`Serrveur Error (${res.status}): ${snippet}...`);
            }

            const data = await res.json();
            if (data.success) {
                toast.success("Paramètres enregistrés avec succès !");
            } else {
                throw new Error(data.error || "Une erreur est survenue lors de la sauvegarde.");
            }
        } catch (error) {
            console.error('Settings Save Error:', error);
            toast.error(error.message || "Erreur de sauvegarde", { duration: 5000 });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    <Settings size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Paramètres de l'Entreprise</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gérez les informations affichées sur les fiches techniques et le site.</p>
                </div>
            </div>

            {/* Sub-Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Link href="/admin/settings/about" className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-primary transition-all group flex items-center gap-4">
                    <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                        <Building size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white group-hover:text-primary transition-colors">Page "À Propos"</h3>
                        <p className="text-sm text-slate-400">Modifier le contenu, l'histoire et les chiffres.</p>
                    </div>
                </Link>
                {/* Add more page settings here later */}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Logo Section */}
                <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden p-6">
                    <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Logo & Identité</h2>
                    <div className="flex flex-col md:flex-row items-center gap-8">

                        <div className="space-y-3">
                            <div className="relative w-48 h-32 bg-slate-900 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center overflow-hidden group">
                                {formData.logoUrl ? (
                                    <>
                                        <div
                                            className="w-full h-full p-2 flex items-center justify-center bg-[url('https://res.cloudinary.com/practicaldev/image/fetch/s--u92d18K_--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://dev-to-uploads.s3.amazonaws.com/uploads/articles/db1t1947702r05138110.png')] bg-repeat"
                                        >
                                            {/* Checkerboard background to show transparency */}
                                            <img src={formData.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain relative z-10" />
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))} className="text-white bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-slate-400 flex flex-col items-center">
                                        {(uploadingLogo || processingBg) ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-primary" size={24} />
                                                <span className="text-[10px] whitespace-nowrap">{processingBg ? 'Détourage IA...' : 'Envoi...'}</span>
                                            </div>
                                        ) : <Upload size={24} />}
                                        {!uploadingLogo && <span className="text-xs mt-1">Logo PNG/JPG</span>}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={uploadingLogo || processingBg}
                                />
                            </div>

                            {/* Options Toggle */}
                            <label className={`flex items-center gap-2 cursor-pointer text-sm select-none ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${removeBg ? 'bg-primary border-primary text-white' : 'bg-slate-700 border-slate-600'}`}>
                                    {removeBg && <Wand2 size={12} />}
                                </div>
                                <input type="checkbox" checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)} className="hidden" />
                                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                                    <Wand2 size={14} className={removeBg ? "text-primary" : "text-slate-500"} />
                                    Supprimer l'arrière-plan (IA)
                                </span>
                            </label>
                        </div>

                        <div className="flex-1 w-full space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-300">Nom de l'Entreprise</label>
                                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-2 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-slate-600" required />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-300">Slogan / Sous-titre</label>
                                <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full px-4 py-2 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-slate-600" placeholder="Ex: Solutions Techniques & Bâtiment" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Catalog Section */}
                <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden p-6">
                    <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Catalogue Général</h2>

                    {formData.catalogUrl && (
                        <div className="mb-4 bg-slate-900 border border-slate-600 rounded-lg p-4 flex items-center justify-between group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
                                    <Settings size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">Catalogue Actuel</p>
                                    <a href={formData.catalogUrl} target="_blank" className="text-xs text-blue-400 hover:text-blue-300 truncate block">
                                        {formData.catalogUrl.split('/').pop()}
                                    </a>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, catalogUrl: '' }))}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                                title="Supprimer"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}

                    <div className="relative group">
                        <div className={`
                            border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer
                            ${formData.catalogUrl ? 'border-slate-700 bg-slate-800/50' : 'border-slate-600 bg-slate-900'}
                            hover:border-primary hover:bg-slate-800
                        `}>
                            {uploadingCatalog ? (
                                <>
                                    <Loader2 size={32} className="text-primary animate-spin mb-3" />
                                    <p className="text-slate-300 font-medium">{uploadingCatalog ? 'Envoi en cours...' : 'Traitement...'}</p>
                                </>
                            ) : (
                                <>
                                    <div className="p-3 bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                        <Upload size={24} className="text-primary" />
                                    </div>
                                    <p className="text-slate-200 font-medium mb-1">
                                        {formData.catalogUrl ? 'Glisser un nouveau fichier pour remplacer' : 'Cliquez ou glissez votre PDF ici'}
                                    </p>
                                    <p className="text-slate-500 text-xs">Supporte les fichiers volumineux (Max 50MB)</p>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleCatalogUpload}
                            disabled={uploadingCatalog}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden p-6">
                    <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Coordonnées</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-sm font-bold text-slate-300">Adresse Complète</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-slate-600" placeholder="ZI. Oued Ellil, Manouba - Tunisie" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-300">Téléphone</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-slate-600" placeholder="+216 71 608 000" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-300">Email Contact</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-slate-600" placeholder="contact@horizon-chimique.tn" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-300">Site Web</label>
                            <input type="text" name="website" value={formData.website} onChange={handleChange} className="w-full px-4 py-2 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-slate-600" placeholder="www.horizon-chimique.tn" />
                        </div>
                        <div className="md:col-span-2 mt-4">
                            <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">Intégrations (Marketing & Analytique)</h2>
                            <label className="text-sm font-bold text-slate-300">ID du Facebook Pixel</label>
                            <input type="text" name="facebookPixelId" value={formData.facebookPixelId} onChange={handleChange} className="w-full mt-2 px-4 py-2 bg-slate-900 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-slate-600" placeholder="Ex: 123456789012345" />
                            <p className="text-xs text-slate-500 mt-1">Laissez vide pour désactiver le pixel. Uniquement l'ID (ex: 123456789012345), ne copiez pas tout le script.</p>
                        </div>
                    </div>
                </div>
                
                {/* Mobile App Management */}
                <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden p-6">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Smartphone size={20} className="text-primary" />
                            Gestion Application Mobile
                        </h2>
                        <div className="bg-primary/20 text-primary text-[10px] uppercase font-bold px-2 py-1 rounded">
                            Bêta v1
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-300">Version du Store</label>
                                <input type="text" name="latestVersion" value={formData.mobileApp?.latestVersion || ''} onChange={handleMobileChange} className="w-full px-4 py-2 bg-slate-900 border border-slate-600 text-white rounded-lg outline-none" placeholder="Ex: 1.0.2" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-300">Build Actuel (Sert au Push)</label>
                                <div className="flex gap-2">
                                    <input type="number" readOnly value={formData.mobileApp?.buildNumber || 0} className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg outline-none opacity-70" />
                                    <button 
                                        type="button" 
                                        onClick={pushNewVersion}
                                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-bold"
                                        title="Incrémenter la version pour forcer l'update"
                                    >
                                        <RefreshCcw size={18} /> Push
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-300">Message de Mise à jour</label>
                                <textarea name="updateMessage" value={formData.mobileApp?.updateMessage || ''} onChange={handleMobileChange} rows="3" className="w-full px-4 py-2 bg-slate-900 border border-slate-600 text-white rounded-lg outline-none" placeholder="Expliquez les nouveautés..." />
                            </div>
                            
                            <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${formData.mobileApp?.forceUpdate ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                    {formData.mobileApp?.forceUpdate ? <Settings size={14} className="animate-spin" /> : <Smartphone size={14} />}
                                </div>
                                <input type="checkbox" name="forceUpdate" checked={formData.mobileApp?.forceUpdate || false} onChange={handleMobileChange} className="hidden" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white">Forcer la mise à jour (Bloquant)</p>
                                    <p className="text-[10px] text-slate-500">L'utilisateur ne pourra pas utiliser l'app sans mettre à jour.</p>
                                </div>
                            </label>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-bold text-slate-300">URL du fichier APK (Lien direct)</label>
                            <input type="text" name="downloadUrl" value={formData.mobileApp?.downloadUrl || ''} onChange={handleMobileChange} className="w-full px-4 py-2 bg-slate-900 border border-slate-600 text-blue-400 font-mono text-xs rounded-lg outline-none" placeholder="https://..." />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={submitting} className="px-8 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-lg flex items-center gap-2">
                        {submitting ? <Loader2 className="animate-spin" /> : <Save />} Enregistrer les Paramètres
                    </button>
                </div>
            </form>
        </div>
    );
}
