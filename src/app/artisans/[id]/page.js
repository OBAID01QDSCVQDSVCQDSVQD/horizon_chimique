import dbConnect from '@/lib/db';
import User from '@/models/User';
import Realization from '@/models/Realization';
import Review from '@/models/Review';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import WhatsAppButton from '@/components/WhatsAppButton';
import { MapPin, Phone, Mail, Globe, Calendar, CheckCircle2, Star, ArrowRight, MessageCircle } from 'lucide-react';
import ReviewSection from '@/components/ReviewSection';
import { buildMetadata } from '@/lib/metadata';

export async function generateMetadata({ params: { id } }) {
    await dbConnect();
    try {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        const query = isObjectId ? { _id: id } : { slug: id };
        const artisan = await User.findOne(query).lean();
        if (!artisan || artisan.role !== 'artisan') return { title: 'Artisan | SDK Batiment' };

        const name = artisan.companyName || artisan.name;
        const specialty = artisan.specialty ? ` - Spécialiste en ${artisan.specialty}` : '';
        const title = `${name}${specialty} | Artisan Partenaire SDK Batiment`;
        const description = artisan.bio?.substring(0, 160) || `Découvrez le profil professionnel de ${name} sur SDK Batiment.`;
        const image = artisan.image || '/og-image.jpg';
        const keywords = [
            name, artisan.specialty, artisan.address,
            'artisan Tunisie', 'SDK Batiment', 'étanchéité', 'travaux bâtiment',
        ].filter(Boolean).join(', ');

        const base = buildMetadata(title, description, `/artisans/${artisan.slug || id}`, image);
        // Elevate OpenGraph metadata
        base.openGraph = {
            ...base.openGraph,
            type: 'profile',
            siteName: 'SDK Batiment',
            locale: 'fr_TN',
        };
        return { ...base, keywords };
    } catch {
        return { title: 'Artisan | SDK Batiment' };
    }
}

export default async function ArtisanProfile({ params }) {
    const { id } = params;

    await dbConnect();

    let artisan;
    let projects = [];

    try {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        const query = isObjectId ? { _id: id } : { slug: id };

        artisan = await User.findOne(query);
        if (!artisan || artisan.role !== 'artisan') {
            return notFound();
        }
        projects = await Realization.find({ artisan: artisan._id, isVisible: true }).sort({ createdAt: -1 });

        const reviews = await Review.find({ artisan: artisan._id, status: 'approved' });
        const avgRating = reviews.length > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : '5.0';

        artisan.reviewsCount = reviews.length;
        artisan.avgRating = avgRating;
    } catch (e) {
        return notFound();
    }

    // JSON-LD LocalBusiness for Google
    const artisanName = artisan.companyName || artisan.name;
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: artisanName,
        description: artisan.bio || `Artisan partenaire SDK Batiment`,
        image: artisan.image || '',
        url: `https://sdkbatiment.com/artisans/${artisan.slug || id}`,
        ...(artisan.phone && { telephone: artisan.phone }),
        ...(artisan.email && { email: artisan.email }),
        ...(artisan.address && {
            address: {
                '@type': 'PostalAddress',
                streetAddress: artisan.address,
                addressCountry: 'TN',
            },
        }),
        ...(artisan.specialty && { knowsAbout: artisan.specialty }),
        ...(artisan.reviewsCount > 0 && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: artisan.avgRating,
                reviewCount: artisan.reviewsCount,
                bestRating: '5'
            }
        })
    };

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://sdkbatiment.com' },
            { '@type': 'ListItem', position: 2, name: 'Artisans', item: 'https://sdkbatiment.com/artisans' },
            { '@type': 'ListItem', position: 3, name: artisanName, item: `https://sdkbatiment.com/artisans/${artisan.slug || id}` },
        ],
    };

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        "mainEntity": [
            {
                "@type": "Question",
                "name": `Qui est ${artisanName} ?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": artisan.bio?.replace(/<[^>]*>/g, '').slice(0, 300) || `${artisanName} est un artisan partenaire certifié par SDK Batiment, expert en travaux d'étanchéité et bâtiment.`
                }
            },
            ...(artisan.address ? [{
                "@type": "Question",
                "name": `Quelle est l'adresse ou la zone d'intervention de ${artisanName} ?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `${artisanName} est principalement localisé à ${artisan.address} et intervient pour réaliser vos travaux de construction ou rénovation.`
                }
            }] : []),
            {
                "@type": "Question",
                "name": `Comment contacter ${artisanName} ?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Vous pouvez facilement contacter ${artisanName} via la plateforme SDK Batiment en cliquant sur le bouton de contact sur son profil.`
                }
            }
        ]
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* JSON-LD for Google */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            {/* Header / Cover */}
            <div className="h-64 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
                    <div className="p-8 sm:p-10 flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar */}
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg bg-slate-200 overflow-hidden flex-shrink-0">
                            {artisan.image ? (
                                <img src={artisan.image} alt={artisan.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-4xl">
                                    {artisan.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 w-full text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                        {artisan.companyName || artisan.name}
                                        {(() => {
                                            const isGold = artisan.fidelityRank === 'gold' || (!artisan.fidelityRank && (artisan.points || 0) >= 5000);
                                            const isSilver = artisan.fidelityRank === 'silver' || (!artisan.fidelityRank && (artisan.points || 0) >= 1000);

                                            if (isGold) return <span className="bg-gradient-to-br from-yellow-300 to-yellow-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white ring-1 ring-yellow-200">🥇</span>;
                                            if (isSilver) return <span className="bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md border-2 border-white ring-1 ring-slate-200">🥈</span>;
                                            return <span className="bg-gradient-to-br from-orange-300 to-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm border-2 border-white ring-1 ring-orange-200">🥉</span>;
                                        })()}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1
                                            ${artisan.fidelityRank === 'gold' || (!artisan.fidelityRank && (artisan.points || 0) >= 5000) ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                                                artisan.fidelityRank === 'silver' || (!artisan.fidelityRank && (artisan.points || 0) >= 1000) ? 'bg-slate-50 text-slate-700 border-slate-200' :
                                                    'bg-orange-50 text-orange-800 border-orange-200'}`}>
                                            <Star size={12} className="fill-current" />
                                            {artisan.fidelityRank === 'gold' || (!artisan.fidelityRank && (artisan.points || 0) >= 5000) ? 'Membre Or' :
                                                artisan.fidelityRank === 'silver' || (!artisan.fidelityRank && (artisan.points || 0) >= 1000) ? 'Membre Argent' : 'Membre Bronze'}
                                        </span>
                                        {artisan.specialty && (
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100">
                                                {artisan.specialty}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {artisan.phone && (
                                    <WhatsAppButton 
                                        phone={artisan.phone} 
                                        className="px-6 py-3" 
                                    />
                                )}
                            </div>

                            {artisan.bio && (
                                <p className="text-slate-600 mb-6 leading-relaxed max-w-2xl">{artisan.bio}</p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-500 border-t border-slate-100 pt-6">
                                {artisan.address && (
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <MapPin size={16} className="text-slate-400" /> {artisan.address}
                                    </div>
                                )}
                                {artisan.email && (
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <Mail size={16} className="text-slate-400" /> {artisan.email}
                                    </div>
                                )}
                                {artisan.website && (
                                    <a href={artisan.website} target="_blank" className="flex items-center justify-center md:justify-start gap-2 hover:text-primary hover:underline">
                                        <Globe size={16} className="text-slate-400" /> Site Web
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mb-12">
                    <ReviewSection artisanId={artisan._id.toString()} />
                </div>

                {/* Projects Gallery Section */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Réalisations</h2>
                            <p className="text-slate-500">Les derniers chantiers de {artisan.name}</p>
                        </div>
                        <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                            {projects.length} Projets
                        </span>
                    </div>

                    {projects.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-400 font-medium">Cet artisan n'a pas encore publié de réalisations.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <Link
                                    href={`/realisations/${project.slug || project._id}`}
                                    key={project._id}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={project.images[0]}
                                            alt={project.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                        <div className="absolute bottom-4 left-4 right-4 text-white">
                                            {project.location && (
                                                <div className="flex items-center gap-1 text-xs font-bold mb-1 opacity-90">
                                                    <MapPin size={12} /> {project.location}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">{project.description}</p>

                                        <div className="flex items-center gap-2 mt-auto">
                                            {project.tags?.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-[10px] uppercase font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                                                    {tag}
                                                </span>
                                            ))}
                                            {project.tags?.length > 3 && (
                                                <span className="text-[10px] font-bold text-slate-400">+{project.tags.length - 3}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
