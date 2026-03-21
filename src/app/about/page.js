'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Lightbulb, Target, Award } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
    const [content, setContent] = useState({
        heroTitle: "L'Expertise en Chimie du Bâtiment",
        heroDescription: "Depuis plus de 10 ans, Horizon Chimique accompagne les professionnels et particuliers avec des solutions d'étanchéité et de protection innovantes et durables.",
        missionTitle: "Notre Mission",
        missionText: "Chez Horizon Chimique, notre mission est simple : protéger durablement vos constructions. Nous sélectionnons rigoureusement les meilleurs produits chimiques pour le bâtiment, répondant aux normes les plus strictes de qualité et d'environnement.\n\nNous ne sommes pas seulement des vendeurs de produits, nous sommes des partenaires techniques. Notre équipe d'ingénieurs et d'experts vous accompagne de l'étude à la réalisation de vos chantiers.",
        missionImage: "",
        stats: {
            experience: "+10",
            projects: "+5000",
            experts: "25"
        }
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();
                if (data.success && data.data?.about) {
                    setContent(prev => ({
                        ...prev,
                        ...data.data.about,
                        stats: { ...prev.stats, ...data.data.about.stats }
                    }));
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchContent();
    }, []);

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <div className="relative bg-slate-900 overflow-hidden py-24 sm:py-32">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-0" />
                {/* Abstract Shapes */}
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl opacity-50" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-primary font-bold tracking-wide uppercase mb-4">À propos de nous</h2>
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
                            {content.heroTitle}
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
                            {content.heroDescription}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="py-24 sm:py-32 overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">{content.missionTitle}</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed whitespace-pre-wrap">
                                {content.missionText}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg text-primary"><Target size={24} /></div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Innovation</h3>
                                        <p className="text-sm text-slate-500">Toujours à la pointe de la technologie.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg text-primary"><Award size={24} /></div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Qualité Certifiée</h3>
                                        <p className="text-sm text-slate-500">Produits testés et approuvés.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative rounded-2xl bg-slate-100 aspect-[4/3] overflow-hidden shadow-xl"
                        >
                            <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400">
                                <Image
                                    src={content.missionImage || "/hero_bg.jpg"}
                                    alt="Horizon Chimique Team"
                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                                    width={800}
                                    height={600}
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-primary/5 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mx-auto flex max-w-xs flex-col gap-y-4"
                        >
                            <dt className="text-base leading-7 text-slate-600">Années d'expérience</dt>
                            <dd className="order-first text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{content.stats?.experience}</dd>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="mx-auto flex max-w-xs flex-col gap-y-4"
                        >
                            <dt className="text-base leading-7 text-slate-600">Projets accompagnés</dt>
                            <dd className="order-first text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{content.stats?.projects}</dd>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="mx-auto flex max-w-xs flex-col gap-y-4"
                        >
                            <dt className="text-base leading-7 text-slate-600">Experts Techniques</dt>
                            <dd className="order-first text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{content.stats?.experts}</dd>
                        </motion.div>
                    </dl>
                </div>
            </div>

            {/* Values */}
            <div className="py-24 sm:py-32 mx-auto max-w-7xl px-6 lg:px-8 text-center">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Pourquoi nous choisir ?</h2>
                    <p className="mt-4 text-lg text-slate-600">
                        Nous nous engageons à fournir l'excellence technique et un service client irréprochable.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-primary/20 transition-all">
                        <div className="w-14 h-14 bg-blue-50 text-primary rounded-xl flex items-center justify-center mx-auto mb-6">
                            <Shield size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Protection Durable</h3>
                        <p className="text-slate-500">Des solutions conçues pour résister aux conditions les plus extrêmes et durer dans le temps.</p>
                    </div>
                    <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-primary/20 transition-all">
                        <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <Lightbulb size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Expertise Technique</h3>
                        <p className="text-slate-500">Un bureau d'étude intégré pour diagnostiquer vos besoins et préconiser la solution optimale.</p>
                    </div>
                    <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-primary/20 transition-all">
                        <div className="w-14 h-14 bg-green-50 text-green-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Proximité Client</h3>
                        <p className="text-slate-500">Une équipe disponible et réactive, présente sur tout le territoire pour vous assister.</p>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-slate-900 py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Prêt à démarrer votre projet ?</h2>
                        <p className="mt-4 text-lg text-slate-400">Contactez nos experts pour une étude personnalisée.</p>
                    </div>
                    <Link href="/contact" className="rounded-md bg-primary px-8 py-3.5 text-base font-bold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all">
                        Nous Contacter
                    </Link>
                </div>
            </div>
        </div>
    );
}
