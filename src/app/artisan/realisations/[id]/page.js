'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Calendar, MapPin, Tag, Edit, X, UserCircle, Maximize2 } from 'lucide-react';
import ProjectGalleryFB from '@/components/ProjectGalleryFB';

export default function RealizationDetailPage() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/realizations/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProject(data.realization);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="flex justify-center items-center min-h-screen bg-slate-50"><Loader2 className="animate-spin text-primary" size={40} /></div>;
    if (!project) return <div className="text-center py-20 font-bold text-slate-500">Projet introuvable</div>;

    return (
        <div className="min-h-screen bg-white">
            {/* Header / Actions */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/artisan/realisations" className="flex items-center text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors">
                        <ArrowLeft size={18} className="mr-2" /> Retour
                    </Link>
                    <Link href={`/artisan/realisations/${id}/edit`} className="flex items-center bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-full shadow-lg transition-all active:scale-95 font-bold text-sm">
                        <Edit size={16} className="mr-2" /> Modifier
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">

                {/* Project Header Info */}
                <div className="mb-10 text-center max-w-3xl mx-auto">
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                        {project.tags?.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-wide border border-blue-100">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">{project.title}</h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-500">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-slate-400" />
                            {new Date(project.createdAt).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        {project.location && (
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-slate-400" />
                                <span className="uppercase tracking-wide">{project.location}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            {project.artisan?.image ? (
                                <img src={project.artisan.image} alt="Artisan" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                                <UserCircle size={20} className="text-slate-400" />
                            )}
                            <span className="text-slate-700">{project.artisan?.companyName || project.artisan?.name}</span>
                        </div>
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="mb-16">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-slate-900 border-l-4 border-primary pl-4">Galerie Photos</h3>
                    </div>
                    <ProjectGalleryFB images={project.images} video={project.video} />
                </div>

                {/* Description Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                    <div className="lg:col-span-2">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-primary pl-4">À propos du projet</h3>
                        <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                            {project.description}
                        </div>
                    </div>

                    {/* Sidebar / Context */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 sticky top-24">
                            <h4 className="font-bold text-slate-900 mb-4">Détails techniques</h4>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Catégories</span>
                                    <div className="flex flex-wrap gap-1">
                                        {project.tags?.map(t => <span key={t} className="px-2 py-1 bg-white border rounded text-slate-700">{t}</span>)}
                                    </div>
                                </div>
                                {project.completionDate && (
                                    <div>
                                        <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Date de fin</span>
                                        <span className="text-slate-800 font-medium">{new Date(project.completionDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
