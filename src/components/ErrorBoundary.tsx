'use client';

import React, { Component, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHome, faRefresh } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Loggear a servicio de monitoreo (Sentry, LogRocket, etc.)
    console.error('❌ Error capturado por ErrorBoundary:', error, errorInfo);
    
    // Si tienes Sentry configurado:
    // Sentry.captureException(error, { extra: errorInfo });
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 text-red-600" />
                </div>
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Algo salió mal
                </h1>
                
                <p className="text-gray-600 mb-4">
                  Lo sentimos, ocurrió un error inesperado. Nuestro equipo ha sido notificado 
                  y estamos trabajando para solucionarlo.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-4 p-4 bg-red-50 rounded-lg">
                    <summary className="cursor-pointer font-medium text-red-900 mb-2">
                      Detalles del error (solo en desarrollo)
                    </summary>
                    <pre className="text-xs text-red-800 overflow-auto max-h-48">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={this.handleReset}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={faRefresh} className="w-4 h-4" />
                    Intentar de nuevo
                  </button>
                  
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
                    Ir al inicio
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Si el problema persiste, por favor{' '}
                    <Link href="/support" className="text-blue-600 hover:underline">
                      contacta a soporte
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}




