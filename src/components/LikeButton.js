'use client';
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { trackFbEvent } from '@/utils/trackFbEvent';

export default function LikeButton({ realizationId, initialLikes = [], initialIsLiked = false }) {
    const count = Array.isArray(initialLikes) ? initialLikes.length : (initialLikes || 0);

    const [likes, setLikes] = useState(count);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();

    const handleLike = async () => {
        if (!session) {
            toast.error("Veuillez vous connecter pour aimer");
            return;
        }
        if (loading) return;
        setLoading(true);

        // Optimistic UI
        const prevLikes = likes;
        const prevIsLiked = isLiked;

        setIsLiked(!prevIsLiked);
        setLikes(prev => prevIsLiked ? prev - 1 : prev + 1);

        try {
            const res = await fetch(`/api/realisations/${realizationId}/like`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setLikes(data.likesCount);
                setIsLiked(data.isLiked);
                if (data.isLiked) {
                    trackFbEvent('AddToWishlist', {
                        content_ids: [realizationId],
                        content_type: 'realization'
                    });
                }
            } else {
                setLikes(prevLikes);
                setIsLiked(prevIsLiked);
                toast.error(data.error);
            }
        } catch (error) {
            setLikes(prevLikes);
            setIsLiked(prevIsLiked);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${isLiked ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-100'}`}
        >
            <Heart size={20} className={isLiked ? "fill-current" : ""} />
            <span className="font-bold">{likes}</span>
        </button>
    );
}
