// src/app/page.tsx
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ServicesSection } from '@/components/ServicesSection';
import { ValueProposition } from '@/components/ValueProposition';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { ProfessionalCTA } from '@/components/ProfessionalCTA';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer'; // 1. Importamos

export default function Home() {
  return (
    // Estructura para asegurar que el footer se quede abajo
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <ServicesSection />
        <ValueProposition />
        <TestimonialsSection />
        <ProfessionalCTA />
        <HowItWorks />
      </main>
      <Footer /> {/* 2. Lo añadimos aquí, fuera del main */}
    </div>
  );
}