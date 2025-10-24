'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  loading = 'lazy',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Generar blur placeholder si no se proporciona
  const generateBlurDataURL = () => {
    if (blurDataURL) return blurDataURL;
    
    // SVG simple como placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui">
          Cargando...
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  };

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-sm">Error al cargar imagen</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-500 text-sm">Cargando...</div>
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL || generateBlurDataURL()}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
    </div>
  );
}

// Componente específico para imágenes de servicios
export function ServiceImage({ 
  service, 
  className = '' 
}: { 
  service: string; 
  className?: string; 
}) {
  const serviceImages: Record<string, string> = {
    'plomeros': '/images/services/plomeros.jpg',
    'electricistas': '/images/services/electricistas.jpg',
    'aire-acondicionado': '/images/services/aire-acondicionado.jpg',
    'carpinteria': '/images/services/carpinteria.jpg',
    'limpieza': '/images/services/limpieza.jpg',
    'pintores': '/images/services/pintores.jpg',
    'jardineria': '/images/services/jardineria.jpg',
    'cctv': '/images/services/cctv.jpg',
    'fumigacion': '/images/services/fumigacion.jpg',
    'tablaroca': '/images/services/tablaroca.jpg',
    'wifi': '/images/services/wifi.jpg',
  };

  return (
    <OptimizedImage
      src={serviceImages[service] || '/images/services/default.jpg'}
      alt={`Servicio de ${service} en Ciudad de México`}
      width={400}
      height={300}
      className={`rounded-lg shadow-md ${className}`}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={90}
    />
  );
}

// Componente para imágenes de profesionales
export function ProfessionalImage({ 
  src, 
  name, 
  className = '' 
}: { 
  src?: string; 
  name: string; 
  className?: string; 
}) {
  return (
    <OptimizedImage
      src={src || '/images/default-avatar.png'}
      alt={`Foto de perfil de ${name}`}
      width={200}
      height={200}
      className={`rounded-full object-cover ${className}`}
      sizes="(max-width: 768px) 150px, 200px"
      quality={95}
    />
  );
}
