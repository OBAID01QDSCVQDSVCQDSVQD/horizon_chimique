'use client';
import { useState, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

export default function CommentSection({ realizationId }) {
    const { data: session } = useSession();
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (realizationId) fetchComments();
    }, [realizationId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?realizationId=${realizationId}`);
            const data = await res.json();
            if (data.success) setComments(data.data);
        } catch (error) {
            console.error("Failed to load comments", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!session) return toast.error("Connectez-vous pour commenter");
        if (!content.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ realizationId, content })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                setContent('');
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur d'envoi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mt-12">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Commentaires
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-sm">{comments.length}</span>
            </h3>

            {/* List */}
            <div className="space-y-6 mb-8">
                {comments.length === 0 ? (
                    <p className="text-slate-500 italic text-center py-4">Soyez le premier à commenter !</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment._id} className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                                {comment.user?.image ? (
                                    <img src={comment.user.image} alt={comment.user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-slate-500 text-sm">{comment.user?.name?.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-sm">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-slate-900 text-sm">{comment.user?.name || 'Utilisateur'}</span>
                                        <span className="text-[10px] text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Form */}
            {session ? (
                <form onSubmit={handleSubmit} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                        <span className="font-bold text-primary text-sm">{session.user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 relative">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Écrivez votre commentaire..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pr-12 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none resize-none text-sm transition-all"
                            rows={2}
                        />
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="absolute bottom-3 right-3 p-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-slate-50 p-4 rounded-xl text-center text-sm text-slate-500 border border-slate-100">
                    <a href="/login" className="text-primary font-bold hover:underline">Connectez-vous</a> pour participer à la discussion.
                </div>
            )}
        </div>
    );
}
