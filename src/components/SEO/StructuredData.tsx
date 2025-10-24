'use client';

import React from 'react';

interface StructuredDataProps {
  type: 'Organization' | 'LocalBusiness' | 'Service' | 'WebSite' | 'BreadcrumbList' | 'FAQPage';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'Organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Sumee App",
          "url": "https://www.sumeeapp.com",
          "logo": "https://www.sumeeapp.com/logo.png",
          "description": "Plataforma de servicios profesionales para el hogar en Ciudad de México",
          "foundingDate": "2024",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Ciudad de México",
            "addressRegion": "CDMX",
            "addressCountry": "MX"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+52-55-1234-5678",
            "contactType": "customer service",
            "availableLanguage": "Spanish"
          },
          "sameAs": [
            "https://www.facebook.com/sumeeapp",
            "https://www.instagram.com/sumeeapp",
            "https://www.linkedin.com/company/sumeeapp"
          ]
        };

      case 'LocalBusiness':
        return {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Sumee App",
          "description": "Servicios profesionales para el hogar en Ciudad de México",
          "url": "https://www.sumeeapp.com",
          "telephone": "+52-55-1234-5678",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Ciudad de México",
            "addressRegion": "CDMX",
            "addressCountry": "MX"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 19.4326,
            "longitude": -99.1332
          },
          "openingHours": "Mo-Su 00:00-23:59",
          "priceRange": "$$",
          "serviceArea": {
            "@type": "GeoCircle",
            "geoMidpoint": {
              "@type": "GeoCoordinates",
              "latitude": 19.4326,
              "longitude": -99.1332
            },
            "geoRadius": "50000"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Servicios Profesionales",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Plomería",
                  "description": "Servicios de plomería profesional"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Electricidad",
                  "description": "Servicios eléctricos profesionales"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Aire Acondicionado",
                  "description": "Instalación y mantenimiento de aire acondicionado"
                }
              }
            ]
          }
        };

      case 'Service':
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          "name": data.name || "Servicios Profesionales",
          "description": data.description || "Servicios profesionales para el hogar",
          "provider": {
            "@type": "Organization",
            "name": "Sumee App"
          },
          "areaServed": {
            "@type": "City",
            "name": "Ciudad de México"
          },
          "serviceType": data.serviceType || "Home Services",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "MXN",
            "description": "Cotización gratuita"
          }
        };

      case 'WebSite':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Sumee App",
          "url": "https://www.sumeeapp.com",
          "description": "Plataforma de servicios profesionales para el hogar en Ciudad de México",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.sumeeapp.com/professionals?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        };

      case 'BreadcrumbList':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.items.map((item: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        };

      case 'FAQPage':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.faqs.map((faq: any) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        };

      default:
        return data;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData(), null, 2)
      }}
    />
  );
}
