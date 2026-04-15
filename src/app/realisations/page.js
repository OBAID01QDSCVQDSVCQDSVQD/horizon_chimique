'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Loader2, ArrowRight, Tag, MapPin, Calendar, CheckCircle, Search, Filter, Megaphone, User, Heart, MessageCircle, Star } from 'lucide-react';

export default function RealizationsPage() {
    const [loading, setLoading] = useState(true);
    const [campaigns, setCampaigns] = useState([]);
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [allTags, setAllTags] = useState(['Tous']);
    const [activeTag, setActiveTag] = useState('Tous');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [campRes, projRes] = await Promise.all([
                    fetch('/api/campaigns'),
                    fetch('/api/realizations')
                ]);

                const campData = await campRes.json();
                const projData = await projRes.json();

                if (campData.success) {
                    setCampaigns(campData.campaigns.filter(c => c.isActive));
                }

                if (projData.success) {
                    setProjects(projData.realizations);
                    setFilteredProjects(projData.realizations);

                    // Extract unique tags and sort them
                    const tags = new Set(['Tous']);
                    projData.realizations.forEach(p => {
                        p.tags?.forEach(t => tags.add(t));
                    });
                    setAllTags(Array.from(tags));
                }
            } catch (err) {
                console.error("Error fetching data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let res = projects;

        // Filter by Tag
        if (activeTag !== 'Tous') {
            res = res.filter(p => p.tags?.includes(activeTag));
        }

        // Filter by Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            res = res.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.location?.toLowerCase().includes(q)
            );
        }

        setFilteredProjects(res);
    }, [activeTag, searchQuery, projects]);

    // Smart Content Injection Logic
    const getMixedContent = () => {
        if (campaigns.length === 0) return filteredProjects.map(p => ({ type: 'project', data: p }));

        const mixed = [];
        let campIndex = 0;

        // Logic: P, Ad, P, P, P, Ad, P, P, P...
        // 1 Project, then Ad, then every 3 Projects

        filteredProjects.forEach((project, index) => {
            mixed.push({ type: 'project', data: project });

            // Injection Check
            // Index 0 (After 1st P) -> Inject
            // Index 3 (After 4th P) -> Inject
            // Pattern: 0, 3, 6, 9...
            const shouldInject = index % 3 === 0;

            if (shouldInject) {
                const campaign = campaigns[campIndex % campaigns.length];
                mixed.push({ type: 'campaign', data: campaign });
                campIndex++;
            }
        });

        return mixed;
    };

    const mixedContent = getMixedContent();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* 1. Hero / Header */}
            <div className="bg-slate-900 text-white relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 opacity-90"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                        className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
                    >
                        Nos Réalisations
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-lg md:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed"
                    >
                        Explorez l'excellence de nos artisans et la qualité Horizon Chimique.
                    </motion.p>
                </div>
            </div>

            {/* 2. Filters & Realizations Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-20 -mt-10 relative z-20">

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-white p-4 rounded-xl shadow-lg border border-slate-100">

                    {/* Tags Filter */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        <Filter size={20} className="text-slate-400 mr-2 shrink-0" />
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTag === tag
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Grid */}
                {mixedContent.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                        {/* Empty State */}
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun projet trouvé</h3>
                        <p className="text-slate-500">Essayez de modifier vos filtres de recherche.</p>
                        <button onClick={() => { setActiveTag('Tous'); setSearchQuery(''); }} className="mt-4 text-primary font-bold hover:underline">
                            Réinitialiser les filtres
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {mixedContent.map((item, idx) => {
                            if (item.type === 'campaign') {
                                const campaign = item.data;
                                return (
                                    <motion.div
                                        key={`campaign-${campaign._id}-${idx}`}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`rounded-2xl shadow-xl overflow-hidden relative flex flex-col justify-between p-8 text-white ${campaign.color || 'bg-gradient-to-br from-indigo-600 to-purple-600'}`}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        {/* Optional Ad Image Background */}
                                        {campaign.image && (
                                            <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                                                <img src={campaign.image} alt="" className="w-full h-full object-cover grayscale" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur rounded-full p-2">
                                            <Megaphone size={20} className="text-white" />
                                        </div>

                                        <div className="relative z-10">
                                            <span className="inline-block px-3 py-1 bg-black/20 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-white/20">Sponsorisé</span>
                                            <h3 className="text-2xl font-black mb-3 leading-tight">{campaign.title}</h3>
                                            <p className="text-white/90 text-sm font-medium mb-6 line-clamp-4 leading-relaxed">
                                                {campaign.content}
                                            </p>
                                        </div>

                                        <div className="relative z-10 pt-4 border-t border-white/20">
                                            {campaign.link ? (
                                                <Link
                                                    href={campaign.link}
                                                    className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-center block hover:bg-slate-100 transition-colors shadow-lg active:scale-95 text-sm"
                                                >
                                                    En savoir plus
                                                </Link>
                                            ) : (
                                                <button className="w-full bg-white/20 text-white py-3 rounded-xl font-bold text-center block cursor-default text-sm">
                                                    Offre Limitée
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            } else {
                                const project = item.data;
                                return (
                                    <motion.div
                                        key={project._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col items-start h-full"
                                    >
                                        {/* Image */}
                                        <div className="relative w-full h-56 overflow-hidden bg-slate-100 cursor-pointer shrink-0">
                                            <Link href={`/realisations/${project.slug || project._id}`}>
                                                {project.images?.[0] ? (
                                                    <img
                                                        src={project.images[0]}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">Sans image</div>
                                                )}
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </Link>
                                            <div className="absolute top-4 left-4">
                                                {project.tags?.[0] && (
                                                    <span className="px-2 py-1 bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold uppercase rounded shadow-sm">
                                                        {project.tags[0]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 w-full flex-1 flex flex-col">
                                            <div className="flex items-center text-xs text-slate-400 mb-2">
                                                <Calendar size={12} className="mr-1" />
                                                {new Date(project.createdAt).toLocaleDateString()}
                                            </div>

                                            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                                <Link href={`/realisations/${project.slug || project._id}`}>
                                                    {project.title}
                                                </Link>
                                            </h3>

                                            <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">
                                                {project.description}
                                            </p>

                                            {/* Artisan Footer */}
                                            <div className="pt-3 border-t border-slate-50 w-full flex items-center justify-between mt-auto">
                                                <Link href={`/artisans/${project.artisan.slug || project.artisan._id}`} className="flex items-center gap-2 group/artisan">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden border border-slate-100 shrink-0">
                                                        {project.artisan.image ? <img src={project.artisan.image} className="w-full h-full object-cover" /> : <User size={14} className="m-1 text-slate-400" />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-700 group-hover/artisan:text-primary transition-colors truncate max-w-[120px] leading-tight">
                                                            {project.artisan.companyName || project.artisan.name}
                                                        </span>
                                                        {project.artisanRating > 0 && (
                                                            <div className="flex items-center mt-0.5">
                                                                <div className="flex">
                                                                    {[1, 2, 3, 4, 5].map(star => (
                                                                        <Star
                                                                            key={star}
                                                                            size={10}
                                                                            className={`${star <= Math.round(project.artisanRating) ? "text-yellow-500 fill-yellow-500" : "text-slate-200"}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="text-[9px] font-bold text-slate-400 ml-1">({project.artisanRating})</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>

                                                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium select-none">
                                                    <span className="flex items-center gap-1"><Heart size={14} /> {project.likesCount || 0}</span>
                                                    <span className="flex items-center gap-1"><MessageCircle size={14} /> {project.commentsCount || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            }
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
