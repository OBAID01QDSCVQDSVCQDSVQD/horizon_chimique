/**
 * Track a Facebook event via both Browser Pixel + CAPI (server-side)
 * for maximum data accuracy (especially iOS 14+)
 */
export function trackFbEvent(eventName, customData = {}, userData = {}) {
    const url = typeof window !== 'undefined' ? window.location.href : '';

    // Generate unique event_id for deduplication between Browser + CAPI
    const eventId = `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // 1. Browser Pixel (client-side) — pass eventID for deduplication
    if (typeof window !== 'undefined') {
        const fireClientEvent = () => {
            if (window.fbq) {
                window.fbq('track', eventName, customData, { eventID: eventId });
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
                    clearInterval(timer); // Give up after 5s
                }
            }, 100);
        }
    }

    // 2. CAPI (server-side) — fire and forget
    const fbc = getCookie('_fbc');
    const fbp = getCookie('_fbp');

    fetch('/api/capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            eventName,
            eventId,
            eventSourceUrl: url,
            userData: { ...userData, fbc, fbp },
            customData,
        }),
    }).catch(err => console.warn('CAPI error (non-blocking):', err));
}

function getCookie(name) {
    if (typeof document === 'undefined') return undefined;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : undefined;
}
