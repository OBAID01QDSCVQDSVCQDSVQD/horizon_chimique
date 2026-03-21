import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import dbConnect from '@/lib/db';
import Solution from '@/models/Solution';
import Product from '@/models/Product'; // Ensure model is provided for population

export const metadata = {
    title: 'Solutions - Horizon Chimique',
    description: 'Découvrez nos solutions techniques pour le bâtiment.',
};

// Helper to get Icon Component safley
const getIconResult = (iconName) => {
    // Default to Layers if invalid
    const Icon = LucideIcons[iconName] || LucideIcons.Layers;
    return Icon;
};

// Helper to strip HTML and truncate
const getExcerpt = (html, length = 120) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>?/gm, ' '); // Replace tags with space
    const cleanText = text.replace(/\s+/g, ' ').trim(); // Compact whitespace
    return cleanText.length > length ? cleanText.substring(0, length) + '...' : cleanText;
};

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export default async function SolutionsPage() {
    await dbConnect();
    // Don't populate products here heavily - detail page does that.
    // We just list solutions.
    const solutions = await Solution.find({}).sort({ createdAt: -1 });

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="relative bg-slate-900 py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 mix-blend-multiply"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                        Nos Solutions
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Systèmes et techniques expertes pour vos chantiers.
                    </p>
                </div>
            </div>

            {/* Solutions Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {solutions.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
                        <div className="inline-flex bg-slate-100 p-4 rounded-full mb-4">
                            <LucideIcons.SearchX size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Aucune solution visible</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            La liste des solutions est en cours de mise à jour.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {solutions.map((sol) => {
                            const IconComp = getIconResult(sol.icon);
                            return (
                                <Link key={sol._id} href={`/solutions/${sol._id}`} className="group block h-full">
                                    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 h-full flex flex-col relative overflow-hidden">

                                        {/* Color Accent Top */}
                                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${sol.color || 'bg-blue-500'}`}></div>

                                        <div className="flex items-start gap-4 mb-4 mt-2">
                                            <div className={`w-12 h-12 ${sol.color || 'bg-blue-500'} bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm`}>
                                                {/* Use Style to force background opacity if color is plain bg-class, OR just use color text and bg-slate-50. 
                                                    Let's stick to the previous colored box style but smaller */}
                                                <div className={`w-full h-full rounded-xl flex items-center justify-center ${sol.color || 'bg-blue-500'}`}>
                                                    <IconComp size={24} strokeWidth={2} />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight">
                                                    {sol.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <p className="text-slate-600 text-sm mb-6 leading-relaxed flex-grow">
                                            {getExcerpt(sol.description)}
                                        </p>

                                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-primary font-bold text-sm">
                                            <span>Découvrir la solution</span>
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
