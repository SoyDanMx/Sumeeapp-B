import { useState, useEffect } from 'react';

/**
 * Hook para calcular dinámicamente el offset del header
 * y aplicar padding correcto al contenido
 */
export function useHeaderOffset() {
  const [headerOffset, setHeaderOffset] = useState(112); // Valor por defecto: 112px (pt-28)

  useEffect(() => {
    const updateHeaderOffset = () => {
      const header = document.querySelector('header');
      if (header) {
        const height = header.offsetHeight;
        // Agregar padding adicional para evitar bloqueo
        const additionalPadding = 16; // 1rem adicional
        setHeaderOffset(height + additionalPadding);
        
        // Actualizar variable CSS para uso en otros componentes
        document.documentElement.style.setProperty(
          '--header-offset',
          `${height}px`
        );
        document.documentElement.style.setProperty(
          '--header-offset-with-padding',
          `${height + additionalPadding}px`
        );
      }
    };

    // Calcular inicialmente
    updateHeaderOffset();

    // Recalcular en resize y cuando cambie el scroll (header puede cambiar de tamaño)
    window.addEventListener('resize', updateHeaderOffset);
    window.addEventListener('scroll', updateHeaderOffset, { passive: true });

    // Usar MutationObserver para detectar cambios en el DOM del header
    const header = document.querySelector('header');
    if (header) {
      const observer = new MutationObserver(updateHeaderOffset);
      observer.observe(header, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        childList: true,
        subtree: true,
      });

      return () => {
        window.removeEventListener('resize', updateHeaderOffset);
        window.removeEventListener('scroll', updateHeaderOffset);
        observer.disconnect();
      };
    }

    return () => {
      window.removeEventListener('resize', updateHeaderOffset);
      window.removeEventListener('scroll', updateHeaderOffset);
    };
  }, []);

  return headerOffset;
}

