'use client';

import React from 'react';

export default function ResourceHints() {
  return (
    <>
      {/* DNS Prefetch para recursos externos */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//images.unsplash.com" />
      
      {/* Preconnect para recursos críticos */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
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
      
      {/* Preload para CSS crítico */}
      <link 
        rel="preload" 
        href="/styles/critical.css" 
        as="style" 
        onLoad={(e) => {
          const link = e.target as HTMLLinkElement;
          link.onload = null;
          link.rel = 'stylesheet';
        }}
      />
      
      {/* Prefetch para páginas importantes */}
      <link rel="prefetch" href="/servicios" />
      <link rel="prefetch" href="/professionals" />
      <link rel="prefetch" href="/join-as-pro" />
      
      {/* Modulepreload para JavaScript crítico */}
      <link rel="modulepreload" href="/_next/static/chunks/vendors.js" />
      <link rel="modulepreload" href="/_next/static/chunks/common.js" />
    </>
  );
}
