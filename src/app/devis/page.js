'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    User, Phone, Mail, MapPin, Send, Loader2, ArrowLeft, 
    FileText, CheckCircle, Calculator, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LocationPicker from '@/components/LocationPicker';
import { trackFbEvent } from '@/utils/trackFbEvent';

function DevisForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productName = searchParams.get('product') || '';
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        whatsapp: '',
        email: '',
        location: null,
        message: productName ? `Demande de devis pour : ${productName}` : '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);

        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    type: 'devis',
                    projectName: productName || 'Devis Général'
                })
            });

            const data = await res.json();

            if (data.success) {
                // Track Conversion (Browser + CAPI)
                trackFbEvent('Lead', {
                    content_name: 'Demande de Devis',
                    content_category: productName || 'Général',
                    value: 0.00,
                    currency: 'TND'
                }, {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    email: formData.email
                });

                toast.success("Demande envoyée avec succès !");
                router.push('/merci?type=devis');
            } else {
                toast.error(data.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 font-bold text-sm"
                >
                    <ArrowLeft size={16} /> Retour
                </button>

                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
                    
                    {/* Left Side: Info & Branding */}
                    <div className="md:w-1/3 bg-slate-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                                <Calculator size={32} className="text-primary" />
                            </div>
                            <h1 className="text-3xl font-black mb-4 leading-tight">Demandez votre Devis Gratuit</h1>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                Obtenez une estimation précise pour votre projet d'étanchéité ou de construction en quelques minutes.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { icon: <CheckCircle className="text-green-400" size={18} />, text: "Réponse sous 24h" },
                                    { icon: <ShieldCheck className="text-blue-400" size={18} />, text: "Expertise Certifiée" },
                                    { icon: <FileText className="text-orange-400" size={18} />, text: "Détails Techniques" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="shrink-0">{item.icon}</div>
                                        <span className="text-sm font-bold text-slate-200">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-12 text-[10px] text-slate-500 font-bold border-t border-white/5 pt-6 uppercase tracking-widest">
                            ENTREPRISE AGRÉÉE PAR HORIZON CHIMIQUE
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="md:w-2/3 p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <User size={14} className="text-primary" /> Prénom *
                                    </label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                                        placeholder="Ex: Ahmed"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <User size={14} className="text-primary" /> Nom *
                                    </label>
                                    <input 
                                        type="text" required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                                        placeholder="Ex: Ben Ali"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Phone size={14} className="text-primary" /> Téléphone *
                                    </label>
                                    <input 
                                        type="tel" required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                                        placeholder="+216 ..."
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>

                                {/* WhatsApp */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Mail size={14} className="text-primary" /> WhatsApp *
                                    </label>
                                    <input 
                                        type="tel" required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                                        placeholder="+216 ..."
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Mail size={14} className="text-slate-400" /> Email (Facultatif)
                                </label>
                                <input 
                                    type="email"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                                    placeholder="exemple@mail.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>

                            {/* Location Picker */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <MapPin size={14} className="text-primary" /> Localisation du Projet (Facultatif)
                                </label>
                                <LocationPicker 
                                    onLocationSelect={(loc) => setFormData({...formData, location: loc})} 
                                />
                                <p className="text-[10px] text-slate-400 font-medium">Auto-détection activée pour une précision maximale.</p>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <FileText size={14} className="text-slate-400" /> Détails du projet
                                </label>
                                <textarea 
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm resize-none"
                                    placeholder="Ex: Étanchéité terrasse 100m²..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                {loading ? "Traitement..." : "VALIDER MA DEMANDE DE DEVIS"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DevisPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
            <DevisForm />
        </Suspense>
    );
}
