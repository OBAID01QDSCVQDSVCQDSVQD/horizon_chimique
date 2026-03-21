import dbConnect from '@/lib/db';
import Realization from '@/models/Realization';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, UserCircle, Maximize2, X, MessageCircle } from 'lucide-react';
import ProjectGallery from '@/components/ProjectGallery';

const formatWhatsAppUrl = (phone) => {
    if (!phone) return null;
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('216')) {
        return `https://wa.me/${clean}`;
    }
    return `https://wa.me/216${clean}`;
};

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import ReviewSection from "@/components/ReviewSection";

// Server Component for SEO
export default async function PublicRealizationDetail({ params }) {
    const { id } = params;
    await dbConnect();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    let project;
    try {
        project = await Realization.findById(id).populate('artisan', 'name companyName image phone email whatsapp');
        if (!project || !project.isVisible) return notFound();
    } catch (e) {
        return notFound();
    }

    const hasLikesArray = Array.isArray(project.likes);
    const likesCount = hasLikesArray ? project.likes.length : 0;
    const isLiked = userId && hasLikesArray ? project.likes.some(like => like.toString() === userId) : false;

    return (
        <div className="min-h-screen bg-white">
            {/* Header / Actions */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href={`/artisans/${project.artisan._id}`} className="flex items-center text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors">
                        <ArrowLeft size={18} className="mr-2" /> Retour au profil de {project.artisan.companyName || project.artisan.name}
                    </Link>
                    <a
                        href={formatWhatsAppUrl(project.artisan.whatsapp || project.artisan.phone) || '/contact'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-full shadow-lg transition-colors font-bold text-sm flex items-center gap-2"
                    >
                        <MessageCircle size={18} />
                        Contacter l'Artisan
                    </a>
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

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-500 mb-6">
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
                        <Link href={`/artisans/${project.artisan._id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                            {project.artisan?.image ? (
                                <img src={project.artisan.image} alt="Artisan" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                                <UserCircle size={20} className="text-slate-400" />
                            )}
                            <span className="text-slate-700 font-bold underline decoration-slate-300 underline-offset-4 hover:decoration-primary">{project.artisan?.companyName || project.artisan?.name}</span>
                        </Link>
                    </div>

                    {/* Like Button */}
                    <div className="flex justify-center">
                        <LikeButton realizationId={project._id.toString()} initialLikes={likesCount} initialIsLiked={isLiked} />
                    </div>
                </div>

                {/* Gallery Grid (Static for SSR, Client Component for Lightbox maybe? Or just simple display) */}
                {/* For simplicity in Server Component, we render images. To add Lightbox, we'd need a Client Component wrapper. */}
                {/* I will use a simple grid display for now to ensure robustness without hydration errors mixed with state. */}

                {/* Description Content (Moved Up) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
                    <div className="lg:col-span-2">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-primary pl-4">À propos du projet</h3>
                        <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                            {project.description}
                        </div>

                        {/* Artisan Rating Form */}
                        <div className="mt-8">
                            <ReviewSection artisanId={project.artisan._id.toString()} showList={false} title="Noter l'Artisan sur ce projet" />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 sticky top-24">
                            <h4 className="font-bold text-slate-900 mb-4">Artisan</h4>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden border border-white shadow-sm">
                                    {project.artisan.image ? <img src={project.artisan.image} className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full p-2 text-slate-400" />}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 leading-tight">{project.artisan.companyName || project.artisan.name}</div>
                                    <Link href={`/artisans/${project.artisan._id}`} className="text-xs text-primary font-bold hover:underline">Voir le profil complet</Link>
                                </div>
                            </div>
                            <hr className="my-4 border-slate-200" />
                            <a
                                href={formatWhatsAppUrl(project.artisan.whatsapp || project.artisan.phone) || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-full py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2 mb-2 shadow-lg shadow-green-900/10 active:scale-95 ${formatWhatsAppUrl(project.artisan.whatsapp || project.artisan.phone) ? '' : 'opacity-50 cursor-not-allowed pointer-events-none'}`}
                            >
                                <MessageCircle size={18} />
                                Discuss on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>

                {/* Professional Gallery Section (Moved Down & Improved) */}
                {/* Interactive Gallery Component */}
                <ProjectGallery images={project.images} />

                {/* Comments Section */}
                <CommentSection realizationId={project._id.toString()} />

            </div>
        </div>
    );
}
