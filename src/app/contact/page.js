'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle2, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Company Settings from DB
    const [settings, setSettings] = useState(null);
    const [loadingSettings, setLoadingSettings] = useState(true);

    useEffect(() => {
        // Fetch company settings
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setSettings(data.data);
                }
            })
            .catch(console.error)
            .finally(() => setLoadingSettings(false));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            toast.error("Le nom et le téléphone sont obligatoires.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();

            if (res.ok) {
                if (typeof window !== 'undefined' && window.fbq) {
                    window.fbq('track', 'Contact');
                }
                setSubmitted(true);
                toast.success("Message envoyé avec succès !");
                setFormData({ name: '', phone: '', email: '', address: '', subject: '', message: '' });
            } else {
                toast.error(result.error || "Une erreur est survenue.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <span className="text-primary font-bold uppercase tracking-wider text-sm">Contact</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-2 mb-4">Contactez-nous</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                        Une question ? Un projet ? Notre équipe est à votre écoute pour vous accompagner.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info Widget - Now Dynamic */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-primary rounded-3xl p-8 md:p-12 text-white shadow-xl flex flex-col justify-between overflow-hidden relative"
                    >
                        {/* Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <div>
                            <h3 className="text-2xl font-bold mb-6">Nos Coordonnées</h3>
                            <p className="text-blue-100 mb-8 leading-relaxed">
                                Remplissez le formulaire et notre équipe vous recontactera dans les plus brefs délais.
                            </p>

                            {loadingSettings ? (
                                <div className="space-y-6 animate-pulse">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-start gap-4">
                                            <div className="p-3 bg-white/20 rounded-xl w-12 h-12"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 bg-white/20 rounded w-20"></div>
                                                <div className="h-5 bg-white/20 rounded w-40"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <span className="block text-sm text-blue-200 font-bold uppercase tracking-wide mb-1">Téléphone</span>
                                            <a href={`tel:${settings?.phone}`} className="text-lg font-bold hover:text-blue-200 transition">
                                                {settings?.phone || '+216 XX XXX XXX'}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <span className="block text-sm text-blue-200 font-bold uppercase tracking-wide mb-1">Email</span>
                                            <a href={`mailto:${settings?.email}`} className="text-sm sm:text-base md:text-lg font-bold hover:text-blue-200 transition whitespace-nowrap">
                                                {settings?.email || 'contact@example.com'}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <span className="block text-sm text-blue-200 font-bold uppercase tracking-wide mb-1">Adresse</span>
                                            <p className="text-lg font-medium">{settings?.address || 'Adresse non définie'}</p>
                                        </div>
                                    </div>

                                    {settings?.website && (
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
                                                <Globe size={24} />
                                            </div>
                                            <div>
                                                <span className="block text-sm text-blue-200 font-bold uppercase tracking-wide mb-1">Site Web</span>
                                                <a href={`https://${settings.website}`} target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base md:text-lg font-bold hover:text-blue-200 transition whitespace-nowrap">
                                                    {settings.website}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-12 flex gap-4">
                            {/* Social icons could go here */}
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100"
                    >
                        {submitted ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Envoyé !</h3>
                                <p className="text-slate-600 mb-8 max-w-md">Merci de nous avoir contactés. Notre équipe commerciale va traiter votre demande rapidement.</p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-dark transition-colors shadow-lg"
                                >
                                    Envoyer un autre message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">Envoyez-nous un message</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Nom Complet <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Votre nom"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Téléphone <span className="text-red-500">*</span></label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Votre numéro"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="exemple@email.com (Optionnel)"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Adresse</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Ville, Adresse... (Optionnel)"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Sujet</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Objet de votre message (Optionnel)"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                                    <textarea
                                        name="message"
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Écrivez votre message ici... (Optionnel)"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary-dark transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                                        {loading ? 'Envoi en cours...' : 'Envoyer le Message'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
