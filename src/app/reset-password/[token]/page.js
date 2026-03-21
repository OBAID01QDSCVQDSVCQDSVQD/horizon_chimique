'use client';

import { useState } from 'react';
import { Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ResetPasswordPage({ params }) {
    const { token } = params;
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        if (password.length < 6) {
            toast.error("Le mot de passe doit faire au moins 6 caractères");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                toast.success('Mot de passe mis à jour !');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                toast.error(data.error || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            toast.error('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 w-full max-w-md">

                {success ? (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Succès !</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
                        </p>
                        <Link href="/login" className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all inline-block">
                            Se connecter maintenant
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Lock size={24} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nouveau mot de passe</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                                Choisissez un nouveau mot de passe sécurisé pour votre compte.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nouveau mot de passe</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Réinitialiser le mot de passe'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
