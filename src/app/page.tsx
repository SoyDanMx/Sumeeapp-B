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

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
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