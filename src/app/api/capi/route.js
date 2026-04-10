import { NextResponse } from 'next/server';
import crypto from 'crypto';

function hashData(value) {
    if (!value) return undefined;
    return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export async function POST(req) {
    const PIXEL_ID = process.env.FB_PIXEL_ID;
    const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
    const API_VERSION = 'v22.0';

    try {
        const body = await req.json();
        const { eventName, eventId, eventSourceUrl, userData = {}, customData = {} } = body;

        console.log(`[CAPI] Received event: ${eventName}, ID: ${eventId}`);

        if (!PIXEL_ID || !ACCESS_TOKEN || ACCESS_TOKEN === 'REMPLACE_PAR_TON_TOKEN') {
            console.error('[CAPI] Missing credentials');
            return NextResponse.json({ error: 'CAPI not configured' }, { status: 500 });
        }

        const payload = {
            data: [{
                event_name: eventName,
                event_id: eventId || undefined,
                event_time: Math.floor(Date.now() / 1000),
                event_source_url: eventSourceUrl || process.env.APP_PUBLIC_URL || 'https://sdkbatiment.com',
                action_source: 'website',
                user_data: {
                    client_ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '0.0.0.0',
                    client_user_agent: req.headers.get('user-agent') || '',
                    em: userData.email ? hashData(userData.email) : undefined,
                    ph: userData.phone ? hashData(userData.phone.replace(/[^0-9]/g, '').replace(/^0+/, '').replace(/^(?!216)(.*)/, '216$1')) : undefined,
                    fn: userData.firstName ? hashData(userData.firstName) : undefined,
                    ln: userData.lastName ? hashData(userData.lastName) : undefined,
                    fbc: userData.fbc || undefined,
                    fbp: userData.fbp || undefined,
                },
                custom_data: Object.keys(customData).length > 0 ? customData : undefined,
            }],
            ...(process.env.FB_TEST_EVENT_CODE && {
                test_event_code: process.env.FB_TEST_EVENT_CODE
            }),
        };

        const res = await fetch(
            `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }
        );

        const result = await res.json();

        if (!res.ok) {
            console.error('[CAPI] Facebook Error:', JSON.stringify(result));
            return NextResponse.json({ error: result }, { status: 400 });
        }

        console.log('[CAPI] Success sent to Facebook');
        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('[CAPI] Route Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
