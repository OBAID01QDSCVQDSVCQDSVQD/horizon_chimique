'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, FileText } from 'lucide-react';

export default function AdminProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
            return;
        }

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                // Remove from state
                setProducts(products.filter(p => p._id !== id));
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Failed to delete product', error);
            alert('Erreur lors de la suppression');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion des Produits</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Gérez votre catalogue, ajoutez ou modifiez des fiches techniques.</p>
                </div>
                <Link href="/admin/products/create" className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm">
                    <Plus size={20} />
                    Ajouter un Produit
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Table Header/Filter */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-700">
                                <th className="px-6 py-4">Produit</th>
                                <th className="px-6 py-4">Catégorie</th>
                                <th className="px-6 py-4">Rendement</th>
                                <th className="px-6 py-4">Points</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Chargement...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Aucun produit trouvé. Commencez par en ajouter un.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {/* Small Thumbnail placeholder */}
                                                <div className="w-10 h-10 rounded bg-slate-200 dark:bg-slate-600 flex-shrink-0 relative overflow-hidden">
                                                    {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : null}
                                                </div>
                                                <span className="font-medium text-slate-900 dark:text-white">{product.designation}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                {product.gamme}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{product.caracteristiques?.rendement || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">{product.point_fidelite} pts</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/products/edit/${product._id}`} className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
