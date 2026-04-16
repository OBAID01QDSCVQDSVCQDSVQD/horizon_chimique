import dbConnect from '@/lib/db';
import Realization from '@/models/Realization';
import { notFound } from 'next/navigation';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import RealizationClient from './RealizationClient';

export async function generateMetadata({ params: { id } }) {
    await dbConnect();
    try {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        const query = isObjectId ? { _id: id } : { slug: id };
        const project = await Realization.findOne(query).populate('artisan', 'companyName name').lean();
        if (!project || !project.isVisible) return { title: 'Projet Introuvable | SDK Batiment' };

        return {
            title: `${project.title} - par ${project.artisan?.companyName || project.artisan?.name} | SDK Batiment`,
            description: project.description?.substring(0, 160) || "Découvrez nos réalisations chez SDK Batiment.",
            openGraph: {
                images: [{ url: project.images?.[0] || '/logo.png' }],
            }
        };
    } catch { return { title: 'Projet | SDK Batiment' }; }
}

export default async function PublicRealizationDetail({ params }) {
    const { id } = params;
    await dbConnect();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    let project;
    try {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        const query = isObjectId ? { _id: id } : { slug: id };

        project = await Realization.findOne(query).populate('artisan', 'name companyName image phone email whatsapp fidelityRank points');
        if (!project || !project.isVisible) return notFound();
    } catch (e) {
        return notFound();
    }

    const hasLikesArray = Array.isArray(project.likes);
    const likesCount = hasLikesArray ? project.likes.length : 0;
    const isLiked = userId && hasLikesArray ? project.likes.some(like => like.toString() === userId) : false;

    // JSON-LD Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: project.title,
        description: project.description,
        image: project.images,
        datePublished: project.createdAt,
        author: {
            '@type': 'Organization',
            name: project.artisan?.companyName || project.artisan?.name,
        }
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <RealizationClient 
                project={JSON.parse(JSON.stringify(project))} 
                userId={userId}
                isLiked={isLiked}
                likesCount={likesCount}
            />
        </>
    );
}
