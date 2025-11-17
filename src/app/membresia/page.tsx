import React from 'react';
import { Metadata } from 'next';
import MembresiaContent from './MembresiaContent';

export const metadata: Metadata = {
  title: 'Membresía PRO - Accede a los Mejores Técnicos de CDMX | Sumee App',
  description: 'Convierte en miembro PRO y accede a los mejores técnicos de Ciudad de México. Servicios verificados, garantía total y respuesta prioritaria.',
  keywords: ['membresía pro', 'técnicos CDMX', 'servicios hogar', 'garantía', 'Ciudad de México', 'plan pro'],
};

export default function MembresiaPage() {
  return <MembresiaContent />;
}