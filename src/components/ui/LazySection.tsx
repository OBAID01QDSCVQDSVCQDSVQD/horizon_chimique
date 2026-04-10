'use client';

import React, { Suspense } from 'react';

const DefaultSkeleton = () => (
  <div className="w-full h-64 bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center">
    <div className="w-32 h-8 bg-slate-200 rounded animate-pulse" />
  </div>
);

export default function LazySection({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <Suspense fallback={fallback || <DefaultSkeleton />}>
      <section className="transition-opacity duration-1000 ease-in-out">
        {children}
      </section>
    </Suspense>
  );
}
