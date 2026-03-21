import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfileRedirectPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        // Not registered/logged in -> Create Account
        redirect('/register');
    }

    const { role } = session.user;

    if (role === 'artisan') {
        // Redirect to Artisan Dashboard (or Profile Settings based on interpretation)
        // User said "Artisan Profile". Usually Dashboard is the entry point.
        redirect('/artisan/dashboard');
    } else if (role === 'admin') {
        redirect('/admin');
    } else {
        // Regular User
        redirect('/dashboard');
    }

    // Default return (should not reach here)
    return null;
}
