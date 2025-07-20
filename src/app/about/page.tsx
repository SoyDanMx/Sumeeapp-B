// src/app/about/page.tsx
import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader'; // Importamos el nuevo componente
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <PageLayout>
      {/* MEJORA: Se ajusta el padding vertical y horizontal para móviles */}
      <div className="container mx-auto px-6 sm:px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <PageHeader 
            icon={faHeart}
            title="Nuestra Misión"
            subtitle="Conectando hogares con manos expertas y de confianza."
          />
        </div>
        {/* MEJORA: Altura de imagen y márgenes ajustados para móviles */}
        <div className="relative w-full max-w-5xl mx-auto h-56 md:h-96 rounded-xl overflow-hidden shadow-lg my-8 md:my-12">
            <Image 
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80" 
                alt="Equipo de Sumee trabajando en colaboración" 
                fill
                className="object-cover"
            />
        </div>
        {/* MEJORA: Márgenes y padding ajustados para móviles */}
        <div className="max-w-3xl mx-auto mt-8 md:mt-12 bg-white p-6 sm:p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">¿Por Qué Confiar en Nosotros?</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
                Nacimos de la necesidad de encontrar ayuda de calidad de forma rápida y segura. Cada profesional en nuestra plataforma pasa por un riguroso proceso de verificación para garantizar tu tranquilidad. No somos solo una app, somos una comunidad construida sobre la confianza y el trabajo bien hecho, pensada para las necesidades de Latinoamérica.
            </p>
        </div>
      </div>
    </PageLayout>
  );
}