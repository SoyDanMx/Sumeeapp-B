// src/types/global.d.ts

// Este archivo extiende los tipos globales de JSX para nuestro proyecto.
// Le "enseña" a TypeScript sobre elementos personalizados como el botón de Stripe.

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
  
  // Es importante exportar un objeto vacío para que TypeScript trate este archivo como un módulo.
  export {};