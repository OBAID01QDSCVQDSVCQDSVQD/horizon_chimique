'use client';

import { useState, useEffect } from 'react';
import { Loader2, Calendar, MapPin, Phone, User, Clock, CheckCircle, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'diagnostic', 'reclamation', 'rdv'

    // Lightbox State: { open: boolean, images: array, index: number }
    const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

    useEffect(() => {
        fetch('/api/requests')
            .then(res => res.json())
            .then(data => {
                if (data.success) setRequests(data.requests);
            })
            .finally(() => setLoading(false));
    }, []);

    const openLightbox = (images, index) => {
        setLightbox({ open: true, images, index });
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setLightbox(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length }));
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setLightbox(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length }));
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'diagnostic': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">Diagnostic</span>;
            case 'reclamation': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">Réclamation</span>;
            case 'rdv': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">Rendez-vous</span>;
            default: return type;
        }
    };

    const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.type === filter);

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></div>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Demandes Clients</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1 overflow-x-auto">
                {['all', 'diagnostic', 'reclamation', 'rdv'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors relative top-px border-b-2 whitespace-nowrap 
                            ${filter === type ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                        {type === 'all' ? 'Toutes' :
                            type === 'diagnostic' ? 'Diagnostic' :
                                type === 'reclamation' ? 'Réclamations' : 'Rendez-vous'}
                        <span className="ml-2 text-xs opacity-60 bg-slate-200 px-1.5 rounded-full">
                            {type === 'all' ? requests.length : requests.filter(r => r.type === type).length}
                        </span>
                    </button>
                ))}
            </div>

            <div className="grid gap-6">
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-500">
                        Aucune demande trouvée pour ce filtre.
                    </div>
                ) : (
                    filteredRequests.map(req => (
                        <div key={req._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    {getTypeLabel(req.type)}
                                    <span className="text-sm text-slate-400">{new Date(req.createdAt).toLocaleString()}</span>
                                </div>
                                <span className="text-xs font-mono text-slate-300">ID: {req._id.slice(-6)}</span>
                            </div>

                            <p className="text-slate-800 font-medium mb-4 whitespace-pre-wrap">{req.message}</p>

                            <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                                {/* Details */}
                                {req.surface && (
                                    <div><span className="font-bold">Surface:</span> {req.surface} m²</div>
                                )}
                                {req.phone && (
                                    <div className="flex items-center gap-2"><Phone size={16} /> <a href={`https://wa.me/${req.phone}`} target="_blank" className="text-blue-600 hover:underline">{req.phone}</a></div>
                                )}
                                {req.location && (
                                    <div className="col-span-2 flex items-start gap-2">
                                        <MapPin size={16} className="mt-0.5 shrink-0" />
                                        <div>
                                            <div className="font-bold text-slate-700">
                                                {req.type === 'diagnostic' ? 'Lieu du chantier' : req.type === 'reclamation' ? 'Lieu du problème' : 'Lieu du rendez-vous'}
                                            </div>
                                            <div className="text-xs break-all">{req.location.address || 'Adresse non trouvée'}</div>
                                            {req.location.lat === 0 && req.location.lng === 0 ? (
                                                <a href={req.location.address} target="_blank" className="text-blue-500 text-xs hover:underline">Ouvrir le lien</a>
                                            ) : (
                                                <a href={`https://www.google.com/maps?q=${req.location.lat},${req.location.lng}`} target="_blank" className="text-blue-500 text-xs hover:underline">Voir sur Google Maps</a>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {req.date && !req.times && (
                                    <div className="flex items-center gap-2"><Calendar size={16} /> Date souhaitée: {new Date(req.date).toLocaleDateString()}</div>
                                )}
                                {req.times && req.times.length > 0 && (
                                    <div className="col-span-2">
                                        <span className="font-bold flex items-center gap-2 mb-1"><Clock size={16} /> Disponibilités:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {req.times.map((t, idx) => (
                                                <span key={idx} className="bg-white border px-2 py-1 rounded text-xs">{new Date(t).toLocaleString()}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {req.images && req.images.length > 0 && (
                                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                    {req.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => openLightbox(req.images, idx)}
                                            className="relative group border rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary w-20 h-20 shrink-0"
                                        >
                                            <img src={img} className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <Maximize2 size={16} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Enhanced Lightbox Modal */}
            {lightbox.open && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setLightbox(prev => ({ ...prev, open: false }))}
                >
                    <button
                        onClick={() => setLightbox(prev => ({ ...prev, open: false }))}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors z-[60]"
                    >
                        <X size={32} />
                    </button>

                    {/* Navigation Buttons */}
                    {lightbox.images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors z-[60]"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors z-[60]"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}

                    <div className="relative max-w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={lightbox.images[lightbox.index]}
                            alt="Zoom"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        />
                        <div className="text-white/80 mt-4 text-sm font-medium">
                            {lightbox.index + 1} / {lightbox.images.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
