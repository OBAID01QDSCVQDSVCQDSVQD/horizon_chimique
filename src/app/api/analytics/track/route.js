import { NextResponse } from 'next/server';
import { runWithMongoRetry } from '@/lib/db';
import UserAnalytics from '@/models/Analytics';

// Simple cache for countries per session to avoid too many API calls
const sessionCache = new Map();

async function getGeoLocation(ip) {
    if (!ip || ip === '::1' || ip === '127.0.0.1') return { country: 'Localhost', city: 'Local' };
    
    try {
        // We can use a free API like ipapi.co (or similar)
        const response = await fetch(`https://ipapi.co/${ip}/json/`).then(r => r.json());
        if (response && response.country_name) {
            return {
                country: response.country_name,
                city: response.city || 'Unknown'
            };
        }
    } catch (error) {
        console.error('GeoIP Error:', error);
    }
    return { country: 'Unknown', city: 'Unknown' };
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { type, page, sessionId, referrer, duration, userId } = body;
        
        // Extract IP header (Next.js 14)
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : 'Unknown';
        const userAgent = req.headers.get('user-agent');

        let geo = { country: 'Unknown', city: 'Unknown' };
        
        // Check cache if we already know this session's location
        if (sessionCache.has(sessionId)) {
            geo = sessionCache.get(sessionId);
        } else if (ip !== 'Unknown') {
            geo = await getGeoLocation(ip);
            sessionCache.set(sessionId, geo);
            // Clear old cache eventually to prevent memory leak
            if (sessionCache.size > 1000) sessionCache.clear();
        }

        const logEntry = {
            type,
            page: page?.split('?')[0] || '/', // Strip query params for cleaner stats
            referrer: referrer || 'Direct',
            userAgent,
            ip,
            country: geo.country,
            city: geo.city,
            sessionId,
            userId,
            duration: duration || 0
        };

        await runWithMongoRetry(async () => {
            await UserAnalytics.create(logEntry);
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Analytics Tracking Error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
