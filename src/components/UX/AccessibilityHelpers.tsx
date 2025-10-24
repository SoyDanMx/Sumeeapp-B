'use client';

import React, { useEffect, useRef } from 'react';

// Hook para manejar focus y navegación por teclado
export function useFocusManagement() {
  const focusRef = useRef<HTMLElement>(null);

  const focusElement = () => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  };

  const trapFocus = (containerRef: React.RefObject<HTMLElement>) => {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = containerRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
            
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [containerRef]);
  };

  return { focusRef, focusElement, trapFocus };
}

// Componente para anunciar cambios a screen readers
export function ScreenReaderAnnouncement({ 
  message, 
  priority = 'polite' 
}: { 
  message: string; 
  priority?: 'polite' | 'assertive'; 
}) {
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Componente para skip links
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Saltar al contenido principal
      </a>
      <a
        href="#navigation"
        className="absolute top-4 left-32 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Saltar a navegación
      </a>
    </div>
  );
}

// Hook para detectar si el usuario prefiere movimiento reducido
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Componente para botones accesibles
export function AccessibleButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  [key: string]: any;
}) {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        rounded-md font-medium transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// Componente para formularios accesibles
export function AccessibleFormField({
  label,
  id,
  type = 'text',
  required = false,
  error,
  helpText,
  children,
  ...props
}: {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="requerido">*</span>}
      </label>
      
      {children || (
        <input
          id={id}
          type={type}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}
            focus:outline-none focus:ring-2
          `}
          {...props}
        />
      )}
      
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={`${id}-help`} className="text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
}

// Hook para manejar escape key
export function useEscapeKey(callback: () => void) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [callback]);
}
