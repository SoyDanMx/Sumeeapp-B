'use client';

import React from 'react';

export default function ResourceHints() {
  return (
    <>
      {/* DNS Prefetch para recursos externos */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//images.unsplash.com" />
      
      {/* Preload para recursos críticos */}
      <link 
        rel="preload" 
        href="/fonts/inter-var.woff2" 
        as="font" 
        type="font/woff2" 
        crossOrigin="anonymous" 
      />
      
      {/* Preload para imágenes críticas */}
      <link 
        rel="preload" 
        href="/images/hero-bg.webp" 
        as="image" 
        type="image/webp"
      />
      
      {/* CSS crítico está inline en CriticalCSS component, no necesita preload */}
      
      {/* Prefetch para páginas importantes */}
      <link rel="prefetch" href="/servicios" />
      <link rel="prefetch" href="/tecnicos" />
      <link rel="prefetch" href="/join-as-pro" />
      
      {/* Modulepreload removido - Next.js maneja esto automáticamente */}
    </>
  );
}
