'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, UserPlus, Mail, Lock, User, Briefcase, Hammer } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [role, setRole] = useState('client'); // 'client' or 'artisan'
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        identifier: '',
        specialty: '',
        password: ''
    });

    const handleSendOTP = async () => {
        const phone = formData.identifier || formData.phone;
        if (!phone || !formData.name) {
            toast.error("Veuillez remplir le nom et le numéro de téléphone");
            return;
        }

        if (phone.length < 8) {
            toast.error("Numéro de téléphone invalide (8 chiffres requis)");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone })
            });
            const data = await res.json();

            if (res.ok) {
                setShowOtpInput(true);
                toast.success("Code de vérification envoyé !");
            } else {
                toast.error(data.error || "Erreur d'envoi du code");
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur d'envoi du code. Vérifiez votre connexion.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        if (e) e.preventDefault();
        if (!otp || otp.length < 6) {
            toast.error("Veuillez entrer le code de 6 chiffres");
            return;
        }

        setSubmitting(true);
        try {
            const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value;
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    role,
                    otp, // Pass OTP to register API for verification
                    phone: formData.identifier || formData.phone,
                    turnstileToken
                })
            });
            const data = await res.json();

            if (data.success) {
                if (typeof window !== 'undefined' && window.fbq) {
                    window.fbq('track', 'CompleteRegistration', { currency: 'TND', value: 0.00 });
                }
                toast.success(data.message);
                router.push('/login');
            } else {
                toast.error(data.error || "Erreur d'inscription");
            }
        } catch (error) {
            console.error(error);
            toast.error("Une erreur est survenue lors de l'inscription");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (role === 'client') {
            if (!showOtpInput) {
                await handleSendOTP();
            } else {
                await handleVerifyAndRegister();
            }
            return;
        }

        // Artisan logic (direct register with password)
        setSubmitting(true);
        const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value;

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role, phone: formData.phone, turnstileToken })
            });
            const data = await res.json();

            if (data.success) {
                if (typeof window !== 'undefined' && window.fbq) {
                    window.fbq('track', 'CompleteRegistration', { currency: 'TND', value: 0.00 });
                }
                toast.success(data.message);
                router.push('/login');
            } else {
                toast.error(data.error || "Erreur d'inscription");
            }
        } catch (error) {
            toast.error("Erreur technique");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8 text-slate-800">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-900 p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-2xl font-bold relative z-10">Créer un compte</h1>
                    <p className="text-slate-400 mt-2 relative z-10">Rejoignez la communauté Horizon Chimique</p>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-2 gap-3 mb-8 p-1 bg-slate-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => {
                                setRole('client');
                                setShowOtpInput(false);
                            }}
                            className={`py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${role === 'client' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <User size={16} /> Client
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('artisan')}
                            className={`py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${role === 'artisan' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Hammer size={16} /> Artisan
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!showOtpInput ? (
                            <>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Nom Complet</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        placeholder="Votre nom"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
                                        {role === 'artisan' ? 'Adresse Email' : 'Numéro de Téléphone'}
                                    </label>
                                    <input
                                        type={role === 'artisan' ? "email" : "text"}
                                        value={role === 'artisan' ? formData.email : formData.identifier}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            [role === 'artisan' ? 'email' : 'identifier']: e.target.value.replace(role === 'client' ? /\D/g : '', '')
                                        })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        placeholder={role === 'artisan' ? "exemple@domaine.com" : "96 123 456"}
                                        maxLength={role === 'client' ? 8 : undefined}
                                        required
                                    />
                                    {role === 'client' && (
                                        <p className="text-[10px] text-slate-400 mt-1">Nous vous enverrons un code par SMS (+216).</p>
                                    )}
                                </div>

                                {role === 'artisan' && (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Numéro de Téléphone</label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                placeholder="96 123 456"
                                                maxLength={8}
                                                required
                                            />
                                        </div>
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Spécialité</label>
                                            <select
                                                value={formData.specialty}
                                                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white text-slate-700 font-medium"
                                                required
                                            >
                                                <option value="">Sélectionnez votre métier</option>
                                                <option value="Étanchéité">Étanchéité</option>
                                                <option value="Peinture">Peinture</option>
                                                <option value="Maçonnerie">Maçonnerie</option>
                                                <option value="Revêtement Sol">Revêtement Sol</option>
                                                <option value="Autre">Autre</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Mot de passe</label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1 text-center">Entrez le code SMS</label>
                                <p className="text-xs text-slate-500 text-center mb-4 leading-relaxed">
                                    Un code a été envoyé au +216 {formData.identifier}. 💬
                                </p>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full px-4 py-4 border-2 border-primary/30 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-center text-3xl tracking-[0.5em] font-bold"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOtpInput(false)}
                                    className="text-xs text-primary font-bold mt-4 hover:underline block mx-auto underline"
                                >
                                    Modifier le numéro
                                </button>
                            </div>
                        )}

                        {/* Turnstile Protection */}
                        <div className="flex justify-center py-2">
                            <div 
                                className="cf-turnstile" 
                                data-sitekey="1x00000000000000000000AA"
                                data-theme="light"
                                data-compact="true"
                            ></div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg mt-4 ${role === 'artisan' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-primary text-white hover:bg-primary-dark shadow-blue-200'}`}
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : (
                                role === 'artisan' ? "S'inscrire comme Artisan" : (showOtpInput ? "Vérifier و تعدي" : "S'inscrire via SMS")
                            )}
                        </button>

                        <div className="text-center mt-6 text-sm text-slate-500">
                            Déjà inscris ?{' '}
                            <Link href="/login" className="text-primary font-bold hover:underline">
                                Se connecter
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
