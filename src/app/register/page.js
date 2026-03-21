'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, UserPlus, Mail, Lock, User, Briefcase, Hammer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export default function RegisterPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [role, setRole] = useState('client'); // 'client' or 'artisan'
    const [verificationId, setVerificationId] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        identifier: '',
        specialty: '',
        password: ''
    });

    useEffect(() => {
        let isMounted = true;

        const initRecaptcha = async () => {
            const recaptchaDiv = document.getElementById('recaptcha-container');
            if (!recaptchaDiv || window.recaptchaVerifier) return;

            try {
                if (!isMounted) return;

                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'normal',
                    'callback': () => {
                        console.log("Register ReCaptcha Solved");
                    }
                });
                await window.recaptchaVerifier.render();
            } catch (e) {
                console.error("Register Recaptcha Init Error", e);
            }
        };

        if (role === 'client' && !showOtpInput) {
            initRecaptcha();
        }

        return () => {
            isMounted = false;
        };
    }, [role, showOtpInput]);

    const handleSendOTP = async () => {
        if (!formData.identifier || !formData.name) {
            toast.error("Veuillez remplir le nom et le numéro de téléphone");
            return;
        }

        if (formData.identifier.length < 8) {
            toast.error("Numéro de téléphone invalide");
            return;
        }

        if (!window.recaptchaVerifier) {
            toast.error("Vérification en cours de chargement...");
            return;
        }

        setSubmitting(true);
        try {
            let phone = formData.phone || formData.identifier;
            phone = phone.trim();
            if (!phone.startsWith('+')) phone = '+216' + phone;

            const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
            setConfirmationResult(confirmation);
            setShowOtpInput(true);
            toast.success("Code de vérification envoyé !");
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/invalid-app-credential') {
                toast.error("Erreur de configuration (Identity Toolkit API non activée)");
            } else {
                toast.error("Erreur d'envoi du code. Vérifiez votre connexion.");
            }

            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                    // Trigger re-render to recreate captcha if needed
                    setRole(role);
                } catch (e) { }
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            toast.error("Veuillez entrer le code de 6 chiffres");
            return;
        }

        setSubmitting(true);
        try {
            if (!confirmationResult) {
                toast.error("Session expirée. Veuillez renvoyer le code.");
                setShowOtpInput(false);
                return;
            }

            const result = await confirmationResult.confirm(otp);
            const idToken = await result.user.getIdToken();

            // Now register in our DB with this token
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    role,
                    firebaseToken: idToken
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
            toast.error("Code incorrect ou expiré");
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
                await handleVerifyAndRegister(e);
            }
            return;
        }

        // Original Artisan logic
        setSubmitting(true);
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role })
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8">
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
                    {/* Role Selection */}
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
                                            [role === 'artisan' ? 'email' : 'identifier']: e.target.value
                                        })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        placeholder={role === 'artisan' ? "exemple@domaine.com" : "22 123 456"}
                                        required
                                    />
                                    {role === 'client' && (
                                        <p className="text-[10px] text-slate-400 mt-1">Nous vous enverrons un code par SMS pour vérifier votre numéro.</p>
                                    )}
                                </div>

                                {role === 'artisan' && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Numéro de Téléphone</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            placeholder="22 123 456"
                                            required
                                        />
                                    </div>
                                )}

                                {role === 'client' && (
                                    <div className={`mt-4 flex justify-center ${showOtpInput ? 'hidden' : ''}`}>
                                        <div id="recaptcha-container"></div>
                                    </div>
                                )}

                                {role === 'artisan' && (
                                    <>
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Spécialité</label>
                                            <select
                                                value={formData.specialty}
                                                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
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
                                    Bech yjik SMS fih code ba3d chwaya, 7ottou lna 3aychek. 💬
                                </p>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full px-4 py-4 border-2 border-primary/30 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-center text-2xl tracking-[0.5em] font-bold"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOtpInput(false)}
                                    className="text-xs text-primary font-bold mt-4 hover:underline block mx-auto"
                                >
                                    Modifier le numéro
                                </button>
                            </div>
                        )}

                        <button
                            id="register-btn-sms"
                            type="submit"
                            disabled={submitting}
                            className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg mt-4 ${role === 'artisan' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-primary text-white hover:bg-primary-dark shadow-blue-200'}`}
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : (
                                role === 'artisan' ? "S'inscrire comme Artisan" : (showOtpInput ? "Vérifier et Continuer" : "S'inscrire via SMS")
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
