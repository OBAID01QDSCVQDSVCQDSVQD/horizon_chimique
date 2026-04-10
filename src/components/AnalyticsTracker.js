'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: session } = useSession();

    useEffect(() => {
        // Generate or retrieve session ID
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('analytics_session_id', sessionId);
        }

        const trackView = async () => {
            try {
                const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
                
                // Don't track admin or api routes if not needed
                if (url.startsWith('/admin') || url.startsWith('/api')) return;

                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'pageview',
                        page: url,
                        sessionId,
                        referrer: document.referrer,
                        userId: session?.user?.id || null
                    }),
                    keepalive: true // Ensure it sends even if page is unloading
                });
            } catch (error) {
                console.error('Analytics Error:', error);
            }
        };

        trackView();

        // Heartbeat to track duration/stay time every 20 seconds
        const heartbeatInterval = setInterval(async () => {
            const url = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
            if (url.startsWith('/admin') || url.startsWith('/api')) return;
            
            try {
                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'heartbeat',
                        page: url,
                        sessionId,
                        userId: session?.user?.id || null
                    }),
                    keepalive: true
                });
            } catch (e) {}
        }, 20000);

        return () => clearInterval(heartbeatInterval);
    }, [pathname, searchParams, session]);

    return null; // This component doesn't render anything
}
