'use client';
import { useState, useEffect } from 'react';
import { Check, X, Star, MessageSquare, User, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ModerationPage() {
    const [activeTab, setActiveTab] = useState('comments');
    const [data, setData] = useState({ comments: [], reviews: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/admin/moderation');
            const json = await res.json();
            if (json.success) setData(json);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (type, id, action) => {
        const toastId = toast.loading("Traitement...");
        try {
            const res = await fetch('/api/admin/moderation', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id, action })
            });
            const json = await res.json();

            if (json.success) {
                toast.success(action === 'approve' ? "Approuvé !" : "Supprimé !", { id: toastId });
                // Optimistic Remove
                setData(prev => ({
                    ...prev,
                    [type === 'comment' ? 'comments' : 'reviews']: prev[type === 'comment' ? 'comments' : 'reviews'].filter(item => item._id !== id)
                }));
            } else {
                toast.error(json.error, { id: toastId });
            }
        } catch (error) {
            toast.error("Erreur", { id: toastId });
        }
    };

    if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin text-primary" size={32} /></div>;

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <ShieldCheck size={28} className="text-primary" />
                <h1 className="text-2xl font-bold text-slate-800">Modération du contenu</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('comments')}
                    className={`pb-4 px-4 font-bold text-sm transition-colors relative ${activeTab === 'comments' ? 'text-primary' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Commentaires
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${data.comments.length > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{data.comments.length}</span>
                    {activeTab === 'comments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-4 px-4 font-bold text-sm transition-colors relative ${activeTab === 'reviews' ? 'text-primary' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Avis Artisans
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${data.reviews.length > 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{data.reviews.length}</span>
                    {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
            </div>

            {/* Comments List */}
            {activeTab === 'comments' && (
                <div className="grid gap-4">
                    {data.comments.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                            <p className="text-slate-500 italic">Aucun commentaire en attente.</p>
                        </div>
                    ) : (
                        data.comments.map(comment => (
                            <div key={comment._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="font-bold text-slate-900 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">
                                                <User size={14} />
                                            </div>
                                            {comment.user?.name || 'Utilisateur inconnu'}
                                        </div>
                                        <span className="text-slate-300 text-xs">•</span>
                                        <span className="text-slate-400 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3 leading-relaxed">{comment.content}</p>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <MessageSquare size={12} /> Sur le projet: <span className="font-bold text-slate-700">{comment.realization?.title || 'Projet supprimé'}</span>
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                    <button onClick={() => handleAction('comment', comment._id, 'approve')} className="w-full md:w-auto p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2 text-sm font-bold px-4" title="Approuver">
                                        <Check size={18} /> <span className="md:hidden">Approuver</span>
                                    </button>
                                    <button onClick={() => handleAction('comment', comment._id, 'reject')} className="w-full md:w-auto p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-sm font-bold px-4" title="Supprimer">
                                        <X size={18} /> <span className="md:hidden">Supprimer</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Reviews List */}
            {activeTab === 'reviews' && (
                <div className="grid gap-4">
                    {data.reviews.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                            <p className="text-slate-500 italic">Aucun avis en attente.</p>
                        </div>
                    ) : (
                        data.reviews.map(review => (
                            <div key={review._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">{review.user?.name || 'Inconnu'}</span>
                                            <span className="text-slate-400 text-xs">a noté l'artisan</span>
                                            <span className="font-bold text-primary">{review.artisan?.companyName || review.artisan?.name}</span>
                                        </div>
                                        <div className="flex text-amber-400 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-amber-400" : "text-amber-200"} />)}
                                        </div>
                                    </div>
                                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2 italic text-sm md:text-base">"{review.comment}"</p>
                                    <div className="mt-2 text-xs text-slate-400">
                                        Posté le {new Date(review.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                                    <button onClick={() => handleAction('review', review._id, 'approve')} className="w-full md:w-auto p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2 text-sm font-bold px-4" title="Approuver">
                                        <Check size={18} /> <span className="md:hidden">Approuver</span>
                                    </button>
                                    <button onClick={() => handleAction('review', review._id, 'reject')} className="w-full md:w-auto p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-sm font-bold px-4" title="Supprimer">
                                        <X size={18} /> <span className="md:hidden">Supprimer</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
