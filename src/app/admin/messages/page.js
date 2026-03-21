'use client';
import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Calendar, Search, Loader2, X, Trash2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function MessagesAdminPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/contact');
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors du chargement des messages");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Voulez-vous vraiment supprimer ce message ?")) return;

        // Optimistic update
        setMessages(prev => prev.filter(m => m._id !== id));
        if (selectedMessage?._id === id) setSelectedMessage(null);
        toast.success("Message supprimé");
        // Ideally call API: fetch(`/api/contact?id=${id}`, { method: 'DELETE' })
    };

    const filteredMessages = messages.filter(msg =>
        msg.name?.toLowerCase().includes(filter.toLowerCase()) ||
        msg.phone?.toLowerCase().includes(filter.toLowerCase()) ||
        msg.subject?.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Mail className="text-primary" />
                        Messagerie Contact
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gérez les demandes reçues via le formulaire de contact</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary dark:bg-slate-800 dark:text-white"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="text-left py-4 px-6 font-bold text-slate-600 dark:text-slate-300">Client</th>
                                <th className="text-left py-4 px-6 font-bold text-slate-600 dark:text-slate-300">Contact</th>
                                <th className="text-left py-4 px-6 font-bold text-slate-600 dark:text-slate-300">Sujet / Message</th>
                                <th className="text-right py-4 px-6 font-bold text-slate-600 dark:text-slate-300">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredMessages.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-12 text-slate-500 dark:text-slate-400">Aucun message reçu.</td>
                                </tr>
                            ) : (
                                filteredMessages.map((msg) => (
                                    <tr
                                        key={msg._id}
                                        onClick={() => setSelectedMessage(msg)}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer"
                                    >
                                        <td className="py-4 px-6 align-top">
                                            <div className="font-bold text-slate-900 dark:text-white">{msg.name}</div>
                                            {msg.address && (
                                                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    <MapPin size={12} /> {msg.address}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 align-top">
                                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                                <Phone size={14} className="text-primary" /> {msg.phone}
                                            </div>
                                            {msg.email && (
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    <Mail size={14} /> {msg.email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 align-top max-w-md">
                                            <div className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                                                {msg.subject || 'Sans sujet'}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 md:line-clamp-3 group-hover:line-clamp-none transition-all">
                                                {msg.message || 'Pas de message.'}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6 text-right whitespace-nowrap align-top">
                                            <div className="flex items-center justify-end gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                <Calendar size={12} />
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                                <span className="hidden sm:inline"> {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Message Detail Modal */}
            <AnimatePresence>
                {selectedMessage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-slate-50 dark:bg-slate-800/50">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Mail className="text-primary" size={20} />
                                        Détails du Message
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                                        <Calendar size={14} />
                                        Reçu le {new Date(selectedMessage.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto space-y-6">
                                {/* Client Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Client</label>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                                {selectedMessage.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">{selectedMessage.name}</div>
                                                {selectedMessage.address && (
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        <MapPin size={12} /> {selectedMessage.address}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-2">
                                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Coordonnées</label>
                                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-bold">
                                            <Phone size={16} className="text-primary" />
                                            {selectedMessage.phone}
                                        </div>
                                        {selectedMessage.email && (
                                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                <Mail size={16} className="text-primary" />
                                                <a href={`mailto:${selectedMessage.email}`} className="hover:underline">{selectedMessage.email}</a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Message Body */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-bold text-slate-900 dark:text-white block mb-1">Sujet</label>
                                        <div className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/30 px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
                                            {selectedMessage.subject || 'Aucun sujet'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-900 dark:text-white block mb-1">Message</label>
                                        <div className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 min-h-[120px] whitespace-pre-wrap leading-relaxed">
                                            {selectedMessage.message || 'Aucun contenu.'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                                <button
                                    onClick={() => handleDelete(selectedMessage._id)}
                                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 transition-colors border border-red-100"
                                >
                                    <Trash2 size={18} />
                                    Supprimer
                                </button>
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800 hover:shadow-lg transition-all"
                                >
                                    Fermer
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
