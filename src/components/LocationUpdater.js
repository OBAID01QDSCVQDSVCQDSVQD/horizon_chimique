'use client';

import { useEffect, useRef } from 'react';

export default function LocationUpdater() {
    const attempted = useRef(false);

    useEffect(() => {
        if (attempted.current) return;
        attempted.current = true; // Prevent double firing in StrictMode

        if (typeof window !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const res = await fetch('/api/profile', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                lastLocation: {
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude
                                }
                            })
                        });
                        const data = await res.json();
                        if (data.success) {
                            console.log("Location silently updated to current location.");
                        }
                    } catch (e) {
                        console.error("Silent location update failed", e);
                    }
                },
                (err) => {
                    console.log("Location access denied or failed. Will use registered location instead.", err);
                },
                { timeout: 15000, maximumAge: 300000 } // Don't demand fresh GPS if they have cached location within 5 mins
            );
        }
    }, []);

    return null; // This component is invisible
}
