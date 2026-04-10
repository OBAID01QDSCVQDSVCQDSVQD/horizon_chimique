'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { trackFbEvent } from '@/utils/trackFbEvent';

const TYPES = {
    contact: {
        title: 'Message Envoyé !',
        subtitle: 'Merci de nous avoir contactés.',
        description: 'Notre équipe commerciale examinera votre message et vous recontactera dans les plus brefs délais.',
        pixels: ['Contact', 'Schedule'],
        cta: { label: 'Retour à l\'accueil', href: '/' },
        color: 'from-blue-600 to-blue-800',
    },
    devis: {
        title: 'Devis Généré !',
        subtitle: 'Votre estimation est prête.',
        description: 'Notre équipe vous contactera pour finaliser votre projet et vous proposer la meilleure solution.',
        pixels: [],
        cta: { label: 'Voir nos products', href: '/products' },
        color: 'from-slate-800 to-slate-900',
    },
    register: {
        title: 'Compte Créé !',
        subtitle: 'Bienvenue dans la communauté Horizon Chimique.',
        description: 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter et accéder à toutes nos offres.',
        pixels: ['CompleteRegistration'],
        cta: { label: 'Se connecter', href: '/login' },
        color: 'from-green-600 to-green-800',
    },
};

function ThankYouContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const type = searchParams.get('type') || 'contact';
    const config = TYPES[type] || TYPES.contact;

    useEffect(() => {
        // Fire the specific pixel events via Browser + CAPI
        if (config.pixels) {
            config.pixels.forEach(p => trackFbEvent(p));
        }

        // Auto-redirect after 10 seconds
        const timer = setTimeout(() => {
            router.push(config.cta.href);
        }, 10000);

        return () => clearTimeout(timer);
    }, [config]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Header gradient */}
                    <div className={`bg-gradient-to-br ${config.color} p-10 flex flex-col items-center text-white relative overflow-hidden`}>
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,white,transparent)]" />
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-5 border-4 border-white/30"
                        >
                            <CheckCircle2 size={48} className="text-white" />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-black text-center mb-1"
                        >
                            {config.title}
                        </motion.h1>
                        <p className="text-white/80 font-medium text-center">{config.subtitle}</p>
                    </div>

                    {/* Body */}
                    <div className="p-8 text-center">
                        <p className="text-slate-600 leading-relaxed mb-8">
                            {config.description}
                        </p>

                        {/* Contact info */}
                        <div className="bg-slate-50 rounded-2xl p-4 mb-8 flex items-center justify-center gap-3 border border-slate-100">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Phone size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Besoin urgent ?</p>
                                <a href="tel:+21631520033" className="text-slate-800 font-bold hover:text-primary transition-colors">
                                    +216 31 520 033
                                </a>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href={config.cta.href}
                                className="flex-1 bg-primary text-white font-bold py-3.5 px-6 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                {config.cta.label} <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/"
                                className="flex-1 border border-slate-200 text-slate-600 font-bold py-3.5 px-6 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Home size={18} /> Accueil
                            </Link>
                        </div>

                        {/* Auto redirect note */}
                        <p className="text-xs text-slate-400 mt-5">
                            Vous serez redirigé automatiquement dans 10 secondes.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function MerciPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary" /></div>}>
            <ThankYouContent />
        </Suspense>
    );
}
