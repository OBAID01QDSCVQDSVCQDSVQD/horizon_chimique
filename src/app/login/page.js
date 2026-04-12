'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LogIn, Phone, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [loginMethod, setLoginMethod] = useState('none'); // 'none', 'sms', 'classic'
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSendOTP = async () => {
        if (!identifier) {
            toast.error("Veuillez entrer votre numéro de téléphone");
            return;
        }

        setSubmitting(true);
        try {
            console.log("Tentative d'envoi OTP vers (WinSMS):", identifier);
            
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: identifier })
            });

            const data = await res.json();

            if (res.ok) {
                setShowOtpInput(true);
                toast.success("Code envoyé via SMS !");
            } else {
                const msg = [data.error, data.hint].filter(Boolean).join(' — ');
                toast.error(msg || "Erreur d'envoi du code");
            }
        } catch (error) {
            console.error("OTP Error:", error);
            toast.error("Erreur d'envoi du code (Vérifiez votre connexion)");
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        if (e) e.preventDefault();
        if (!otp || otp.length < 6) {
            toast.error("Veuillez entrer le code de 6 chiffres");
            return;
        }

        setSubmitting(true);
        try {
            const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value;
            const res = await signIn('credentials', {
                phone: identifier,
                otp: otp,
                turnstileToken,
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
            toast.error("Une erreur est survenue lors de la vérification");
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
                await handleVerifyOTP();
            }
            return;
        }

        setSubmitting(true);
        const turnstileToken = document.querySelector('[name="cf-turnstile-response"]')?.value;
        try {
            const res = await signIn('credentials', {
                identifier: formData.identifier,
                password: formData.password,
                turnstileToken,
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
                                            <label className="text-sm font-bold text-slate-700 block mb-2">Numéro de Téléphone (Tunisie)</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                                    +216
                                                </div>
                                                <input
                                                    type="text"
                                                    value={identifier}
                                                    onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ''))}
                                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                    placeholder="96 123 456"
                                                    maxLength={8}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-1 text-center">Code de vérification</label>
                                            <p className="text-xs text-slate-500 text-center mb-4 leading-relaxed">
                                                Un code a été envoyé au +216 {identifier}. 💬
                                            </p>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                className="w-full px-4 py-4 border-2 border-primary/30 rounded-xl text-center text-3xl font-bold tracking-[0.5em] outline-none focus:border-primary"
                                                placeholder="000000"
                                                maxLength={6}
                                                required
                                            />
                                            <button type="button" onClick={() => setShowOtpInput(false)} className="text-xs text-primary font-bold mt-4 block mx-auto underline">Modifier le numéro</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Turnstile Protection */}
                            <div className="flex justify-center py-2">
                                <div 
                                    className="cf-turnstile" 
                                    data-sitekey="0x4AAAAAAAC8kETAdfvcxeGcA"
                                    data-theme="light"
                                    data-compact="true"
                                ></div>
                            </div>

                            <button
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
