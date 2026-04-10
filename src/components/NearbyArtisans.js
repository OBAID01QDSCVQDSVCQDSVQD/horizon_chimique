'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Star, User, Building2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NearbyArtisans() {
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            fetchArtisans('', '');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
                fetchArtisans(latitude, longitude);
            },
            (err) => {
                console.error("Geo error:", err);
                // Fallback: fetch all artisans without strict location
                fetchArtisans('', '');
            }
        );
    }, []);

    const fetchArtisans = async (lat, lng) => {
        try {
            const res = await fetch(`/api/artisans/nearby?lat=${lat}&lng=${lng}`);
            const data = await res.json();
            if (data.success) {
                setArtisans(data.artisans);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Removed the error blocking view, as we now fetch all artisans regardless of location permissions.

    if (loading) {
        return (
            <div className="py-12 bg-white border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                        <div className="space-y-2">
                            <div className="h-6 w-32 bg-slate-100 rounded animate-pulse"></div>
                            <div className="h-8 w-64 bg-slate-200 rounded animate-pulse"></div>
                            <div className="h-4 w-48 bg-slate-100 rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex overflow-x-auto gap-4 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="min-w-[200px] bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex flex-col items-center animate-pulse">
                                <div className="w-16 h-16 bg-slate-200 rounded-full mb-3"></div>
                                <div className="h-4 w-3/4 bg-slate-200 rounded mb-2"></div>
                                <div className="h-3 w-1/2 bg-slate-200 rounded mb-4"></div>
                                <div className="w-full h-8 bg-slate-200 rounded-lg mt-auto"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (artisans.length === 0) {
        return (
            <div className="py-12 max-w-6xl mx-auto px-4 text-center border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Experts près de chez vous</h2>
                <p className="text-slate-500">Aucun expert trouvé dans votre zone pour le moment.</p>
                {process.env.NODE_ENV === 'development' && (
                    <p className="text-xs text-blue-500 mt-2 cursor-pointer" onClick={() => window.open('/api/seed-artisans', '_blank')}>
                        (Dev: Cliquez ici pour générer des données de test)
                    </p>
                )}
            </div>
        );
    }

    return (
        <section className="py-12 bg-slate-50 border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 shadow-sm border border-blue-50">
                            <MapPin size={14} /> À Proximité
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Experts près de chez vous</h2>
                        <p className="text-slate-500 mt-1 text-sm md:text-base">
                            Trouvez les meilleurs applicateurs agréés Horizon Chimique dans votre région.
                        </p>
                    </div>

                    {/* Navigation Buttons for Desktop */}
                    <div className="hidden md:flex items-center gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                            aria-label="Previous"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                            aria-label="Next"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {artisans.map((artisan) => (
                        <motion.div
                            key={artisan._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 p-5 min-w-[40%] sm:min-w-[240px] md:min-w-[260px] shrink-0 snap-center flex flex-col items-center text-center transition-all duration-300 relative group h-[280px]"
                        >
                            {/* Distance Badge */}
                            <div className="absolute top-4 right-4 text-slate-400 text-[10px] font-bold flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                <MapPin size={10} />
                                {artisan.distance >= 99990 ? 'National' : (artisan.distance < 1 ? '< 1 km' : `${artisan.distance} km`)}
                            </div>

                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-full p-0.5 bg-white ring-2 ring-blue-50 shadow-sm mb-3 mt-4 group-hover:scale-110 transition-transform duration-300 relative">
                                <img
                                    src={artisan.image || '/default-avatar.png'}
                                    alt={artisan.name}
                                    className="w-full h-full object-cover rounded-full"
                                    onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + artisan.name}
                                />
                                {/* Enhanced Rank Badge */}
                                {(() => {
                                    const isGold = artisan.fidelityRank === 'gold' || (!artisan.fidelityRank && (artisan.points || 0) >= 5000);
                                    const isSilver = artisan.fidelityRank === 'silver' || (!artisan.fidelityRank && (artisan.points || 0) >= 1000);

                                    if (isGold) return (
                                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-lg p-1.5 border-2 border-white flex items-center justify-center animate-pulse" title="Membre Or">
                                            <Star size={12} className="text-white fill-current" />
                                        </div>
                                    );
                                    if (isSilver) return (
                                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-slate-200 to-slate-400 rounded-full shadow-md p-1.5 border-2 border-white flex items-center justify-center" title="Membre Argent">
                                            <Star size={12} className="text-white fill-current" />
                                        </div>
                                    );
                                    return (
                                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-orange-300 to-orange-600 rounded-full shadow-sm p-1.5 border-2 border-white flex items-center justify-center" title="Membre Bronze">
                                            <Star size={12} className="text-white fill-current" />
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="flex-grow w-full flex flex-col items-center justify-center">
                                {(() => {
                                    const truncateName = (str) => {
                                        if (!str) return '';
                                        const words = str.split(' ');
                                        if (words.length <= 2) return str;
                                        return words.slice(0, 2).join(' ') + '...';
                                    };

                                    return (
                                        <>
                                            <div className="flex items-center justify-center gap-2 w-full px-2">
                                                <h3 className="font-bold text-slate-800 text-base mb-1 line-clamp-1" title={artisan.name}>
                                                    {truncateName(artisan.name)}
                                                </h3>
                                            </div>
                                            <div className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide line-clamp-1 w-full px-2">
                                                {truncateName(artisan.companyName || 'Artisan Indépendant')}
                                            </div>
                                        </>
                                    );
                                })()}

                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full mb-1 border border-blue-100/50">
                                    {artisan.specialty || 'Applicateur'}
                                </span>
                            </div>

                            <div className="w-full mt-auto">
                                <Link href={`/artisans/${artisan._id}`} className="block w-full bg-white border border-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:border-slate-900 shadow-sm">
                                    <Phone size={14} className="group-hover:fill-current" /> Contacter
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
