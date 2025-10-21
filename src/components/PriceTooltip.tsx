'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

interface PriceTooltipProps {
  children: React.ReactNode;
  className?: string;
}

export const PriceTooltip: React.FC<PriceTooltipProps> = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div
        className={`inline-flex items-center ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        <button
          type="button"
          className="ml-1 text-gray-400 hover:text-blue-500 transition-colors focus:outline-none focus:text-blue-500"
          aria-label="Información sobre precios"
        >
          <FontAwesomeIcon icon={faInfoCircle} className="text-sm" />
        </button>
      </div>

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-50 w-80 p-4 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg text-sm text-gray-700"
          style={{
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200"></div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-[1px] w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
          
          <p className="font-semibold text-gray-800 mb-2">Precios Estimados</p>
          <p className="mb-3">
            El costo final puede variar según la complejidad del problema, la ubicación y el costo de los materiales adicionales. 
            El profesional confirmará el precio final antes de iniciar el trabajo.
          </p>
          <p className="text-blue-600 font-medium">
            <strong>¡Tu pago está protegido por la Garantía Sumee!</strong>
          </p>
        </div>
      )}
    </div>
  );
};
