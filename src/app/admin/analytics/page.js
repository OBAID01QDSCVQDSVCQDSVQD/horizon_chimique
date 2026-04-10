'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Eye, 
    Globe, 
    Clock, 
    TrendingUp, 
    TrendingDown, 
    BarChart3, 
    MousePointer2,
    Calendar,
    RefreshCw,
    MapPin,
    ArrowUpRight,
    Search
} from 'lucide-react';

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/analytics/stats');
            const result = await res.json();
            if (result.success) {
                setStats(result.data);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) return <LoadingSkeleton />;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    const { visitors, topCountries, topPages, activity24h, totalPageViews } = stats;

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <BarChart3 className="text-primary" size={32} />
                        Analytiques & Audience
                    </h1>
                    <p className="text-slate-500 mt-1">Surveillance en temps réel de l'activité du site.</p>
                </div>
                <button 
                    onClick={fetchStats}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all font-bold text-sm"
                >
                    <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
                    Actualiser
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Visiteurs (Aujourd'hui)" 
                    value={visitors.today} 
                    icon={<Users className="text-blue-500" />} 
                    trend={((visitors.today - visitors.yesterday) / (visitors.yesterday || 1) * 100).toFixed(1)}
                />
                <StatCard 
                    title="Visiteurs (Hier)" 
                    value={visitors.yesterday} 
                    icon={<Calendar className="text-purple-500" />} 
                />
                <StatCard 
                    title="Total des Pages Vues" 
                    value={totalPageViews} 
                    icon={<Eye className="text-emerald-500" />} 
                />
                <StatCard 
                    title="Visiteurs Uniques" 
                    value={visitors.total} 
                    icon={<Globe className="text-orange-500" />} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Chart (Custom) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary" />
                            Activité des dernières 24h
                        </h3>
                    </div>
                    <div className="h-64 flex items-end gap-1 px-2">
                        {activity24h && activity24h.length > 0 ? (
                            activity24h.map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.min(100, (h.count / (Math.max(...activity24h.map(x => x.count)) || 1)) * 100)}%` }}
                                    className="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-sm relative group"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {h.count} vues @ {h._id.hour}h
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">Pas assez de données</div>
                        )}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-mono">
                        <span>Il y a 24h</span>
                        <span>Maintenant</span>
                    </div>
                </div>

                {/* Top Countries */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                    <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2 mb-6">
                        <MapPin size={20} className="text-orange-500" />
                        Top Pays
                    </h3>
                    <div className="space-y-4">
                        {topCountries.map((c, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{c._id}</span>
                                    <span className="text-slate-500">{c.count}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(c.count / topCountries[0].count) * 100}%` }}
                                        className="bg-orange-500 h-full rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Pages Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 text-black">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <MousePointer2 size={20} className="text-emerald-500" />
                        Contenu le plus visionné
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">Page URL</th>
                                <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">Vues</th>
                                <th className="px-6 py-4 text-xs font-black uppercase text-slate-500">Intérêt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {topPages.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-primary truncate max-w-md">{p._id}</td>
                                    <td className="px-6 py-4 font-black">{p.count}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                                <div 
                                                    className="bg-emerald-500 h-full rounded-full"
                                                    style={{ width: `${(p.count / topPages[0].count) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold">{Math.round((p.count / totalPageViews) * 100)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend }) {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">{icon}</div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trend > 0 ? <ArrowUpRight size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</h4>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
        </motion.div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-8 animate-pulse p-8">
            <div className="h-12 w-1/3 bg-slate-200 rounded-xl"></div>
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>)}
            </div>
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 h-80 bg-slate-200 rounded-3xl"></div>
                <div className="h-80 bg-slate-200 rounded-3xl"></div>
            </div>
        </div>
    );
}
