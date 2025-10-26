import React from 'react';
import { Metadata } from 'next';
import MembresiaContent from './MembresiaContent';

export const metadata: Metadata = {
  title: 'Membresía Premium - Accede a los Mejores Técnicos de CDMX | Sumee App',
  description: 'Convierte en miembro premium y accede a los mejores técnicos de Ciudad de México. Servicios verificados, garantía total y respuesta en 2 horas.',
  keywords: ['membresía premium', 'técnicos CDMX', 'servicios hogar', 'garantía', 'Ciudad de México'],
};

export default function MembresiaPage() {
  return <MembresiaContent />;
}