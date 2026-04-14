'use client';

import { SessionProvider } from "next-auth/react";
import { Toaster } from 'react-hot-toast';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import PostHogPageView from "@/components/PostHogPageView";
import { Suspense } from "react";

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_placeholder', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://analytics.sdkbatiment.com',
    person_profiles: 'identified_only',
    capture_pageview: false, 
    persistence: 'localStorage',
  });
}

export function Providers({ children }) {
  return (
    <PostHogProvider client={posthog}>
      <SessionProvider>
        <Suspense fallback={null}>
          <PostHogPageView />
        </Suspense>
        {children}
        <Toaster position="bottom-right" />
      </SessionProvider>
    </PostHogProvider>
  );
}
