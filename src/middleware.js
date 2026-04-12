import { NextResponse } from 'next/server';
import { rateLimit } from './lib/ratelimit';

/**
 * Middleware لحماية الموقع بالكامل (Rate Limiting)
 */
export async function middleware(req) {
    const { pathname } = req.nextUrl;

    // لا تطبق الحماية على الصور والملفات الثابتة
    if (
        pathname.startsWith('/_next') || 
        pathname.startsWith('/static') || 
        pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webp)$/)
    ) {
        return NextResponse.next();
    }

    // 1. تطبيق حماية عامة على جميع مسارات الـ API
    if (pathname.startsWith('/api/')) {
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        
        // حد عام: 30 طلب كل دقيقة (للبحث، التصفح، إلخ)
        const { success } = await rateLimit(`global_api_${ip}`, 30, 60);

        if (!success) {
            return new NextResponse(
                JSON.stringify({ success: false, error: "Trop de requêtes. Calmez-vous un peu !" }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
