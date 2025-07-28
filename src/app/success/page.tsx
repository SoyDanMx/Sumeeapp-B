// src/app/success/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { PageLayout } from '@/components/PageLayout'; // Asume que tienes este componente
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [message, setMessage] = useState('Verificando tu pago...');

  useEffect(() => {
    if (sessionId) {
      // Aquí podrías hacer una llamada a tu API de backend para verificar el estado de la sesión
      // de Stripe nuevamente (opcional, pero buena práctica para mayor seguridad).
      // Por ahora, solo mostramos un mensaje genérico.
      setMessage('¡Pago Completado! Tu membresía ya está activa. Redirigiendo...');
      // Redirigir al dashboard o a la página de profesionales después de un breve delay
      const redirectTimer = setTimeout(() => {
        router.push('/dashboard'); // O '/professionals'
      }, 3000); // 3 segundos antes de redirigir

      return () => clearTimeout(redirectTimer);
    } else {
      setMessage('Página de éxito de pago inválida.');
    }
  }, [sessionId, router]);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-20 text-center flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-6xl mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">¡Gracias por tu compra!</h1>
        <p className="text-lg text-gray-700 max-w-lg mx-auto mb-8">{message}</p>
        <p className="text-md text-gray-500">Si no eres redirigido, <a href="/dashboard" className="text-blue-600 hover:underline">haz clic aquí</a> para ir a tu panel.</p>
      </div>
    </PageLayout>
  );
}