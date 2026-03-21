'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowRight, Droplets, LayoutGrid, List } from 'lucide-react';

export default function ProductsCatalogPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const categories = [
        'Tous',
        'Étanchéité Liquide',
        'Adjuvants pour Béton',
        'Revêtements de Sol',
        'Mortiers Spéciaux',
        'Protection de Façades',
        'Isolation Thermique'
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch all products
                const res = await fetch('/api/products');
                const data = await res.json();
                if (data.success) {
                    setProducts(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Facebook Pixel Track Search with debounce
    useEffect(() => {
        if (!searchTerm) return;

        const delayDebounceFn = setTimeout(() => {
            if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Search', { search_string: searchTerm });
            }
        }, 1000);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // client-side filtering
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description_courte.toLowerCase().includes(searchTerm.toLowerCase());

        // Handle both Array (new) and String (legacy) formats for 'gamme'
        const productGammes = Array.isArray(product.gamme) ? product.gamme : [product.gamme];
        const matchesCategory = selectedCategory === 'Tous' || productGammes.includes(selectedCategory);

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            {/* Header - Compact */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Nos Solutions Techniques</h1>
                    <p className="text-base text-slate-600 max-w-2xl">
                        Découvrez notre gamme complète de produits chimiques pour le bâtiment et les travaux publics.
                        Qualité professionnelle pour tous vos chantiers.
                    </p>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Filters & Search Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-3 rounded-xl shadow-sm border border-slate-100">

                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories Tabs */}
                <div className="mb-8 overflow-x-auto pb-2">
                    <div className="flex gap-2 min-w-max">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap text-sm ${selectedCategory === cat
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                        {filteredProducts.map((product) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={product._id}
                                className={`bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all duration-300 group ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}`}
                            >
                                {/* Image */}
                                <div className={`bg-slate-50 relative overflow-hidden flex items-center justify-center p-4 ${viewMode === 'list' ? 'w-full md:w-56 aspect-video' : 'aspect-video'}`}>
                                    <img
                                        src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder-product.jpg'}
                                        alt={product.designation}
                                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[80%]">
                                        {/* Display Categories Badges */}
                                        {Array.isArray(product.gamme) ? (
                                            product.gamme.slice(0, 1).map((g, idx) => (
                                                <span key={idx} className="bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded-full text-slate-700 shadow-sm border border-slate-100">
                                                    {g}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded-full text-slate-700 shadow-sm border border-slate-100">
                                                {product.gamme}
                                            </span>
                                        )}
                                        {Array.isArray(product.gamme) && product.gamme.length > 1 && (
                                            <span className="bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded-full text-slate-700 shadow-sm border border-slate-100">+{product.gamme.length - 1}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors line-clamp-1" title={product.designation}>{product.designation}</h3>
                                    <p className="text-slate-500 text-xs line-clamp-2 mb-3 flex-grow">{product.description_courte}</p>

                                    {/* Tech Specs Preview */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {product.donnees_techniques?.densite && (
                                            <div className="bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
                                                <p className="text-[10px] uppercase text-slate-400 font-bold">Densité</p>
                                                <p className="text-xs font-semibold text-slate-700">{product.donnees_techniques.densite}</p>
                                            </div>
                                        )}
                                        {product.donnees_techniques?.couleur && (
                                            <div className="bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
                                                <p className="text-[10px] uppercase text-slate-400 font-bold">Couleur</p>
                                                <p className="text-xs font-semibold text-slate-700">{product.donnees_techniques.couleur}</p>
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        href={`/products/${product._id}`}
                                        className="mt-auto w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold hover:bg-primary transition-colors flex items-center justify-center gap-2 group-hover:gap-3 text-sm"
                                    >
                                        Voir Détails <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                        <Droplets className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                        <h3 className="text-base font-medium text-slate-900">Aucun produit trouvé</h3>
                        <p className="text-slate-500 text-sm">Essayez de modifier vos filtres ou votre recherche.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('Tous'); }}
                            className="mt-3 text-primary font-medium hover:underline text-sm"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
}
