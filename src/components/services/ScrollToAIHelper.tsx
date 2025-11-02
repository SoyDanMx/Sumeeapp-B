"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

interface ScrollToAIHelperProps {
  serviceName: string;
  discipline?: string;
  className?: string;
}

export default function ScrollToAIHelper({
  serviceName,
  discipline,
  className = "",
}: ScrollToAIHelperProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Buscar el elemento con id="ai-helper"
    const aiHelperElement = document.getElementById("ai-helper");
    
    if (aiHelperElement) {
      // Primero hacer scroll suave al elemento
      aiHelperElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      
      // Luego disparar el evento personalizado para abrir el chat del AI Helper
      // Esto comunica con el componente DisciplineAIHelper
      setTimeout(() => {
        const openChatEvent = new CustomEvent('openAIHelperChat', {
          detail: {
            discipline: discipline || undefined,
            initialPrompt: `Necesito ayuda con ${serviceName.toLowerCase()}. ¿Qué servicios ofrecen?`
          }
        });
        
        window.dispatchEvent(openChatEvent);
      }, 300); // Pequeño delay para que el scroll comience primero
    } else {
      // Si no se encuentra el elemento, intentar abrir el chat de todas formas
      // Esto puede pasar si el componente aún no se ha renderizado
      const openChatEvent = new CustomEvent('openAIHelperChat', {
        detail: {
          discipline: discipline || undefined,
          initialPrompt: `Necesito ayuda con ${serviceName.toLowerCase()}. ¿Qué servicios ofrecen?`
        }
      });
      
      window.dispatchEvent(openChatEvent);
      
      // También hacer scroll al final de la página
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center ${className}`}
      title={`Consultar con IA especialista en ${serviceName.toLowerCase()}`}
    >
      <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" />
      Consultar IA
    </button>
  );
}

