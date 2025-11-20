// src/app/cancel/page.tsx
'use client';

import React from 'react';
import { PageLayout } from '@/components/PageLayout'; // Asume que tienes este componente
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-6xl mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Pago Cancelado</h1>
        <p className="text-lg text-gray-700 max-w-lg mx-auto mb-8">
          Tu transacción ha sido cancelada. Si tienes problemas para completar el pago, por favor, intenta de nuevo o contacta a soporte.
        </p>
        <Link href="/pago-de-servicios" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition">
          Volver al Sistema de Pago
        </Link>
      </div>
    </PageLayout>
  );
}