'use client';
import { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function ReviewSection({ artisanId, showList = true, title = "Avis Clients" }) {
    const { data: session } = useSession();
    const [reviews, setReviews] = useState([]);
    const [average, setAverage] = useState(0);
    const [total, setTotal] = useState(0);

    // Form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [userReview, setUserReview] = useState(null);

    useEffect(() => {
        if (artisanId) fetchReviews();
    }, [artisanId]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?artisanId=${artisanId}`);
            const data = await res.json();
            if (data.success) {
                setReviews(data.data);
                setAverage(data.average);
                setTotal(data.total);
                if (data.userReview) {
                    setUserReview(data.userReview);
                    setRating(data.userReview.rating);
                    setComment(data.userReview.comment);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    // ... submit logic is same (POST handles update) ...

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!session) return toast.error("Connectez-vous pour donner votre avis");

        setLoading(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artisanId, rating, comment })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                setShowForm(false);
                fetchReviews(); // Refresh to update userReview status
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Erreur d'envoi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-yellow-500">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size={16} fill={star <= Math.round(average) ? "currentColor" : "none"} />
                            ))}
                        </div>
                        <span className="text-slate-600 font-bold text-sm">{average} <span className="text-slate-400 font-normal">({total} avis)</span></span>
                    </div>
                </div>

                {session && session.user.id !== artisanId && (
                    <div className="flex flex-col items-end gap-2">
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="text-primary font-bold text-sm hover:underline"
                        >
                            {showForm ? 'Annuler' : (userReview ? 'Modifier mon avis' : 'Donner mon avis')}
                        </button>
                        {userReview && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${userReview.status === 'approved' ? 'bg-green-100 text-green-700' :
                                userReview.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                {userReview.status === 'approved' ? 'Publié' :
                                    userReview.status === 'rejected' ? 'Rejeté' : 'En attente'}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Review Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
                    <h4 className="font-bold text-slate-800 mb-4">Votre avis compte</h4>

                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Note globale</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-500' : 'text-slate-300'}`}
                                >
                                    <Star size={24} fill="currentColor" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Votre message</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Partagez votre expérience avec cet artisan..."
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:outline-none resize-none text-sm"
                            rows={3}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading ? 'Envoi...' : <>Envoyer mon avis <Send size={16} /></>}
                    </button>
                </form>
            )}

            {/* Reviews List */}
            {showList && (
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <p className="text-slate-500 italic text-center py-4">Aucun avis pour le moment.</p>
                    ) : (
                        reviews.map(review => (
                            <div key={review._id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                            {review.user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-slate-900 text-sm">{review.user?.name}</span>
                                    </div>
                                    <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex text-yellow-500 mb-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} size={12} fill={star <= review.rating ? "currentColor" : "none"} />
                                    ))}
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
