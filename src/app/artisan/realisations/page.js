'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Plus, Image as ImageIcon, Trash2, Edit, Eye, ArrowLeft, Tag } from 'lucide-react';

export default function MyRealizationsPage() {
    const [realizations, setRealizations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/realizations?mine=true')
            .then(res => res.json())
            .then(data => {
                if (data.success) setRealizations(data.realizations);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) return;

        try {
            const res = await fetch(`/api/realizations/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setRealizations(prev => prev.filter(p => p._id !== id));
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-8 pb-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link href="/artisan/dashboard" className="flex items-center text-slate-500 hover:text-slate-800 mb-2 transition-colors">
                            <ArrowLeft size={16} className="mr-1" /> Retour Tableau de bord
                        </Link>
                        <h1 className="text-2xl font-black text-slate-900">Mes Réalisations</h1>
                        <p className="text-slate-500">Gérez votre portfolio et montrez votre expertise.</p>
                    </div>
                    <Link href="/artisan/realisations/new" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2">
                        <Plus size={20} /> Nouveau Projet
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
                ) : realizations.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <ImageIcon size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Aucune réalisation</h3>
                        <p className="text-slate-500 mb-6">Ajoutez vos meilleurs projets pour attirer plus de clients.</p>
                        <Link href="/artisan/realisations/new" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
                            <Plus size={16} /> Ajouter mon premier projet
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {realizations.map((project) => (
                            <div key={project._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                                <Link href={`/artisan/realisations/${project._id}`} className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer block">
                                    {project.images?.[0] ? (
                                        <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                    {/* Tags Chips Overlay */}
                                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                        {project.tags?.slice(0, 2).map(tag => (
                                            <span key={tag} className="bg-white/95 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 shadow-sm border border-slate-100">
                                                {tag}
                                            </span>
                                        ))}
                                        {project.tags?.length > 2 && (
                                            <span className="bg-white/95 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 shadow-sm border border-slate-100">
                                                +{project.tags.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </Link>

                                <div className="p-4 flex flex-col flex-1">
                                    <Link href={`/artisan/realisations/${project._id}`} className="block">
                                        <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1 hover:text-primary transition-colors">{project.title}</h3>
                                    </Link>
                                    <p className="text-slate-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">{project.description}</p>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                                        <div className="text-xs font-medium text-slate-400">
                                            {new Date(project.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/artisan/realisations/${project._id}`} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Voir">
                                                <Eye size={18} />
                                            </Link>
                                            <Link href={`/artisan/realisations/${project._id}/edit`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(project._id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
