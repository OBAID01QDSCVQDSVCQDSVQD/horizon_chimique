'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function AdminAboutSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [settings, setSettings] = useState({
        about: {
            heroTitle: '',
            heroDescription: '',
            missionTitle: '',
            missionText: '',
            missionImage: '',
            stats: {
                experience: '',
                projects: '',
                experts: ''
            }
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.success && data.data) {
                // Ensure structure exists with DEFAULTS if DB is empty
                const fetchedAbout = data.data.about || {};
                const mergedAbout = {
                    heroTitle: fetchedAbout.heroTitle || "L'Expertise en Chimie du Bâtiment",
                    heroDescription: fetchedAbout.heroDescription || "Depuis plus de 10 ans, Horizon Chimique accompagne les professionnels et particuliers avec des solutions d'étanchéité et de protection innovantes et durables.",
                    missionTitle: fetchedAbout.missionTitle || "Notre Mission",
                    missionText: fetchedAbout.missionText || "Chez Horizon Chimique, notre mission est simple : protéger durablement vos constructions. Nous sélectionnons rigoureusement les meilleurs produits chimiques pour le bâtiment.\n\nNous ne sommes pas seulement des vendeurs de produits, nous sommes des partenaires techniques. Notre équipe d'ingénieurs et d'experts vous accompagne de l'étude à la réalisation de vos chantiers.",
                    missionImage: fetchedAbout.missionImage || "",
                    stats: {
                        experience: fetchedAbout.stats?.experience || "+10",
                        projects: fetchedAbout.stats?.projects || "+5000",
                        experts: fetchedAbout.stats?.experts || "25"
                    }
                };

                setSettings({
                    ...data.data,
                    about: mergedAbout
                });
            }
        } catch (error) {
            toast.error("Erreur chargement");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            about: {
                ...prev.about,
                [section]: section === 'stats' ? { ...prev.about.stats, [field]: value } : undefined, // Check logic
                [field]: section === 'root' ? value : prev.about[field]
            }
        }));
    };

    // Simplified Handler
    const updateField = (path, value) => {
        const parts = path.split('.');
        setSettings(prev => {
            const newState = { ...prev };
            // Ensure path exists
            if (!newState.about) newState.about = {};

            let current = newState.about;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
            return newState;
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                updateField('missionImage', data.url);
                toast.success("Image téléchargée");
            } else {
                toast.error("Erreur upload");
            }
        } catch (error) {
            toast.error("Erreur serveur");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Optimistic update for UI, but technically we send whole settings object
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Paramètres sauvegardés !");
            } else {
                toast.error("Erreur sauvegarde");
            }
        } catch (error) {
            toast.error("Erreur connexion");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Modifier la page "À Propos"</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Enregistrer
                </button>
            </div>

            <div className="space-y-8">
                {/* Hero Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200 border-b pb-2">En-tête (Hero)</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Titre principal</label>
                            <input
                                type="text"
                                value={settings.about?.heroTitle || ''}
                                onChange={(e) => updateField('heroTitle', e.target.value)}
                                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description courte</label>
                            <textarea
                                value={settings.about?.heroDescription || ''}
                                onChange={(e) => updateField('heroDescription', e.target.value)}
                                rows={3}
                                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                    </div>
                </div>

                {/* Mission Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200 border-b pb-2">Mission & Histoire</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Titre de section</label>
                            <input
                                type="text"
                                value={settings.about?.missionTitle || ''}
                                onChange={(e) => updateField('missionTitle', e.target.value)}
                                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Texte détaillé</label>
                            <textarea
                                value={settings.about?.missionText || ''}
                                onChange={(e) => updateField('missionText', e.target.value)}
                                rows={6}
                                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Image de mission</label>
                            <div className="flex items-center gap-4">
                                {settings.about?.missionImage && (
                                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                                        <Image src={settings.about.missionImage} alt="Mission" fill className="object-cover" />
                                    </div>
                                )}
                                <label className="cursor-pointer bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                                    {uploading ? <Loader2 className="animate-spin" size={16} /> : <ImageIcon size={16} />}
                                    {settings.about?.missionImage ? 'Changer l\'image' : 'Ajouter une image'}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200 border-b pb-2">Chiffres Clés</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Années d'expérience</label>
                            <input
                                type="text"
                                value={settings.about?.stats?.experience || ''}
                                onChange={(e) => updateField('stats.experience', e.target.value)}
                                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                placeholder="+10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Projets (Nombre)</label>
                            <input
                                type="text"
                                value={settings.about?.stats?.projects || ''}
                                onChange={(e) => updateField('stats.projects', e.target.value)}
                                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                placeholder="+5000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Experts</label>
                            <input
                                type="text"
                                value={settings.about?.stats?.experts || ''}
                                onChange={(e) => updateField('stats.experts', e.target.value)}
                                className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                                placeholder="25"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
