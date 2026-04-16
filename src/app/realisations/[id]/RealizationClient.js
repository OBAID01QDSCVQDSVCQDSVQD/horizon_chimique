'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserCircle, MoreHorizontal, ClipboardList } from 'lucide-react';
import ProjectGalleryFB from '@/components/ProjectGalleryFB';
import WhatsAppButton from '@/components/WhatsAppButton';
import ShareButton from '@/components/ShareButton';
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import ReviewSection from "@/components/ReviewSection";
import SupportModal from '@/components/SupportModal';
import { trackFbEvent } from '@/utils/trackFbEvent';

const formatWhatsAppUrl = (phone) => {
    if (!phone) return null;
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('216')) {
        return `https://wa.me/${clean}`;
    }
    return `https://wa.me/216${clean}`;
};

export default function RealizationClient({ project, userId, isLiked, likesCount }) {
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const artisanName = project.artisan?.companyName || project.artisan?.name;
    const artisanImage = project.artisan?.image;
    const postDate = new Date(project.createdAt).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' });

    // 🚀 TRACK CONTACT CLICK
    const handleContactClick = () => {
        trackFbEvent('Contact', {
            content_name: 'WhatsApp/Phone Contact',
            content_category: 'Artisan Contact',
            artisan_name: artisanName
        });
    };

    const handleDiagnosticClick = () => {
        setIsSupportOpen(true);
        // Track initiation
        trackFbEvent('InitiateCheckout', {
            content_name: 'Diagnostic Form Started from Realization',
            content_category: 'Diagnostic'
        });
    };

    const DiagnosticCTA = ({ isTop = false, isMiddle = false }) => (
        <div style={{ 
            margin: isTop ? '16px 16px 8px' : isMiddle ? '16px 0' : '0 16px 16px', 
            padding: '16px', 
            borderRadius: 12, 
            background: isTop ? 'linear-gradient(135deg, #1877f2 0%, #0d47a1 100%)' : 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)', 
            border: isTop ? 'none' : '1px solid #e7f3ff', 
            color: isTop ? '#fff' : 'inherit',
            display: 'flex', 
            flexWrap: 'wrap',
            alignItems: 'center', 
            gap: 12, 
            boxShadow: isTop ? '0 4px 12px rgba(24,119,242,0.2)' : '0 2px 8px rgba(24,119,242,0.05)' 
        }}>
            <div style={{ background: isTop ? 'rgba(255,255,255,0.2)' : '#e7f3ff', padding: 10, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClipboardList className={isTop ? 'text-white' : 'text-blue-600'} size={20} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: isTop ? '#fff' : '#050505', marginBottom: 2 }}>Besoin d'un diagnostic ?</div>
                <div style={{ fontSize: 12, color: isTop ? 'rgba(255,255,255,0.9)' : '#65676b' }}>Demandez μια visite technique gratuite.</div>
            </div>
            <button onClick={handleDiagnosticClick} style={{ 
                background: isTop ? '#fff' : '#1877f2', 
                color: isTop ? '#1877f2' : '#fff', 
                padding: '10px 18px', 
                borderRadius: 8, 
                fontSize: 13, 
                fontWeight: 700, 
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center',
                flex: '1 1 auto',
                minWidth: 'fit-content',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}>
                Demander Diagnostic
            </button>
        </div>
    );

    const description = project.description || '';
    const paragraphs = description.split('\n');
    const isLong = description.length > 500 && paragraphs.length > 3;

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
            
            <SupportModal 
                isOpen={isSupportOpen} 
                type="diagnostic" 
                onClose={() => setIsSupportOpen(false)} 
            />

            {/* Top Nav Bar */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e4e6ea', position: 'sticky', top: 0, zIndex: 50, padding: '10px 16px' }}>
                <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href={`/artisans/${project.artisan.slug || project.artisan._id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#65676b', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                        <ArrowLeft size={18} />
                        <span className="truncate">Profil de {artisanName}</span>
                    </Link>
                    <div onClick={handleContactClick}>
                        <WhatsAppButton
                            phone={project.artisan.whatsapp || project.artisan.phone}
                            label="Contacter"
                            className="px-4 py-2 rounded-full text-sm font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Content Buffer Container */}
            <div style={{ maxWidth: 680, margin: '8px auto', padding: '0 0 40px 0' }}>
                
                <article style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <ProjectGalleryFB images={project.images} video={project.video} />

                    <DiagnosticCTA isTop={true} />

                    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Link href={`/artisans/${project.artisan.slug || project.artisan._id}`} style={{ textDecoration: 'none' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: '#e4e6ea' }}>
                                    {artisanImage ? <img src={artisanImage} alt={artisanName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCircle size={40} color="#bcc0c4" />}
                                </div>
                            </Link>
                            <div>
                                <Link href={`/artisans/${project.artisan.slug || project.artisan._id}`} style={{ textDecoration: 'none' }}>
                                    <span style={{ fontWeight: 600, fontSize: 15, color: '#050505' }}>{artisanName}</span>
                                </Link>
                                <div style={{ fontSize: 12, color: '#65676b' }}>{postDate}</div>
                            </div>
                        </div>
                    </header>

                    <div style={{ padding: '0 16px 10px' }}>
                        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#050505', marginBottom: 8 }}>{project.title}</h1>
                        {project.location && <div style={{ fontSize: 13, color: '#65676b', marginBottom: 8 }}>📍 {project.location}</div>}
                    </div>

                    <div style={{ padding: '0 16px 12px', fontSize: 15, color: '#1c1e21', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                        {isLong ? (
                            <>
                                {paragraphs.slice(0, 2).join('\n')}
                                <DiagnosticCTA isMiddle={true} />
                                {paragraphs.slice(2).join('\n')}
                            </>
                        ) : (
                            <>
                                {description}
                                <DiagnosticCTA />
                            </>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid #e4e6ea', marginTop: 8 }}>
                        <div className="flex justify-center"><LikeButton realizationId={project._id.toString()} initialLikes={likesCount} initialIsLiked={isLiked} facebookStyle={true} /></div>
                        <button style={{ background: 'none', border: 'none', padding: '10px', color: '#65676b', fontWeight: 600, fontSize: 13 }}>Commenter</button>
                        <div onClick={handleContactClick} className="flex justify-center items-center">
                            <a href={formatWhatsAppUrl(project.artisan.whatsapp || project.artisan.phone)} target="_blank" rel="noopener" style={{ color: '#25D366', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>WhatsApp</a>
                        </div>
                    </div>

                    <div style={{ padding: '8px 16px' }}><CommentSection realizationId={project._id.toString()} facebookStyle={true} /></div>
                </article>

                <div style={{ marginTop: 12, background: '#fff', borderRadius: 8, padding: '16px' }}>
                    <ReviewSection artisanId={project.artisan._id.toString()} showList={false} title="Noter ce projet" />
                </div>
            </div>
        </div>
    );
}
