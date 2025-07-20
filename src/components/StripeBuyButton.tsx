// src/components/StripeBuyButton.tsx
'use client';

import React, { useEffect } from 'react';

// CORRECCIÓN DEFINITIVA: Añadimos la declaración de tipos directamente en este archivo
// para asegurar que tanto el editor local como el compilador de Vercel la reconozcan.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'buy-button-id': string;
        'publishable-key': string;
      };
    }
  }
}

interface StripeBuyButtonProps {
  buyButtonId: string;
  publishableKey: string;
}

export const StripeBuyButton: React.FC<StripeBuyButtonProps> = ({ buyButtonId, publishableKey }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <stripe-buy-button
      buy-button-id={buyButtonId}
      publishable-key={publishableKey}
    >
    </stripe-buy-button>
  );
};