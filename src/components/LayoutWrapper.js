'use client';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    return (
        <div className="flex flex-col min-h-screen">
            {!isAdmin && <Navbar />}
            <main className={`flex-grow ${!isAdmin ? 'pt-20' : ''}`}>
                {children}
            </main>
            {!isAdmin && <Footer />}
        </div>
    );
}
