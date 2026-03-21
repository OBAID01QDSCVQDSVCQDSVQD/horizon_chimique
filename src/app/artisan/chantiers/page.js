'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Clock, CheckCircle, XCircle, Search, Calendar, Package, ChevronDown, ChevronUp, User, Phone, Ruler, Trophy, Megaphone, Plus, TrendingUp, Sparkles, LayoutDashboard, ClipboardList, AlertCircle, CalendarCheck, X, Send, Headphones } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';

export default function MyChantiersPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [chantiers, setChantiers] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    // Support Modal State
    const [supportType, setSupportType] = useState(null); // 'diagnostic', 'reclamation', 'rdv'
    const [supportForm, setSupportForm] = useState({ message: '', date: '' });
    const [sendingSupport, setSendingSupport] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resChantiers, resCampaigns] = await Promise.all([
                    fetch('/api/chantiers'),
                    fetch('/api/campaigns')
                ]);

                const dataChantiers = await resChantiers.json();
                const dataCampaigns = await resCampaigns.json();

                if (dataChantiers.success) setChantiers(dataChantiers.chantiers);
                if (dataCampaigns.success) setCampaigns(dataCampaigns.campaigns.filter(c => c.isActive));

            } catch (error) {
                console.error("Error loading data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleSupportSubmit = async (e) => {
        e.preventDefault();
        setSendingSupport(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500));
        toast.success("Votre demande a bien été envoyée !");
        setSendingSupport(false);
        setSupportType(null);
        setSupportForm({ message: '', date: '' });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={14} /> Validé</span>;
            case 'rejected':
                return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={14} /> Refusé</span>;
            default:
                return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={14} /> En attente</span>;
        }
    };

    const getValidUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    // Derived State for UI
    const totalPoints = chantiers.reduce((acc, c) => acc + (c.pointsEarned || 0), 0);
    const pendingCount = chantiers.filter(c => c.status === 'pending').length;

    // Filter Ads
    const leftAds = campaigns.filter(c => c.position === 'left');
    const rightAds = campaigns.filter(c => c.position === 'right');

    const AdCard = ({ title, content, color, icon: Icon = Megaphone, link, image }) => {
        const validLink = getValidUrl(link);
        let CardContent;

        if (image) {
            CardContent = (
                <div className="relative rounded-2xl overflow-hidden shadow-lg group transition-transform hover:scale-[1.02]">
                    <img src={image} alt={title} className="w-full h-auto block" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 flex flex-col justify-end">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md shrink-0">
                                <Icon size={16} className="text-white" />
                            </div>
                            <h3 className="font-bold text-white text-lg leading-tight shadow-black/50 drop-shadow-md">{title}</h3>
                        </div>
                        {content && <p className="text-sm text-slate-200 font-medium shadow-black/50 drop-shadow-sm">{content}</p>}
                        {validLink && (
                            <div className="mt-3 flex justify-end">
                                <span className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors backdrop-blur-md flex items-center gap-1 border border-white/10">
                                    En savoir plus <ArrowLeft className="rotate-180" size={12} />
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );
        } else {
            CardContent = (
                <div className={`p-5 rounded-2xl ${color} text-white shadow-lg transform transition-all hover:scale-105 cursor-pointer backdrop-blur-sm bg-opacity-90 min-w-[280px] h-full flex flex-col justify-between`}>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md shrink-0">
                                <Icon size={20} className="text-white" />
                            </div>
                            <h3 className="font-bold text-lg drop-shadow-md leading-tight">{title}</h3>
                        </div>
                        <p className="text-sm opacity-95 leading-relaxed font-medium drop-shadow-sm">{content}</p>
                    </div>
                    {validLink && (
                        <div className="relative z-10 mt-3 flex justify-end">
                            <span className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors backdrop-blur-md flex items-center gap-1">
                                En savoir plus <ArrowLeft className="rotate-180" size={12} />
                            </span>
                        </div>
                    )}
                </div>
            );
        }

        if (validLink) {
            return <a href={validLink} target="_blank" rel="noopener noreferrer" className="block focus:outline-none h-full">{CardContent}</a>;
        }
        return <div className="h-full">{CardContent}</div>;
    };

    return (
        <div className="min-h-screen bg-slate-50 relative pb-24 lg:pb-8 lg:py-12">

            {/* Mobile Header / Status Bar */}
            <div className="lg:hidden bg-white px-4 pt-6 pb-2 sticky top-0 z-40 border-b border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{session?.user?.companyName || session?.user?.name || 'Horizon'}</h1>
                        <p className="text-xs font-medium text-slate-500">Bienvenue sur votre espace</p>
                    </div>
                    <div className="bg-amber-50 rounded-full px-3 py-1.5 flex items-center gap-2 border border-amber-100">
                        <Trophy size={14} className="text-amber-600" />
                        <span className="font-bold text-amber-700 text-sm">{totalPoints} pts</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                    <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100 min-w-[100px]">
                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1">En attente</span>
                        <div className="flex items-center gap-1.5">
                            <Clock size={16} className="text-blue-500" />
                            <span className="text-lg font-black text-slate-800">{pendingCount}</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100 min-w-[100px]">
                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Validés</span>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle size={16} className="text-green-500" />
                            <span className="text-lg font-black text-slate-800">{chantiers.filter(c => c.status === 'approved').length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Support Actions */}


            <div className="max-w-7xl mx-auto lg:grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-8 items-start px-4 lg:px-6 pt-4 lg:pt-0">

                {/* Left Column Ads + SUPPORT */}
                <aside className="hidden lg:flex flex-col gap-6 sticky top-8 animate-in fade-in slide-in-from-left duration-700">



                    {/* Ads */}
                    {leftAds.map(ad => <AdCard key={ad._id} {...ad} icon={Package} />)}
                </aside>

                {/* Main Content */}
                <main className="space-y-6 min-w-0">

                    {/* Desktop Header */}
                    <div className="hidden lg:flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div>
                            <button onClick={() => router.back()} className="flex items-center text-slate-400 hover:text-primary mb-1 font-medium text-sm transition-colors">
                                <ArrowLeft size={16} className="mr-1" /> Retour
                            </button>
                            <h1 className="text-2xl font-bold text-slate-900">Mes Chantiers</h1>
                            <p className="text-sm text-slate-500">Suivez l'état de validation de vos déclarations.</p>
                        </div>
                        <Link href="/artisan/chantiers/new" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap">
                            <Plus size={20} /> Nouveau Chantier
                        </Link>
                    </div>

                    {/* Mobile Ads Carousel */}
                    {campaigns.length > 0 && (
                        <div className="lg:hidden mb-2">
                            <h3 className="font-bold text-slate-800 text-lg mb-3 px-1">À la une</h3>
                            <div className="flex gap-4 overflow-x-auto snap-x scrollbar-hide -mx-4 px-4 pb-4">
                                {campaigns.map(ad => (
                                    <div key={ad._id} className="snap-center shrink-0 w-[85vw] max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-auto">
                                        <div className="relative h-44 w-full bg-slate-100">
                                            {ad.image ? (
                                                <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className={`w-full h-full ${ad.color || 'bg-primary'} flex items-center justify-center text-white`}><Megaphone size={32} /></div>
                                            )}
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded shadow-sm text-slate-800 uppercase tracking-wide">Publicité</div>
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1 mb-1">{ad.title}</h3>
                                            <p className="text-sm text-slate-500 mb-3 line-clamp-2 leading-relaxed">{ad.content}</p>
                                            {getValidUrl(ad.link) ? (
                                                <a href={getValidUrl(ad.link)} target="_blank" rel="noopener noreferrer" className="mt-auto w-full py-2.5 bg-slate-50 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border border-slate-200">
                                                    En savoir plus <ArrowLeft className="rotate-180" size={14} />
                                                </a>
                                            ) : <div className="h-4"></div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chantiers List */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
                        ) : chantiers.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <Package size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun chantier</h3>
                                <p className="text-slate-500 mb-6">Commencez dès maintenant !</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {chantiers.map((chantier) => (
                                    <div key={chantier._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                                        <div onClick={() => toggleExpand(chantier._id)} className="p-4 sm:p-5 cursor-pointer select-none">
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                                                    <img src={chantier.invoiceImage} alt="Facture" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate">{chantier.clientName}</h3>
                                                        <div className="shrink-0">{getStatusBadge(chantier.status)}</div>
                                                    </div>
                                                    <div className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(chantier.createdAt).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-1"><Package size={12} /> {chantier.products?.length || 0} produit(s)</span>
                                                    </div>
                                                    {chantier.status === 'approved' && (
                                                        <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded w-fit mt-1">
                                                            +{chantier.pointsEarned} Points
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-slate-300 self-center">
                                                    {expandedId === chantier._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Expanded details */}
                                        {expandedId === chantier._id && (
                                            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Détails</h4>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div><span className="text-slate-500 text-xs block">Surface</span> <span className="font-bold text-slate-800">{chantier.surface_sol || 0} m²</span></div>
                                                            <div><span className="text-slate-500 text-xs block">Support</span> <span className="font-bold text-slate-800">{chantier.support_type || '-'}</span></div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Produits</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {chantier.products?.map((p, i) => (
                                                                <span key={i} className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{p.quantity}x {p.designation}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                {/* Right Column Ads (Desktop Sticky) */}
                <aside className="hidden lg:flex flex-col gap-6 sticky top-8 animate-in fade-in slide-in-from-right duration-700">
                    {rightAds.map(ad => <AdCard key={ad._id} {...ad} icon={Trophy} />)}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600"></div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Trophy size={20} /></div>
                            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">Niveau Argent</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg mb-1">Objectif Or 🏆</h4>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3 mt-4">
                            <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-full w-3/4 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-slate-400">
                            <span>{totalPoints} pts</span>
                            <span>5000 pts</span>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Mobile Floating Action Button (FAB) */}
            <Link href="/artisan/chantiers/new" className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/30 z-50 flex items-center justify-center active:scale-90 transition-transform hover:scale-105 border-4 border-slate-50">
                <Plus size={28} />
                <span className="sr-only">Nouveau Chantier</span>
            </Link>

            {/* SUPPORT MODAL */}
            {supportType && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                {supportType === 'diagnostic' && <ClipboardList className="text-blue-600" size={20} />}
                                {supportType === 'reclamation' && <AlertCircle className="text-red-500" size={20} />}
                                {supportType === 'rdv' && <CalendarCheck className="text-green-600" size={20} />}
                                {supportType === 'diagnostic' ? 'Diagnostic Technique' : supportType === 'reclamation' ? 'Réclamation' : 'Prendre Rendez-vous'}
                            </h3>
                            <button onClick={() => setSupportType(null)} className="p-1 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSupportSubmit} className="p-6 space-y-4">
                            <p className="text-sm text-slate-500 mb-2">
                                {supportType === 'diagnostic' ? 'Expliquez-nous votre problème technique. Vous pouvez aussi demander une visite.' :
                                    supportType === 'reclamation' ? 'Dites-nous ce qui n’a pas fonctionné. Nous ferons notre possible pour résoudre le souci.' :
                                        'Choisissez le moment qui vous convient, nous vous confirmerons par téléphone.'}
                            </p>

                            {supportType === 'rdv' && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Date souhaitée</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                        value={supportForm.date}
                                        onChange={e => setSupportForm({ ...supportForm, date: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder={supportType === 'rdv' ? "Précisez l'objet du rendez-vous..." : "Décrivez votre demande..."}
                                    value={supportForm.message}
                                    onChange={e => setSupportForm({ ...supportForm, message: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={sendingSupport}
                                    className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 
                                        ${sendingSupport ? 'bg-slate-400 cursor-not-allowed' :
                                            supportType === 'reclamation' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' :
                                                supportType === 'rdv' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' :
                                                    'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                                >
                                    {sendingSupport ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                    {sendingSupport ? 'Envoi...' : 'Envoyer la demande'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
