/**
 * Track a Facebook event via both Browser Pixel + CAPI (server-side)
 * for maximum data accuracy (especially iOS 14+)
 */
/**
 * Track a Facebook event via both Browser Pixel + CAPI (server-side)
 * for maximum data accuracy (especially iOS 14+)
 */
export function trackFbEvent(eventName, customData = {}, userData = {}) {
    if (typeof window === 'undefined') return;

    const url = window.location.href;

    // 1. Manage External ID (Persistent for the session/user)
    let external_id = localStorage.getItem('hc_fb_external_id');
    if (!external_id) {
        external_id = 'hc_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now();
        localStorage.setItem('hc_fb_external_id', external_id);
    }

    // 2. Generate unique event_id for deduplication between Browser + CAPI
    const eventId = `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // 3. Browser Pixel (client-side) — pass eventID and user data for better matching
    const fireClientEvent = () => {
        if (window.fbq) {
            // Enhanced Matching: Pass external_id and other known clear-text data (Meta hashes it)
            window.fbq('track', eventName, customData, { 
                eventID: eventId,
                external_id: external_id // Crucial for EMQ
            });
        }
    };

    if (window.fbq) {
        fireClientEvent();
    } else {
        // Wait for Facebook Script to inject and initialize (up to 5 seconds)
        let retries = 0;
        const timer = setInterval(() => {
            retries++;
            if (window.fbq) {
                clearInterval(timer);
                fireClientEvent();
            } else if (retries >= 50) {
                clearInterval(timer);
            }
        }, 100);
    }

    // 4. CAPI (server-side)
    const fbc = getCookie('_fbc');
    const fbp = getCookie('_fbp');

    fetch('/api/capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            eventName,
            eventId,
            eventSourceUrl: url,
            userData: { 
                ...userData, 
                fbc, 
                fbp, 
                external_id,
                userAgent: navigator.userAgent 
            },
            customData,
        }),
    }).catch(err => console.warn('CAPI error (non-blocking):', err));
}

function getCookie(name) {
    if (typeof document === 'undefined') return undefined;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : undefined;
}
