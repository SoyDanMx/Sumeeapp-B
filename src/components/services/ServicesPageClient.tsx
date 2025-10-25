'use client';

import { useState } from 'react';
import { Service } from '@/types/supabase';
import ServiceSearch from './ServiceSearch';
import AIAdvisor from './AIAdvisor';

interface ServicesPageClientProps {
  services: Service[];
  popularServices: Service[];
  allServices: Service[];
}

export default function ServicesPageClient({ 
  services, 
  popularServices, 
  allServices 
}: ServicesPageClientProps) {
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);

  const handleAIConsultation = () => {
    setShowAIAdvisor(true);
  };

  const handleServiceRecommendation = (serviceName: string) => {
    console.log('Servicio recomendado por IA:', serviceName);
    // Aquí podrías implementar lógica para destacar el servicio recomendado
    // o redirigir a una página específica
  };

  return (
    <>
      {/* Buscador con integración IA */}
      <div className="max-w-3xl mx-auto">
        <ServiceSearch 
          placeholder="¿Qué problema necesitas resolver? (Ej: fuga de agua, instalar lámpara, pintar habitación)"
          onAIConsultation={handleAIConsultation}
        />
      </div>

      {/* Asistente IA */}
      {showAIAdvisor && (
        <AIAdvisor onServiceRecommendation={handleServiceRecommendation} />
      )}
    </>
  );
}
