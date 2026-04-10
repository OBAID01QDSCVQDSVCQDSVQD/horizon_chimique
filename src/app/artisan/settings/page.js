'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, Save, ArrowLeft, Building, MapPin, FileText, User, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import LocationPicker from '@/components/LocationPicker';

export default function ProfileSettings() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // We ideally should fetch current full profile data here if session is stale,
    // but for now we assume session might need a refresh or we use a fetch.
    // For simplicity, I'll rely on what user types or fetches via SWR/useEffect.
    // Let's do a quick fetch on mount in a real app.
    // Here I will just init form with generic values or assume user fills them.
    // Better: Fetch real data.

    const [formData, setFormData] = useState({
        name: session?.user?.name || '',
        image: session?.user?.image || '',
        cachet: '',
        companyName: '',
        address: '',
        lastLocation: null,
        bio: '',
    });
    const [loading, setLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingCachet, setUploadingCachet] = useState(false);

    // Fetch real data on load
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile');
                const data = await res.json();
                if (data.success && data.user) {
                    setFormData(prev => ({
                        ...prev,
                        ...data.user
                    }));
                }
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if session is ready
        if (session) {
            fetchProfile();
        }
    }, [session]);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const toastId = toast.loading("Upload de l'image...");

        try {
            const uploadData = new FormData();
            uploadData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });
            const data = await res.json();

            if (data.success) {
                const newUrl = data.url;
                setFormData(prev => ({ ...prev, image: newUrl }));

                // Auto-save to DB and Session
                await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: newUrl })
                });
                await update({ image: newUrl });

                toast.success("Photo mise à jour !", { id: toastId });
            } else {
                toast.error("Erreur upload", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur technique", { id: toastId });
        } finally {
            setUploadingImage(false);
        }
    };

    const handleCachetUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingCachet(true);
        const toastId = toast.loading("Traitement et upload du cachet...");

        try {
            // Processing Image to remove white background
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imgData.data;

                    // Improved: Linear interpolation similar to Python's keep_solid
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        
                        // Calculate Euclidean distance from white (255, 255, 255)
                        const dist = Math.sqrt(
                            Math.pow(r - 255, 2) + 
                            Math.pow(g - 255, 2) + 
                            Math.pow(b - 255, 2)
                        );
                        
                        // Same logic as Python script:
                        // dist <= 20: alpha = 0 (transparent)
                        // dist >= 100: alpha = 255 (opaque)
                        // in between: linear transition
                        let alpha = 255;
                        if (dist <= 20) {
                            alpha = 0;
                        } else if (dist < 100) {
                            // (dist - 20) / (100 - 20) * 255
                            alpha = Math.round(((dist - 20) / 80) * 255);
                        }
                        
                        data[i + 3] = alpha; // Set Alpha
                    }
                    ctx.putImageData(imgData, 0, 0);

                    // Convert canvas to blob
                    canvas.toBlob(async (blob) => {
                        const uploadData = new FormData();
                        uploadData.append('file', blob, 'cachet.png');

                        const res = await fetch('/api/upload', {
                            method: 'POST',
                            body: uploadData
                        });
                        const uploadResult = await res.json();

                        if (uploadResult.success) {
                            setFormData(prev => ({ ...prev, cachet: uploadResult.url }));
                            toast.success("Cachet traité et enregistré !", { id: toastId });
                        } else {
                            toast.error("Erreur upload cachet", { id: toastId });
                        }
                        setUploadingCachet(false);
                    }, 'image/png');
                };
            };
        } catch (error) {
            console.error(error);
            toast.error("Erreur technique", { id: toastId });
            setUploadingCachet(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                // Only update session fields if needed
                await update({ name: formData.name, image: formData.image });
                toast.success("Profil mis à jour !");
                router.refresh();
            } else {
                toast.error("Erreur de sauvegarde");
            }
        } catch (error) {
            toast.error("Erreur technique");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLocationSelect = useCallback((loc) => {
        setFormData(prev => ({
            ...prev,
            lastLocation: loc,
            address: loc.address || prev.address
        }));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" /> Retour
                </button>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                        <h1 className="text-xl font-bold text-slate-800">Modifier mon Profil</h1>
                        <Save size={20} className="text-slate-400" />
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Images Section */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                {/* Profile Image */}
                                <div className="flex flex-col items-center">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2">Photo de profil</label>
                                    <div className="relative w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden group cursor-pointer hover:border-primary transition-colors">
                                        {formData.image ? (
                                            <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <User size={48} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                            {uploadingImage ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                                            <span className="text-[10px] font-bold mt-1">Changer</span>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>

                                {/* Cachet / Stamp */}
                                <div className="flex flex-col items-center">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2">Cachet Applicateur</label>
                                    <div className="relative w-32 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 shadow-sm overflow-hidden group transition-all flex items-center justify-center">
                                        {formData.cachet ? (
                                            <>
                                                <div className="p-2 w-full h-full">
                                                    <img src={formData.cachet} alt="Cachet" className="w-full h-full object-contain mix-blend-multiply" />
                                                </div>
                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        if (confirm("Voulez-vous vraiment supprimer votre cachet ?")) {
                                                            const newFormData = { ...formData, cachet: '' };
                                                            setFormData(newFormData);
                                                            const res = await fetch('/api/profile', {
                                                                method: 'PUT',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ cachet: '' })
                                                            });
                                                            if (res.ok) toast.success("Cachet supprimé !");
                                                        }
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600 shadow-md"
                                                    title="Supprimer le cachet"
                                                >
                                                    <Loader2 size={14} className="hidden" />
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center p-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-500">
                                                    <Upload size={20} />
                                                </div>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase leading-tight block">Upload Cachet<br/>(Fond blanc auto-supprimé)</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                                            {uploadingCachet ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                                            <span className="text-[10px] font-bold mt-1">Mettre à jour</span>
                                            <input type="file" accept="image/*" onChange={handleCachetUpload} disabled={uploadingCachet} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-2 text-center leading-tight">Uploadez votre cachet sur fond blanc.<br/>Il apparaîtra sur vos certificats.</p>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                    <User size={16} className="text-primary" /> Nom Complet
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            {/* Company Info */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                    <Building size={16} className="text-primary" /> Nom de l'Entreprise
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Entreprise Bati-Renov"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                    <MapPin size={16} className="text-primary" /> Adresse / Ville
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Tunis, Ariana..."
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none mb-4"
                                />

                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                    <MapPin size={16} className="text-primary" /> Localisation Exacte (GPS)
                                </label>
                                <div className="p-1 border border-slate-200 rounded-xl overflow-hidden">
                                    <LocationPicker
                                        initialLocation={formData.lastLocation}
                                        onLocationSelect={handleLocationSelect}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Cette localisation permettra aux clients de vous trouver dans la section "Experts à proximité".
                                </p>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                    <FileText size={16} className="text-primary" /> Bio / Description
                                </label>
                                <textarea
                                    rows="4"
                                    placeholder="Décrivez vos services..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                />
                            </div>

                            {/* Contact & Legal */}
                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Coordonnées & Réseaux</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Numéro de téléphone</label>
                                        <input
                                            type="tel"
                                            placeholder="+216 00 000 000"
                                            value={formData.phone || ''}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">Utilisable pour la connexion classique</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">WhatsApp</label>
                                        <input
                                            type="tel"
                                            placeholder="+216..."
                                            value={formData.whatsapp || ''}
                                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Matricule Fiscale</label>
                                        <input
                                            type="text"
                                            placeholder="Pour facturation..."
                                            value={formData.taxId || ''}
                                            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Site Web</label>
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={formData.website || ''}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Facebook</label>
                                        <input
                                            type="url"
                                            placeholder="Lien profil..."
                                            value={formData.facebook || ''}
                                            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Instagram</label>
                                        <input
                                            type="url"
                                            placeholder="Lien profil..."
                                            value={formData.instagram || ''}
                                            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : 'Enregistrer les modifications'}
                            </button>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
