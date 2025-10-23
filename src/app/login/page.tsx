// src/app/login/page.tsx

import React, { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

// Un componente de carga simple para el fallback de Suspense
function LoadingSpinner() {
  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      {/* --- LA CORRECCIÓN CLAVE --- */}
      {/* Envuelve el componente que usa useSearchParams en Suspense */}
      <Suspense fallback={<LoadingSpinner />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}