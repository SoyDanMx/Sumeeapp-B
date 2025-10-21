// src/app/page.tsx
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ServicesSection } from '@/components/ServicesSection';
import { ValueProposition } from '@/components/ValueProposition';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { ProfessionalCTA } from '@/components/ProfessionalCTA';
import { AIHelper } from '@/components/AIHelper';
import { HowItWorks } from '@/components/HowItWorks';
import { BlogSection } from '@/components/BlogSection';
import { Footer } from '@/components/Footer';
import QuickLeadForm from '@/components/QuickLeadForm';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        
        {/* 🚀 QuickLeadForm - Nuevo funnel de captación rápida */}
        <section className="py-16 bg-gray-50">
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
        
        <ServicesSection />
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
    </div>
  );
}