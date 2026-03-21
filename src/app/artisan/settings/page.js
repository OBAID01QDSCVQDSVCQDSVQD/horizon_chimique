'use client';

import { useState, useEffect } from 'react';
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
        companyName: '',
        address: '',
        lastLocation: null,
        bio: '',
    });
    const [loading, setLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);

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

                toast.success("Photo mise à jour et enregistrée !", { id: toastId });
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

                            {/* Profile Image */}
                            <div className="flex justify-center mb-6">
                                <div className="relative w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden group cursor-pointer hover:border-primary transition-colors">
                                    {formData.image ? (
                                        <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <User size={48} />
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                        {uploadingImage ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                                        <span className="text-xs font-bold mt-1">Modifier</span>
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImage}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
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
                                        onLocationSelect={(loc) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                lastLocation: loc,
                                                address: loc.address || prev.address // Auto-fill address if available
                                            }));
                                        }}
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
