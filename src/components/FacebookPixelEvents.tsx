'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackFbEvent } from '@/utils/trackFbEvent';

declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
    }
}

export default function FacebookPixelEvents() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastTrackedUrl = useRef<string>('');

    const isInitialLoad = useRef(true);

    useEffect(() => {
        const url = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        
        // Prevent double tracking if the URL hasn't changed
        if (lastTrackedUrl.current === url) return;
        lastTrackedUrl.current = url;
        
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return; // Skip first load, handled natively in layout.tsx
        }
        
        trackFbEvent('PageView');
        
    }, [pathname, searchParams]);

    return null;
}
