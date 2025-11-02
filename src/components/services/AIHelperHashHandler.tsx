"use client";

import { useEffect } from "react";

/**
 * Componente que maneja el scroll automático cuando la página carga con el hash #ai-helper
 * Esto asegura que cuando alguien accede a una URL como /servicios/plomeria#ai-helper,
 * la página automáticamente hace scroll a la sección del AI Helper.
 */
export default function AIHelperHashHandler() {
  useEffect(() => {
    // Función para hacer scroll al elemento ai-helper
    const scrollToAIHelper = () => {
      const aiHelperElement = document.getElementById("ai-helper");

      if (aiHelperElement) {
        // Pequeño delay para asegurar que el DOM esté completamente renderizado
        setTimeout(() => {
          aiHelperElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // Enfocar el elemento para mejor accesibilidad
          setTimeout(() => {
            aiHelperElement.focus({ preventScroll: true });
          }, 500);
        }, 100);
      }
    };

    // Verificar si hay hash en la URL al cargar la página
    if (window.location.hash === "#ai-helper") {
      // Esperar a que el DOM esté completamente cargado
      if (document.readyState === "complete") {
        scrollToAIHelper();
      } else {
        window.addEventListener("load", scrollToAIHelper);
      }
    }

    // Limpiar el event listener si el componente se desmonta
    return () => {
      window.removeEventListener("load", scrollToAIHelper);
    };
  }, []);

  return null; // Este componente no renderiza nada
}
