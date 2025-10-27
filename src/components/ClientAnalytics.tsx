// src/components/ClientAnalytics.tsx
"use client";

import dynamic from "next/dynamic";

// Componentes de analytics con carga diferida
const GoogleAnalytics = dynamic(() => import("@/components/analytics/GoogleAnalytics").then(mod => ({ default: mod.GoogleAnalytics })), { ssr: false });
const MetaPixel = dynamic(() => import("@/components/analytics/MetaPixel").then(mod => ({ default: mod.MetaPixel })), { ssr: false });
const StructuredData = dynamic(() => import("@/components/SEO/StructuredData"), { ssr: false });
const ServiceWorker = dynamic(() => import("@/components/Performance/ServiceWorker"), { ssr: false });
const PerformanceMonitor = dynamic(() => import("@/components/Performance/PerformanceMonitor"), { ssr: false });

export default function ClientAnalytics() {
  return (
    <>
      <GoogleAnalytics />
      <MetaPixel />
      <StructuredData type="Organization" data={{}} />
      <StructuredData type="LocalBusiness" data={{}} />
      <StructuredData type="WebSite" data={{}} />
      <ServiceWorker />
      <PerformanceMonitor />
    </>
  );
}
