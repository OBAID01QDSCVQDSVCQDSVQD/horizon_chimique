'use client';
import toast from 'react-hot-toast';

export default function ShareButton({ url }) {
    const handleShare = () => {
        navigator.clipboard.writeText(url);
        toast.success("Lien copié !");
    };

    return (
        <button 
            onClick={handleShare}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontWeight: 600, fontSize: 13, color: '#65676b', borderRadius: 4, width: '100%' }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            <span style={{ fontSize: 12 }}>Partager</span>
        </button>
    );
}
