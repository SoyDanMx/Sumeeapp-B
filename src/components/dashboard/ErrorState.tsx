'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faRefresh } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-[calc(var(--header-offset,72px)+2rem)] p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Oops, algo salió mal
        </h2>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mb-4"
          >
            <FontAwesomeIcon icon={faRefresh} className="w-4 h-4" />
            Reintentar
          </button>
        )}
        
        <div className="mt-4">
          <Link 
            href="/support" 
            className="text-sm text-blue-600 hover:underline"
          >
            ¿Necesitas ayuda? Contacta soporte
          </Link>
        </div>
      </div>
    </div>
  );
}



