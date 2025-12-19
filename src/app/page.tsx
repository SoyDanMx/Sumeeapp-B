// src/app/page.tsx
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { PricingTransparencyBanner } from '@/components/PricingTransparencyBanner';
import { ValueProposition } from '@/components/ValueProposition';
import dynamic from 'next/dynamic';

// Componentes "below the fold" cargados dinámicamente para reducir TBT
const TestimonialsSection = dynamic(
  () => import('@/components/TestimonialsSection').then(mod => mod.TestimonialsSection),
  { ssr: true }
);

const ProfessionalCTA = dynamic(
  () => import('@/components/ProfessionalCTA').then(mod => mod.ProfessionalCTA),
  { ssr: true }
);

const AIHelper = dynamic(
  () => import('@/components/AIHelper').then(mod => mod.AIHelper),
  { ssr: true }
);

const HowItWorks = dynamic(
  () => import('@/components/HowItWorks').then(mod => mod.HowItWorks),
  { ssr: true }
);

const BlogSection = dynamic(
  () => import('@/components/BlogSection').then(mod => mod.BlogSection),
  { ssr: true }
);

// Footer cargado dinámicamente - no crítico para LCP
const Footer = dynamic(
  () => import('@/components/Footer').then(mod => mod.Footer),
  { ssr: true }
);

const QuickLeadForm = dynamic(() => import('@/components/QuickLeadForm'), {
  ssr: true,
});

const PopularServices = dynamic(() => import('@/components/landing/PopularServices'), {
  ssr: true,
});

const PopularProjectsSection = dynamic(() => import('@/components/landing/PopularProjectsSection'), {
  ssr: true,
});

const FloatingActionBtn = dynamic(
  () => import('@/components/FloatingActionBtn').then((mod) => mod.FloatingActionBtn)
);

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />

        {/* Banner de Transparencia de Tarifas */}
        <PricingTransparencyBanner />

        {/* 🚀 QuickLeadForm - Nuevo funnel de captación rápida */}
        <section id="quick-lead-form" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  ¿Necesitas un Técnico Ahora?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Solicita un profesional verificado y recibe respuesta en menos de 2 horas.
                  Sin compromiso, directo por WhatsApp.
                </p>
              </div>
              <QuickLeadForm />
            </div>
          </div>
        </section>

        {/* 🎯 SECCIÓN: Servicios Populares - Versión mejorada */}
        <PopularServices />
        
        {/* 🎯 SECCIÓN: Proyectos Populares con Precios Fijos */}
        <PopularProjectsSection />
        
        <ValueProposition />
        {/* 2. Mantenemos la sección original y añadimos el Asistente de IA debajo */}
        <HowItWorks />
        {/* 🎯 Nueva sección de Blog justo después de "Cómo Funciona" */}
        <BlogSection />
        <AIHelper />
        <TestimonialsSection />
        <ProfessionalCTA />
      </main>
      <Footer />
      <FloatingActionBtn />
    </div>
  );
}