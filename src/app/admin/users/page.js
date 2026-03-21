'use client';

import { useState, useEffect } from 'react';
import { Check, X, Shield, User, Loader2, Hammer, ShieldCheck, UserCog, Trash2, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';

export default function AdminUsersPage() {
    const [loading, setLoading] = useState(true);
    const [pendingArtisans, setPendingArtisans] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [impersonating, setImpersonating] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users', { cache: 'no-store' });
            if (!res.ok) throw new Error("Erreur HTTP " + res.status);

            const data = await res.json();
            if (data.success) {
                setPendingArtisans(data.pending);
                setAllUsers(data.all);
            } else {
                toast.error("Erreur chargement données");
            }
        } catch (error) {
            console.error("Fetch Users Error:", error);
            toast.error("Impossible de charger les utilisateurs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateStatus = async (userId, status) => {
        const toastId = toast.loading("Mise à jour...");
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, status })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Utilisateur ${status === 'approved' ? 'validé' : 'rejeté'}`, { id: toastId });
                fetchUsers();
            } else {
                toast.error("Erreur", { id: toastId });
            }
        } catch (error) {
            toast.error("Erreur technique", { id: toastId });
        }
    };

    const updateRole = async (userId, role) => {
        if (!confirm(`Êtes-vous sûr de vouloir changer le rôle en "${role}" ?`)) return;
        const toastId = toast.loading("Modification du rôle...");
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Rôle mis à jour !", { id: toastId });
                fetchUsers(); // Refresh list
            } else {
                toast.error("Erreur mise à jour", { id: toastId });
            }
        } catch (error) {
            toast.error("Erreur connexion", { id: toastId });
        }
    };

    const updateRank = async (userId, fidelityRank) => {
        const toastId = toast.loading("Mise à jour du rang...");
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, fidelityRank })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Rang mis à jour !", { id: toastId });
                fetchUsers();
            } else {
                toast.error("Erreur", { id: toastId });
            }
        } catch (error) {
            toast.error("Erreur technique", { id: toastId });
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm("⚠️ ATTENTION : Cette action est irréversible !\n\nVoulez-vous vraiment supprimer cet utilisateur et toutes ses données ?")) return;

        const toastId = toast.loading("Suppression en cours...");
        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Utilisateur supprimé définitivement.", { id: toastId });
                fetchUsers();
            } else {
                toast.error("Erreur lors de la suppression.", { id: toastId });
            }
        } catch (error) {
            toast.error("Erreur réseau.", { id: toastId });
        }
    };

    const updateParent = async (userId, parentGoldArtisan) => {
        const toastId = toast.loading("Mise à jour du rattachement...");
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, parentGoldArtisan: parentGoldArtisan || null })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Rattachement mis à jour !", { id: toastId });
                fetchUsers();
            } else {
                toast.error("Erreur", { id: toastId });
            }
        } catch (error) {
            toast.error("Erreur technique", { id: toastId });
        }
    };

    const handleImpersonate = async (user) => {
        if (!confirm(`Se connecter en tant que "${user.name}" ?\n\nVous serez déconnecté de votre compte administrateur.`)) return;

        setImpersonating(true);
        const toastId = toast.loading("Connexion au compte...");

        try {
            // 1. Request Impersonation Token
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id })
            });
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || "Erreur lors de la demande");
            }

            // 2. Sign In using the token
            const result = await signIn('credentials', {
                redirect: false,
                identifier: data.identifier,
                password: `IMPERSONATE:${data.token}`
            });

            if (result?.error) {
                throw new Error("Échec de l'authentification");
            }

            toast.success("Connexion réussie ! Redirection...", { id: toastId });
            window.location.href = '/'; // Force reload to ensure session is picked up

        } catch (error) {
            console.error(error);
            toast.error(error.message || "Impossible de se connecter", { id: toastId });
            setImpersonating(false);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">Gestion des Utilisateurs</h1>

            {/* Pending Validations */}
            {pendingArtisans.length > 0 && (
                <div className="mb-10 animate-in slide-in-from-top-4">
                    <h2 className="text-lg font-bold text-orange-600 mb-4 flex items-center gap-2">
                        <Shield className="fill-orange-100" />
                        Artisans en attente de validation ({pendingArtisans.length})
                    </h2>
                    <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-xl shadow-sm border border-orange-100 overflow-hidden">
                        {pendingArtisans.map(user => (
                            <div key={user._id} className="p-4 border-b last:border-0 border-slate-100 dark:border-slate-700 flex items-center justify-between hover:bg-orange-50/30 dark:hover:bg-slate-700/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300">
                                        <Hammer size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email || user.phone}</p>
                                        <span className="text-xs font-bold text-primary bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mt-1 inline-block">
                                            {user.specialty || 'Artisan'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => updateStatus(user._id, 'rejected')}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Rejeter"
                                    >
                                        <X size={20} />
                                    </button>
                                    <button
                                        onClick={() => updateStatus(user._id, 'approved')}
                                        className="py-2 px-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors flex items-center gap-2 shadow-sm shadow-green-200 dark:shadow-none"
                                    >
                                        <Check size={18} /> Valider
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Users List */}
            <div>
                <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <UserCog size={20} />
                    Tous les utilisateurs
                </h2>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left bg-white dark:bg-slate-800 text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="p-4 font-semibold">Utilisateur</th>
                                    <th className="p-4 font-semibold">Rôle</th>
                                    <th className="p-4 font-semibold text-center">Rang (Artisan)</th>
                                    <th className="p-4 font-semibold">Rattachement (Or)</th>
                                    <th className="p-4 font-semibold">Statut</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {allUsers
                                    .filter(u => !['obaid@horizon-chimique.tn', 'admin@admin.com'].includes(u.email)) // Hide Super Admin
                                    .map(user => (
                                        <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{user.email || user.phone}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="relative inline-block w-32">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => updateRole(user._id, e.target.value)}
                                                        disabled={user.role === 'admin' && user.email === 'admin@admin.com'} // Prevent blocking main admin
                                                        className={`appearance-none w-full px-3 py-1.5 pr-8 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all
                                                        ${user.role === 'admin' ? 'text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30' :
                                                                user.role === 'artisan' ? 'text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30' :
                                                                    'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700'}`}
                                                    >
                                                        <option value="user">👤 Utilisateur</option>
                                                        <option value="artisan">🛠️ Artisan</option>
                                                        <option value="admin">🛡️ Admin</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {user.role === 'artisan' && (
                                                    <div className="relative inline-block w-28">
                                                        <select
                                                            value={user.fidelityRank || 'bronze'}
                                                            onChange={(e) => updateRank(user._id, e.target.value)}
                                                            className={`appearance-none w-full px-2 py-1.5 pr-8 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all
                                                            ${user.fidelityRank === 'gold' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                                                    user.fidelityRank === 'silver' ? 'text-slate-700 bg-slate-50 border-slate-200' :
                                                                        'text-orange-700 bg-orange-50 border-orange-200'}`}
                                                        >
                                                            <option value="bronze">🥉 Bronze</option>
                                                            <option value="silver">🥈 Silver</option>
                                                            <option value="gold">🥇 Gold</option>
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-slate-400">
                                                            <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {user.role === 'artisan' && user.fidelityRank !== 'gold' && (
                                                    <div className="relative inline-block w-48">
                                                        <select
                                                            value={user.parentGoldArtisan || ''}
                                                            onChange={(e) => updateParent(user._id, e.target.value)}
                                                            className="appearance-none w-full px-2 py-1.5 pr-8 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                        >
                                                            <option value="">Aucun (Indépendant)</option>
                                                            {allUsers
                                                                .filter(u => u.role === 'artisan' && u.fidelityRank === 'gold' && u._id !== user._id)
                                                                .map(gold => (
                                                                    <option key={gold._id} value={gold._id}>
                                                                        👑 {gold.companyName || gold.name}
                                                                    </option>
                                                                ))
                                                            }
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold 
                                                ${user.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                                        user.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                                            'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'}`}>
                                                    {user.status === 'approved' ? '✅ Actif' : (user.status === 'pending' ? '⏳ En attente' : '❌ Rejeté')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-500 dark:text-slate-400 tabular-nums">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleImpersonate(user)}
                                                        disabled={impersonating}
                                                        className="p-2 text-slate-400 hover:text-primary dark:hover:text-primary-light hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                        title="Se connecter en tant que..."
                                                    >
                                                        <LogIn size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => deleteUser(user._id)}
                                                        className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                        title="Supprimer définitivement"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
