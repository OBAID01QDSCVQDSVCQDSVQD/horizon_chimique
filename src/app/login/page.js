'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LogIn, Phone, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export default function LoginPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [loginMethod, setLoginMethod] = useState('none'); // 'none', 'sms', 'classic'
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);


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
                        console.log("ReCaptcha Solved");
                    },
                    'expired-callback': () => {
                        if (window.recaptchaVerifier) {
                            window.recaptchaVerifier.clear();
                            window.recaptchaVerifier = null;
                        }
                    }
                });
                await window.recaptchaVerifier.render();
            } catch (e) {
                console.error("Recaptcha Init Error", e);
            }
        };

        if (loginMethod === 'sms' && !showOtpInput) {
            initRecaptcha();
        }

        return () => {
            isMounted = false;
            // Cleanup if needed when recaptcha element unmounts
            if (loginMethod !== 'sms' && window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) { }
                window.recaptchaVerifier = null;
            }
        };
    }, [loginMethod, showOtpInput]);

    const handleSendOTP = async () => {
        if (!identifier) {
            toast.error("Veuillez entrer votre numéro de téléphone");
            return;
        }

        // Vérifier si ReCaptcha a été affiché et si window.recaptchaVerifier existe
        if (!window.recaptchaVerifier) {
            toast.error("Veuillez patienter pendant le chargement de la vérification");
            return;
        }

        setSubmitting(true);
        try {
            console.log("Tentative d'envoi OTP vers:", identifier);

            let phone = identifier.trim();
            if (!phone.startsWith('+')) phone = '+216' + phone;

            console.log("Numéro formaté:", phone);
            const appVerifier = window.recaptchaVerifier;

            // Forcer le rendu si ce n'est pas déjà fait
            if (typeof appVerifier.render === 'function') {
                await appVerifier.render();
            }

            const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
            console.log("OTP envoyé avec succès!");
            setConfirmationResult(confirmation);
            setShowOtpInput(true);
            toast.success("Code envoyé !");
        } catch (error) {
            console.error("Firebase Auth Error Full:", error);
            console.log("Error code:", error.code);
            console.log("Error message:", error.message);

            if (error.code === 'auth/invalid-phone-number') {
                toast.error("Numéro de téléphone invalide");
            } else if (error.code === 'auth/too-many-requests') {
                toast.error("Trop de tentatives. Veuillez réessayer plus tard.");
            } else {
                toast.error("Erreur d'envoi du code (Vérifiez votre connexion)");
            }

            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                    // Forcer un re-render de l'effect pour recréer le captcha
                    setShowOtpInput(false);
                } catch (e) { }
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifyOTP = async (e) => {
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

            const res = await signIn('credentials', {
                firebaseToken: idToken,
                redirect: false
            });

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Connexion réussie !");
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error) {
            toast.error("Code incorrect");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loginMethod === 'sms') {
            if (!showOtpInput) {
                await handleSendOTP();
            } else {
                await handleVerifyOTP(e);
            }
            return;
        }

        setSubmitting(true);
        try {
            const res = await signIn('credentials', {
                identifier: formData.identifier,
                password: formData.password,
                redirect: false,
            });

            if (res.error) {
                toast.error(res.error);
                setSubmitting(false);
            } else {
                toast.success("Connexion réussie !");
                router.refresh();
                router.push('/dashboard');
            }
        } catch (error) {
            toast.error("Erreur de connexion");
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-primary p-8 text-center relative">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Connexion</h1>
                    <p className="text-blue-100 mt-2">Accédez à votre espace Horizon Chimique</p>
                </div>

                <div className="p-8">
                    {loginMethod === 'none' ? (
                        <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                            <h2 className="text-center text-slate-500 font-medium mb-6">Choisissez votre méthode de connexion</h2>

                            <div className="w-full space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setLoginMethod('sms')}
                                    className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-3 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    <Phone size={20} />
                                    Se connecter par SMS
                                </button>

                                <div className="relative py-1 flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                                    <span className="relative bg-white px-3 text-xs text-slate-400 font-semibold uppercase tracking-widest">Ou</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setLoginMethod('classic')}
                                    className="w-full bg-slate-800 text-white font-bold py-3.5 rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3 shadow-md shadow-slate-800/20 hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    <Lock size={20} />
                                    Connexion classique
                                </button>
                            </div>

                            <div className="text-center mt-7 text-sm text-slate-500">
                                Pas encore de compte ?{' '}
                                <Link href="/register" className="text-primary font-bold hover:underline transition-colors">
                                    Créer un compte
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">

                            {/* Bouton Retour en haut du formulaire */}
                            <button
                                type="button"
                                onClick={() => {
                                    setLoginMethod('none');
                                    setShowOtpInput(false);
                                    setOtp('');
                                    setIdentifier('');
                                }}
                                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mb-4"
                            >
                                <ArrowLeft size={16} /> Retour aux options
                            </button>

                            {loginMethod === 'classic' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 block mb-2">Email ou Téléphone</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.identifier}
                                                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="exemple@email.com ou 22123456"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-bold text-slate-700">Mot de passe</label>
                                            <Link href="/forgot-password" className="text-xs font-bold text-primary hover:text-blue-700 hover:underline">
                                                Mot de passe oublié ?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                placeholder="••••••••"
                                                required
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
                            )}

                            {loginMethod === 'sms' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    {!showOtpInput ? (
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-2">Numéro de Téléphone</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <Phone size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={identifier}
                                                    onChange={(e) => setIdentifier(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                    placeholder="22 123 456"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-1 text-center">Code de vérification</label>
                                            <p className="text-xs text-slate-500 text-center mb-4 leading-relaxed">
                                                Bech yjik SMS fih code ba3d chwaya, 7ottou lna 3aychek. 💬
                                            </p>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                className="w-full px-4 py-4 border-2 border-primary/30 rounded-xl text-center text-2xl font-bold tracking-widest outline-none focus:border-primary"
                                                placeholder="000000"
                                                maxLength={6}
                                                required
                                            />
                                            <button type="button" onClick={() => setShowOtpInput(false)} className="text-xs text-primary font-bold mt-2 block mx-auto underline">Modifier le numéro</button>
                                        </div>
                                    )}
                                    <div id="recaptcha-container" className={`mt-4 flex justify-center ${showOtpInput ? 'hidden' : ''}`}></div>
                                </div>
                            )}

                            <button
                                id={loginMethod === 'sms' && !showOtpInput ? "send-otp-button" : "submit-button"}
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 mt-6"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : (
                                    loginMethod === 'sms' && showOtpInput ? 'Vérifier' : 'Se connecter'
                                )}
                            </button>

                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
