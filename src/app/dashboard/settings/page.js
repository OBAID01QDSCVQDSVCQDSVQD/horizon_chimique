'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2, User, Lock, Upload, ArrowLeft, Save, Camera, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
export default function ClientSettings() {
    const { data: session, update } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        image: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.user) {
                        setFormData({
                            name: data.user.name || '',
                            email: data.user.email || '',
                            image: data.user.image || '',
                            password: '',
                            confirmPassword: ''
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchProfile();
        }
    }, [session]);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("L'image ne doit pas dépasser 5MB");
            return;
        }

        setUploading(true);
        const tfData = new FormData();
        tfData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: tfData
            });

            const data = await res.json();
            if (data.success) {
                setFormData({ ...formData, image: data.url });
                toast.success("Image téléchargée ! N'oubliez pas d'enregistrer.");
            } else {
                toast.error(data.error || "Erreur de téléchargement");
            }
        } catch (error) {
            toast.error("Erreur serveur lors du téléchargement");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        if (formData.password && formData.password.length < 6) {
            toast.error("Le mot de passe doit comporter au moins 6 caractères");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                image: formData.image,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                toast.success(data.message || "Profil mis à jour !");
                // Update next-auth session
                await update({
                    name: formData.name,
                    email: formData.email,
                    image: formData.image
                });

                // Refresh data
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                router.refresh();
            } else {
                toast.error(data.error || "Erreur lors de la mise à jour");
            }
        } catch (error) {
            toast.error("Erreur de connexion au serveur");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Menu */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <Link href="/dashboard" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                            <ArrowLeft size={16} className="mr-2" /> Retour au tableau de bord
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900 mt-2">Paramètres du profil</h1>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <form onSubmit={handleSubmit}>

                        {/* Profile Picture Section */}
                        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-center md:justify-start gap-6">
                            <div className="relative">
                                <div className="relative w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md flex-shrink-0 group overflow-hidden">
                                    {formData.image ? (
                                        <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <User size={40} />
                                        </div>
                                    )}

                                    {/* Hover overlay for desktop */}
                                    <label className="absolute inset-0 bg-black/50 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        {uploading ? <Loader2 className="animate-spin text-white" size={20} /> : <Upload size={20} className="text-white" />}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>

                                {/* Floating Action Button for Mobile/Desktop visibility */}
                                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-primary-dark transition-colors border-2 border-white flex items-center justify-center w-9 h-9 z-10">
                                    {uploading ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-lg font-bold text-slate-900">Photo de profil</h3>
                                <p className="text-sm text-slate-500 mb-2">Cliquez sur l'image pour la modifier. Format JPG ou PNG (max. 5MB).</p>
                            </div>
                        </div>

                        {/* General Info */}
                        <div className="p-8 space-y-6">

                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <User size={20} className="text-primary" /> Informations Personnelles
                                </h3>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Nom Complet</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Votre nom"
                                        required
                                    />
                                </div>
                                <div className="mt-4">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Adresse E-mail</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="exemple@email.com"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Ajoutez un e-mail pour pouvoir vous connecter avec (mot de passe requis).</p>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Lock size={20} className="text-primary" /> Sécurité
                                </h3>
                                <p className="text-sm text-slate-500 mb-1">
                                    Vous pouvez définir ou changer votre mot de passe ici si vous souhaitez vous connecter avec votre identifiant et mot de passe classiques (au lieu du SMS).
                                </p>
                                <p className="text-xs text-primary/80 mb-4 font-medium flex items-center gap-1">
                                    👉 Kén t7éb tod5ol b mot de passe mta3ek blech ma testanna message SMS.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Nouveau mot de passe</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="••••••••"
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Confirmer le mot de passe</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={saving || uploading}
                                className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Enregistrer les modifications
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
