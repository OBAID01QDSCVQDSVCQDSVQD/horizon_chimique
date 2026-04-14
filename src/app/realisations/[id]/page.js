import dbConnect from '@/lib/db';
import Realization from '@/models/Realization';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserCircle, MoreHorizontal } from 'lucide-react';
import ProjectGalleryFB from '@/components/ProjectGalleryFB';
import WhatsAppButton from '@/components/WhatsAppButton';

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

export async function generateMetadata({ params: { id } }) {
    await dbConnect();
    try {
        const project = await Realization.findById(id).populate('artisan', 'companyName name').lean();
        if (!project || !project.isVisible) return { title: 'Projet Introuvable | SDK Batiment' };

        const title = `${project.title} - par ${project.artisan?.companyName || project.artisan?.name} | SDK Batiment`;
        const description = project.description?.substring(0, 160) || "Découvrez nos réalisations chez SDK Batiment.";
        const defaultImage = project.images && project.images.length > 0 ? project.images[0] : '/logo.png';

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url: `https://sdkbatiment.com/realisations/${id}`,
                images: [
                    {
                        url: `/realisations/${id}/opengraph-image`,
                        width: 1200,
                        height: 630,
                        alt: project.title,
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [`/realisations/${id}/opengraph-image`],
            },
        };
    } catch {
        return { title: 'Projet | SDK Batiment' };
    }
}

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

    const artisanName = project.artisan?.companyName || project.artisan?.name;
    const artisanImage = project.artisan?.image;
    const postDate = new Date(project.createdAt).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>

            {/* Top Nav Bar - Back button */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e4e6ea', position: 'sticky', top: 0, zIndex: 50, padding: '10px 16px' }}>
                <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href={`/artisans/${project.artisan._id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#65676b', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                        <ArrowLeft size={18} />
                        Retour au profil de {artisanName}
                    </Link>
                    <WhatsAppButton
                        phone={project.artisan.whatsapp || project.artisan.phone}
                        label="Contacter"
                        className="px-4 py-2 rounded-full text-sm font-bold"
                    />
                </div>
            </div>

            {/* Facebook-style Feed Container */}
            <div style={{ maxWidth: 680, margin: '16px auto', padding: '0 0 40px 0' }}>

                {/* Post Card */}
                <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden' }}>

                    {/* Post Header - Author Info */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Link href={`/artisans/${project.artisan._id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: '#e4e6ea', border: '2px solid #e4e6ea' }}>
                                    {artisanImage
                                        ? <img src={artisanImage} alt={artisanName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : <UserCircle size={40} color="#bcc0c4" />
                                    }
                                </div>
                            </Link>
                            <div>
                                <Link href={`/artisans/${project.artisan._id}`} style={{ textDecoration: 'none' }}>
                                    <div style={{ fontWeight: 600, fontSize: 15, color: '#050505', lineHeight: 1.2 }}>{artisanName}</div>
                                </Link>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                    <span style={{ fontSize: 12, color: '#65676b' }}>{postDate}</span>
                                    <span style={{ color: '#65676b', fontSize: 10 }}>·</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#65676b"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                                </div>
                            </div>
                        </div>
                        <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#65676b' }}
                            aria-label="Plus d'options">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    {/* Post Title + Tags */}
                    <div style={{ padding: '0 16px 10px' }}>
                        <div style={{ fontSize: 15, color: '#050505', lineHeight: 1.4, fontWeight: 500 }}>
                            <strong>{project.title}</strong>
                        </div>
                        {project.tags && project.tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                                {project.tags.map(tag => (
                                    <span key={tag} style={{ background: '#e7f3ff', color: '#1877f2', borderRadius: 4, fontSize: 12, fontWeight: 700, padding: '2px 8px', textTransform: 'uppercase' }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Post Text Content */}
                    {project.description && (
                        <div style={{ padding: '0 16px 12px', fontSize: 14, color: '#333', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                            {project.description}
                        </div>
                    )}

                    {/* Facebook-Style Image Grid */}
                    <ProjectGalleryFB images={project.images} />

                    {/* Likes Count Bar */}
                    {likesCount > 0 && (
                        <div style={{ padding: '8px 16px', borderBottom: '1px solid #e4e6ea', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
                            </div>
                            <span style={{ fontSize: 13, color: '#65676b' }}>{likesCount} J'aime</span>
                        </div>
                    )}

                    {/* Interaction Bar - Like / Comment / Share */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #e4e6ea' }}>
                        {/* Like Button */}
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                            <LikeButton realizationId={project._id.toString()} initialLikes={likesCount} initialIsLiked={isLiked} facebookStyle={true} />
                        </div>
                        {/* Comment */}
                        <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontWeight: 600, fontSize: 14, color: '#65676b', borderRadius: 4 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            Commenter
                        </button>
                        {/* WhatsApp Share */}
                        <a
                            href={formatWhatsAppUrl(project.artisan.whatsapp || project.artisan.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontWeight: 600, fontSize: 14, color: '#65676b', textDecoration: 'none', borderRadius: 4 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Contacter
                        </a>
                    </div>

                    {/* Comments Section */}
                    <div style={{ padding: '0 0 8px 0' }}>
                        <CommentSection realizationId={project._id.toString()} facebookStyle={true} />
                    </div>
                </div>

                {/* Rating Card - Below Post */}
                <div style={{ marginTop: 12, background: '#fff', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.1)', padding: '16px' }}>
                    <ReviewSection artisanId={project.artisan._id.toString()} showList={false} title="Noter l'Artisan sur ce projet" />
                </div>

            </div>
        </div>
    );
}
