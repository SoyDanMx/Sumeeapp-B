'use client';

import React from 'react';
import Head from 'next/head';

interface AdvancedMetaProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
  nofollow?: boolean;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export default function AdvancedMeta({
  title,
  description,
  keywords = [],
  canonical,
  ogImage = '/og-image.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noindex = false,
  nofollow = false,
  author = 'Sumee App',
  publishedTime,
  modifiedTime,
  section,
  tags = []
}: AdvancedMetaProps) {
  const fullTitle = title ? `${title} | Sumee App CDMX` : 'Plomeros, Electricistas y Más Verificados en CDMX | Sumee App';
  const fullDescription = description || 'Encuentra técnicos profesionales de confianza para tu hogar en Ciudad de México. Servicios 100% verificados con garantía de satisfacción. ¡Cotiza fácil y rápido!';
  const fullKeywords = [...keywords, 'plomeros CDMX', 'electricistas CDMX', 'servicios para el hogar CDMX', 'técnicos verificados CDMX'];
  const canonicalUrl = canonical || 'https://www.sumeeapp.com';

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="robots" content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#4F46E5" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`https://www.sumeeapp.com${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content="Sumee App" />
      <meta property="og:locale" content="es_MX" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={`https://www.sumeeapp.com${ogImage}`} />
      <meta name="twitter:image:alt" content={fullTitle} />
      <meta name="twitter:site" content="@sumeeapp" />
      <meta name="twitter:creator" content="@sumeeapp" />
      
      {/* Additional Meta Tags */}
      <meta name="geo.region" content="MX-CMX" />
      <meta name="geo.placename" content="Ciudad de México" />
      <meta name="geo.position" content="19.4326;-99.1332" />
      <meta name="ICBM" content="19.4326, -99.1332" />
      
      {/* Article Meta Tags (if applicable) */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags.length > 0 && tags.map(tag => <meta key={tag} property="article:tag" content={tag} />)}
      
      {/* Mobile App Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Sumee App" />
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      
      {/* DNS Prefetch for performance */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
    </Head>
  );
}
