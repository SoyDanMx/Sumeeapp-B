'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import LoadingStates from '../UX/LoadingStates';

// Componentes lazy para mejorar performance
export const LazyMapComponent = dynamic(
  () => import('@/components/MapComponent'),
  { 
    loading: () => <LoadingStates type="loading" message="Cargando mapa..." />,
    ssr: false 
  }
);

export const LazyBlogSection = dynamic(
  () => import('@/components/BlogSection').then(mod => ({ default: mod.BlogSection })),
  { 
    loading: () => <LoadingStates type="loading" message="Cargando blog..." />,
    ssr: false 
  }
);

export const LazyTestimonialsSection = dynamic(
  () => import('@/components/TestimonialsSection').then(mod => ({ default: mod.TestimonialsSection })),
  { 
    loading: () => <LoadingStates type="loading" message="Cargando testimonios..." />,
    ssr: false 
  }
);

export const LazyAIHelper = dynamic(
  () => import('@/components/AIHelper').then(mod => ({ default: mod.AIHelper })),
  { 
    loading: () => <LoadingStates type="loading" message="Cargando asistente..." />,
    ssr: false 
  }
);

export const LazyEditProfileModal = dynamic(
  () => import('@/components/EditProfileModal').then(mod => ({ default: mod.default })),
  { 
    loading: () => <LoadingStates type="loading" message="Cargando modal..." />,
    ssr: false 
  }
);

// Wrapper con Suspense para mejor UX
export function LazyComponentWrapper({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  return (
    <Suspense fallback={fallback || <LoadingStates type="loading" />}>
      {children}
    </Suspense>
  );
}
