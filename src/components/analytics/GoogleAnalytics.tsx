// src/components/analytics/GoogleAnalytics.tsx
'use client';

import React from 'react';
import Script from 'next/script';

// Usamos el ID de Medición que nos proporcionaste
const GA_TRACKING_ID = 'G-DZCY3C3DEJ';

export const GoogleAnalytics = () => {
  return (
    <>
      {/* Carga el script de Google Analytics de forma asíncrona */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      {/* Inicializa Google Analytics y configura el seguimiento de páginas vistas */}
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
};