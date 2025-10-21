'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

export const PricingTransparencyBanner = () => {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 py-4 px-4">
      <div className="container mx-auto">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-500 mr-3 text-xl flex-shrink-0" />
          <div className="flex-1">
            <p className="text-gray-800 font-medium">
              ¡Transparencia Total! Todos nuestros servicios inician con una <strong>Tarifa de Revisión: $350 - $450 MXN</strong> 
              <span className="hidden sm:inline"> (Pago anticipado y deducible del servicio final)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
