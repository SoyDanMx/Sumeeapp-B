// src/app/servicios/page.tsx
'use client';

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ServiceCard } from '@/components/ServiceCard';
import { servicesData } from '@/lib/servicesData'; // Importamos los datos desde nuestro archivo central

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-24 pb-12 bg-gray-50">
        <section className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Todos Nuestros Servicios</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Explora la gama completa de soluciones que ofrecemos para tu hogar y oficina.</p>
          </div>
          
          {/* Mostramos la galería completa de los 12 servicios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {servicesData.map((service) => (
              <ServiceCard 
                key={service.name}
                name={service.name}
                rating={service.rating}
                image={service.image}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}