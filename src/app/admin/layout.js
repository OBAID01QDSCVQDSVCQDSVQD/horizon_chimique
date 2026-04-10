export const dynamic = 'force-dynamic';

import Link from 'next/link'; // Still used for NavItem if unrelated to Header
import { Toaster } from 'react-hot-toast';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Chantier from '@/models/Chantier';
import Contact from '@/models/Contact';
import Comment from '@/models/Comment';
import Review from '@/models/Review';
import Request from '@/models/Request';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';
import AdminHeader from '../../components/admin/AdminHeader'; // Relative path to avoid alias issues
import { Package, MessageSquare, LayoutDashboard, Settings, LogOut, Users, Trophy, Megaphone, Lightbulb, Mail, ShieldCheck, ClipboardList, ScrollText, Wrench, Bot, Image as ImageIcon, BarChart3 } from 'lucide-react';

export default async function AdminLayout({ children }) {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || user.role !== 'admin') {
        redirect('/');
    }

    const unreadMessages = await Contact.countDocuments({ read: false });
    const pendingUsers = await User.countDocuments({ role: 'artisan', status: 'pending' });
    const pendingChantiers = await Chantier.countDocuments({ status: 'pending' });
    const pendingCommentsCount = await Comment.countDocuments({ status: 'pending' });
    const pendingReviewsCount = await Review.countDocuments({ status: 'pending' });
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const moderationCount = pendingCommentsCount + pendingReviewsCount;
    const pendingCount = pendingUsers + pendingChantiers;

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex transition-colors duration-300">
            <Toaster position="top-right" />

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col dark:bg-slate-950 border-r dark:border-slate-800">
                <div className="h-16 flex items-center px-6 border-b border-slate-800 dark:border-slate-800">
                    <span className="text-xl font-bold tracking-tight text-primary-light">HORIZON ADMIN</span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    <NavItem href="/admin" icon={<LayoutDashboard size={20} />} label="Tableau de bord" />
                    <NavItem href="/admin/analytics" icon={<BarChart3 size={20} />} label="Analytiques" />
                    <NavItem href="/admin/moderation" icon={<ShieldCheck size={20} />} label="Modération" badge={moderationCount} />
                    <NavItem href="/admin/products" icon={<Package size={20} />} label="Produits" />
                    <NavItem href="/admin/solutions" icon={<Lightbulb size={20} />} label="Solutions" />
                    <NavItem href="/admin/users" icon={<Users size={20} />} label="Utilisateurs" badge={pendingUsers} />
                    <NavItem href="/admin/messages" icon={<Mail size={20} />} label="Messagerie" badge={unreadMessages} />
                    <NavItem href="/admin/requests" icon={<ClipboardList size={20} />} label="Demandes Clients" badge={pendingRequests} />
                    <NavItem href="/admin/chantiers" icon={<MessageSquare size={20} />} label="Chantiers" badge={pendingChantiers} />
                    <NavItem href="/admin/warranties" icon={<ScrollText size={20} />} label="Garanties" />
                    <NavItem href="/admin/maintenance" icon={<Wrench size={20} />} label="Maintenance" />
                    <NavItem href="/admin/campaigns" icon={<Megaphone size={20} />} label="Campagnes" />
                    <NavItem href="/admin/gallery" icon={<ImageIcon size={20} />} label="Galerie (CMS)" />
                    <NavItem href="/admin/settings/fidelity" icon={<Trophy size={20} />} label="Système Fidélité" />
                    <NavItem href="/admin/ai-training" icon={<Bot size={20} />} label="AI Training Center" />
                    <NavItem href="/admin/settings" icon={<Settings size={20} />} label="Paramètres" />
                </nav>

                <div className="p-4 border-t border-slate-800 dark:border-slate-800">
                    <Link href="/api/auth/signout" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full px-3 py-2 rounded-md hover:bg-slate-800 dark:hover:bg-slate-900">
                        <LogOut size={20} />
                        <span>Déconnexion</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Admin Header (Client Component) */}
                <AdminHeader user={user} pendingCount={pendingCount} unreadMessages={unreadMessages} pendingUsers={pendingUsers} pendingChantiers={pendingChantiers} moderationCount={moderationCount} pendingRequests={pendingRequests} />

                <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 p-8 transition-colors duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavItem({ href, icon, label, active = false, badge = 0 }) {
    // Note: Active state logic here is simplified.
    // In a real implementation with usePathname (client component), we'd highlight active.
    // For now, standard styling.
    return (
        <Link href={href} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-slate-900`}>
            <div className="flex items-center gap-3">
                {icon}
                <span>{label}</span>
            </div>
            {badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {badge}
                </span>
            )}
        </Link>
    )
}
