'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Loader2, Lightbulb, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SolutionsAdminPage() {
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSolutions();
    }, []);

    const fetchSolutions = async () => {
        try {
            const res = await fetch('/api/solutions');
            const data = await res.json();
            if (data.success) {
                setSolutions(data.data);
            }
        } catch (error) {
            console.error('Error fetching solutions:', error);
            toast.error('Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette solution ?')) return;
        try {
            const res = await fetch(`/api/solutions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Solution supprimée');
                fetchSolutions();
            } else {
                toast.error('Erreur lors de la suppression');
            }
        } catch (error) {
            toast.error('Erreur système');
        }
    };

    const stripHtml = (html) => {
        if (typeof window === 'undefined') return ''; // Server side safety, though this is client component
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Lightbulb className="text-primary" />
                    Gestion des Solutions
                </h1>
                <Link href="/admin/solutions/new" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all">
                    <Plus size={18} /> Nouvelle Solution
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="text-left py-4 px-6 font-bold text-slate-600 dark:text-slate-300">Titre</th>
                            <th className="text-left py-4 px-6 font-bold text-slate-600 dark:text-slate-300 hidden md:table-cell">Description</th>
                            <th className="text-center py-4 px-6 font-bold text-slate-600 dark:text-slate-300">Icône / Couleur</th>
                            <th className="text-right py-4 px-6 font-bold text-slate-600 dark:text-slate-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {solutions.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-slate-500 dark:text-slate-400">Aucune solution trouvée.</td>
                            </tr>
                        ) : (
                            solutions.map((sol) => (
                                <tr key={sol._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-100">{sol.title}</td>
                                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-sm hidden md:table-cell max-w-md truncate">
                                        {stripHtml(sol.description)}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`inline-block w-8 h-8 rounded-full ${sol.color} shadow-sm border border-white dark:border-slate-600`}></span>
                                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sol.icon}</div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/solutions`} target="_blank" className="p-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" title="Voir sur le site">
                                                <Eye size={16} />
                                            </Link>
                                            <Link href={`/admin/solutions/${sol._id}`} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors" title="Modifier">
                                                <Edit size={16} />
                                            </Link>
                                            <button onClick={() => handleDelete(sol._id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" title="Supprimer">
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
    );
}
