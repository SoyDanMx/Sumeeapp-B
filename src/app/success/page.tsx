// src/app/success/page.tsx
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageLayout } from '@/components/PageLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Creamos un componente interno para leer los parámetros de la URL.
// Esto nos permite envolverlo en <Suspense>.
const SuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [message, setMessage] = useState('Verificando tu pago...');

  useEffect(() => {
    if (sessionId) {
      // En una app completa, aquí verificaríamos el sessionId con nuestro backend
      // para confirmar el pago y actualizar la membresía del usuario.
      setMessage('¡Pago Completado! Tu membresía ya está activa. Redirigiendo...');
      const redirectTimer = setTimeout(() => {
        router.push('/dashboard');
      }, 3000); // 3 segundos antes de redirigir

      return () => clearTimeout(redirectTimer);
    } else {
      setMessage('Página de éxito de pago inválida.');
    }
  }, [sessionId, router]);

  return (
    <div className="text-center">
      <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Gracias por tu compra!</h1>
      <p className="text-lg text-gray-700">{message}</p>
      <p className="text-md text-gray-500 mt-8">
        Si no eres redirigido, <Link href="/dashboard" className="text-blue-600 hover:underline">haz clic aquí</Link>.
      </p>
    </div>
  );
};

// Esta es la página principal que se exporta.
export default function SuccessPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
          {/* Envolvemos el contenido en <Suspense> con un fallback de carga. */}
          <Suspense fallback={<div className="text-center"><FontAwesomeIcon icon={faSpinner} spin size="2x" /> <p className="mt-4">Cargando...</p></div>}>
            <SuccessContent />
          </Suspense>
        </div>
      </div>
    </PageLayout>
  );
}