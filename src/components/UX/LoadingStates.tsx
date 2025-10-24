'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface LoadingStatesProps {
  type: 'loading' | 'success' | 'error' | 'empty';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingStates({ 
  type, 
  message, 
  size = 'md', 
  className = '' 
}: LoadingStatesProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const getIcon = () => {
    switch (type) {
      case 'loading':
        return <FontAwesomeIcon icon={faSpinner} className={`${sizeClasses[size]} animate-spin text-blue-600`} />;
      case 'success':
        return <FontAwesomeIcon icon={faCheckCircle} className={`${sizeClasses[size]} text-green-600`} />;
      case 'error':
        return <FontAwesomeIcon icon={faExclamationTriangle} className={`${sizeClasses[size]} text-red-600`} />;
      default:
        return null;
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'loading':
        return 'Cargando...';
      case 'success':
        return '¡Completado!';
      case 'error':
        return 'Error al cargar';
      case 'empty':
        return 'No hay datos disponibles';
      default:
        return '';
    }
  };

  const getContainerClasses = () => {
    const baseClasses = 'flex flex-col items-center justify-center p-8 text-center';
    const typeClasses = {
      loading: 'bg-blue-50 text-blue-700',
      success: 'bg-green-50 text-green-700',
      error: 'bg-red-50 text-red-700',
      empty: 'bg-gray-50 text-gray-700'
    };
    
    return `${baseClasses} ${typeClasses[type]} ${className}`;
  };

  return (
    <div className={getContainerClasses()}>
      {getIcon()}
      <p className="mt-2 text-sm font-medium">{getMessage()}</p>
    </div>
  );
}

// Componente específico para skeleton loading
export function SkeletonLoader({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number; 
  className?: string; 
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded mb-2 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

// Componente para loading de cards
export function CardSkeleton({ 
  count = 3, 
  className = '' 
}: { 
  count?: number; 
  className?: string; 
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

// Componente para loading de formularios
export function FormSkeleton({ 
  fields = 4, 
  className = '' 
}: { 
  fields?: number; 
  className?: string; 
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      ))}
      <div className="h-12 bg-gray-200 rounded w-1/3"></div>
    </div>
  );
}
