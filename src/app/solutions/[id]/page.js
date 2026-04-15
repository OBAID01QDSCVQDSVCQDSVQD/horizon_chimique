import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import dbConnect from '@/lib/db';
import Solution from '@/models/Solution';
import Product from '@/models/Product';
import Campaign from '@/models/Campaign';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Helper to get Icon
const getIconResult = (iconName) => {
    const Icon = LucideIcons[iconName] || LucideIcons.Layers;
    return Icon;
};

async function getData(id) {
    await dbConnect();
    try {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        const query = isObjectId ? { _id: id } : { slug: id };

        const solution = await Solution.findOne(query).populate({ path: 'relatedProducts', strictPopulate: false });
        const campaigns = await Campaign.find({ isActive: true }).sort({ createdAt: -1 });

        return { solution, campaigns };
    } catch (e) {
        console.error(e);
        return { solution: null, campaigns: [] };
    }
}

export async function generateMetadata({ params }) {
    await dbConnect();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(params.id);
    const query = isObjectId ? { _id: params.id } : { slug: params.id };
    
    const solution = await Solution.findOne(query).lean();
    if (!solution) return { title: 'Solution introuvable' };
    
    const title = `${solution.title} | SDK Batiment`;
    const description = "Découvrez notre solution technique d'étanchéité: " + solution.title;
    
    return {
        title,
        description,
        alternates: {
            canonical: `https://sdkbatiment.com/solutions/${solution.slug || params.id}`,
        },
        openGraph: {
            title,
            description,
            url: `https://sdkbatiment.com/solutions/${solution.slug || params.id}`,
            images: [
                {
                    url: '/logo.png',
                    width: 1200,
                    height: 630,
                    alt: solution.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/logo.png'],
        },
    };
}

// Helper to clean HTML (merge lists, remove empty p)
const cleanRichText = (html) => {
    if (!html) return '';
    // Merge adjacent lists of same type (handling attributes)
    let clean = html.replace(/<\/ol>\s*<ol[^>]*>/g, '');
    clean = clean.replace(/<\/ul>\s*<ul[^>]*>/g, '');

    // Remove empty paragraphs/breaks that might separate lists
    // Sometimes editors put <p><br></p> between lists
    clean = clean.replace(/<\/ol>\s*<p><br><\/p>\s*<ol[^>]*>/g, '');
    clean = clean.replace(/<\/ul>\s*<p><br><\/p>\s*<ul[^>]*>/g, '');

    // General empty cleanup
    clean = clean.replace(/<p><br><\/p>/g, '');
    return clean;
};

export default async function SolutionDetailPage({ params }) {
    const { solution, campaigns } = await getData(params.id);

    if (!solution) {
        notFound();
    }

    const IconComp = getIconResult(solution.icon);

    // JSON-LD Structured Data for AEO
    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": solution.title,
        "description": "Solution technique SDK Batiment : " + solution.title,
        "provider": {
            "@type": "LocalBusiness",
            "name": "SDK Batiment",
            "url": "https://sdkbatiment.com"
        },
        "areaServed": {
            "@type": "Country",
            "name": "Tunisie"
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Système " + solution.title,
            "itemListElement": (solution.features && solution.features.length > 0) 
                ? solution.features.map(f => ({
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": f
                    }
                }))
                : []
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Inject JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            {/* Hero Section */}
            <div className="relative bg-slate-900 pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/solutions" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
                        <ArrowLeft size={20} className="mr-2" /> Retour aux solutions
                    </Link>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className={`w-20 h-20 ${solution.color || 'bg-blue-500'} rounded-2xl flex items-center justify-center text-white shadow-xl`}>
                            <IconComp size={40} />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{solution.title}</h1>
                            <div className="flex items-center gap-2 text-primary font-medium bg-primary/10 px-3 py-1 rounded-full w-fit">
                                <span>Solution Technique</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Description */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-10 mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">À propos de cette solution</h2>
                            <div
                                className="text-slate-600 leading-relaxed [counter-reset:solution-counter]
                                [&_p]:mb-4 [&_p]:leading-7
                                [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:mb-6 [&_h1]:mt-8
                                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mb-4 [&_h2]:mt-8
                                [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mb-3 [&_h3]:mt-6
                                
                                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6
                                
                                [&_ol]:list-none [&_ol]:pl-0 [&_ol]:mb-1
                                [&_ol>li]:flex [&_ol>li]:items-baseline
                                [&_ol>li]:[counter-increment:solution-counter]
                                [&_ol>li]:before:content-[counter(solution-counter)_'.'] 
                                [&_ol>li]:before:font-bold [&_ol>li]:before:text-slate-900 [&_ol>li]:before:mr-3 [&_ol>li]:before:flex-shrink-0
                                
                                [&_li]:mb-1
                                [&_strong]:text-slate-900 [&_strong]:font-bold
                                [&_a]:text-primary [&_a]:underline hover:decoration-primary"
                                dangerouslySetInnerHTML={{ __html: cleanRichText(solution.description) }}
                            ></div>
                        </div>

                        {/* Related Products Section */}
                        {solution.relatedProducts && solution.relatedProducts.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-10">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <LucideIcons.Package className="text-primary" /> Produits Recommandés
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {solution.relatedProducts.map(prod => (
                                        <Link key={prod._id} href={`/products/${prod._id}`} className="group block h-full">
                                            <div className="border border-slate-200 rounded-xl p-3 sm:p-4 hover:border-primary hover:shadow-md transition-all h-full bg-slate-50/50 hover:bg-white flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-0">

                                                {/* Icon */}
                                                <div className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 shadow-sm flex-shrink-0 sm:mb-2">
                                                    <LucideIcons.Box size={20} />
                                                </div>

                                                {/* Title */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors text-sm sm:text-base truncate sm:whitespace-normal sm:line-clamp-2">
                                                        {prod.designation}
                                                    </h3>
                                                </div>

                                                {/* Arrow */}
                                                <ArrowRight size={18} className="text-slate-300 group-hover:text-primary transition-colors sm:absolute sm:top-4 sm:right-4 flex-shrink-0" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Features & CTA */}
                    <div className="space-y-8">
                        {/* Features Card */}
                        {solution.features && solution.features.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Caractéristiques Clés</h3>
                                <ul className="space-y-4">
                                    {solution.features.map((feat, i) => (
                                        <li key={i} className="flex items-start text-slate-600">
                                            <div className="mt-1 mr-3 bg-green-100 rounded-full p-1">
                                                <CheckCircle2 size={14} className="text-emerald-600" />
                                            </div>
                                            <span className="text-sm font-medium leading-relaxed">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* CTA Card */}
                        <div className="bg-primary rounded-2xl shadow-lg p-6 md:p-8 text-white text-center">
                            <h3 className="text-xl font-bold mb-3">Besoin d'un devis ?</h3>
                            <p className="text-blue-100 mb-6 text-sm">
                                Nos experts sont prêts à étudier votre projet et vous proposer cette solution.
                            </p>
                            <Link href="/contact" className="block w-full bg-white text-primary font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors">
                                Contacter Nous
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ADS / CAMPAIGNS SECTION */}
                {campaigns.length > 0 && (
                    <div className="mt-20">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <LucideIcons.Megaphone size={20} className="text-primary" /> Offres & Actualités
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {campaigns.map(ad => (
                                <Link
                                    key={ad._id}
                                    href={ad.link || '#'}
                                    className={`block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all group ${ad.color || 'bg-gradient-to-r from-blue-600 to-purple-600'}`}
                                >
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 opacity-20">
                                        <div className="absolute inset-0 bg-white/10 rotate-12 transform scale-150"></div>
                                    </div>

                                    <div className="relative p-8 text-white flex flex-col md:flex-row items-center gap-6">
                                        {/* Optional Image */}
                                        {ad.image && (
                                            <div className="w-24 h-24 rounded-xl bg-white/20 flex-shrink-0 overflow-hidden hidden sm:block">
                                                <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        <div className="flex-1 text-center md:text-left">
                                            <h4 className="text-2xl font-bold mb-2 text-white">{ad.title}</h4>
                                            <p className="text-blue-50 text-sm mb-4 leading-relaxed">{ad.content}</p>
                                            <span className="inline-flex items-center text-sm font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                                                En savoir plus <ArrowRight size={16} className="ml-2" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
