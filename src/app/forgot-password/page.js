'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (data.success) {
                setSubmitted(true);
                toast.success('Email envoyé ! Verifiez votre boîte de réception.');
            } else {
                toast.error(data.error || 'Erreur lors de l\'envoi');
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
                <Link href="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-primary mb-6 transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Retour à la connexion
                </Link>

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Mail size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mot de passe oublié ?</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                        Entrez votre email et nous vous enverrons les instructions pour réinitialiser votre mot de passe.
                    </p>
                </div>

                {submitted ? (
                    <div className="text-center bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-900/50">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <h3 className="font-bold text-green-700 dark:text-green-300 mb-2">Email envoyé !</h3>
                        <p className="text-sm text-green-600 dark:text-green-400">
                            Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques instants.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                placeholder="nom@exemple.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Envoyer le lien'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
