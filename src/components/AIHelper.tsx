// src/components/AIHelper.tsx
"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faRobot,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { AIDiagnosisChatbot } from "./AIDiagnosisChatbot";

// Componente de Burbuja de Chat con IA (Diseño Optimizado UX/UI)
// Basado en principios: Claridad visual, Jerarquía, Feedback, Accesibilidad
const AIChatBubbleIcon = ({
  className = "w-16 h-16",
  variant = "default", // "default" | "compact" para diferentes contextos
}: {
  className?: string;
  variant?: "default" | "compact";
}) => {
  const isCompact = variant === "compact";
  const chatBubbleId = `chatGradient-${variant}`;
  const starId = `starGlow-${variant}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Asistente de IA"
    >
      <defs>
        {/* Gradiente principal optimizado para contraste y legibilidad */}
        <linearGradient id={chatBubbleId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
          <stop offset="50%" stopColor="#6366F1" stopOpacity="1" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="1" />
        </linearGradient>

        {/* Resplandor para la estrella (efecto de profundidad) */}
        <radialGradient id={starId} cx="50%" cy="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#FFA500" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FF6347" stopOpacity="0" />
        </radialGradient>

        {/* Sombra suave para profundidad (principio de elevación) */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Burbuja de chat principal con esquinas más suaves (mejor percepción visual) */}
      <path
        d="M 20 15 Q 15 15 15 20 L 15 60 Q 15 65 20 65 L 40 65 L 50 75 L 60 65 L 80 65 Q 85 65 85 60 L 85 20 Q 85 15 80 15 Z"
        fill={`url(#${chatBubbleId})`}
        filter="url(#shadow)"
        className="transition-all duration-300"
      />

      {/* Líneas de texto con variación de longitud (principio de naturalidad) */}
      {/* Línea 1 - Corta */}
      <rect
        x="25"
        y="28"
        width="28"
        height="3.5"
        rx="1.75"
        fill="white"
        opacity="0.95"
        className="transition-opacity duration-300"
      />
      {/* Línea 2 - Larga (acento visual) */}
      <rect
        x="25"
        y="38"
        width="42"
        height="3.5"
        rx="1.75"
        fill="white"
        opacity="0.95"
        className="transition-opacity duration-300"
      />
      {/* Línea 3 - Media */}
      <rect
        x="25"
        y="48"
        width="32"
        height="3.5"
        rx="1.75"
        fill="white"
        opacity="0.85"
        className="transition-opacity duration-300"
      />

      {/* Estrella/Brillo mejorado (indicador de inteligencia IA) */}
      <g transform="translate(68, 32)">
        {/* Resplandor de fondo */}
        <circle cx="0" cy="0" r="8" fill={`url(#${starId})`} opacity="0.6" />

        {/* Estrella principal con mejor definición */}
        <path
          d="M 0 -7 L 1.5 -2 L 6.5 -2 L 2.5 1 L 4.5 6 L 0 3.5 L -4.5 6 L -2.5 1 L -6.5 -2 L -1.5 -2 Z"
          fill="#FFD700"
          stroke="#FFA500"
          strokeWidth="0.5"
          opacity="1"
        />

        {/* Punto central brillante */}
        <circle cx="0" cy="0" r="1.5" fill="#FFF" opacity="0.9" />
      </g>

      {/* Punto de conexión inferior mejorado (cola de la burbuja) */}
      <path
        d="M 48 73 Q 50 75 52 73 L 50 78 Z"
        fill={`url(#${chatBubbleId})`}
        opacity="0.9"
      />

      {/* Indicador de actividad (punto pulsante) - Feedback visual */}
      {!isCompact && (
        <circle
          cx="75"
          cy="25"
          r="3"
          fill="#10B981"
          opacity="0.8"
          className="animate-pulse"
        >
          <animate
            attributeName="opacity"
            values="0.8;0.3;0.8"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  );
};

export const AIHelper = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <section
      className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden"
      id="ai-helper"
    >
      {/* Efectos de fondo futuristas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          {/* Badge premium */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              POWERED BY GOOGLE GEMINI AI
            </span>
          </div>

          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <FontAwesomeIcon
              icon={faBrain}
              className="relative text-6xl md:text-7xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent filter drop-shadow-lg"
            />
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent leading-tight">
            ¿No sabes a quién necesitas?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Describe tu problema y deja que nuestra{" "}
            <span className="font-semibold text-blue-600">IA avanzada</span> te
            guíe al profesional perfecto
          </p>
        </div>

        {/* Botón principal futurista para abrir el chatbot */}
        <div className="max-w-3xl mx-auto">
          <div className="relative group">
            {/* Efecto de resplandor exterior */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

            {/* Contenedor principal con glassmorphism */}
            <div className="relative bg-gradient-to-br from-white/90 via-blue-50/50 to-purple-50/30 backdrop-blur-xl border border-white/20 rounded-2xl p-8 md:p-12 shadow-2xl">
              {/* Partículas decorativas */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse animation-delay-1000"></div>

              <div className="text-center">
                {/* Icono animado de burbuja de chat con IA - Optimizado UX/UI */}
                <div className="relative inline-block mb-6">
                  {/* Resplandor de fondo (principio de jerarquía visual) */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>

                  {/* Contenedor principal con glassmorphism mejorado */}
                  <div className="relative bg-gradient-to-br from-white/95 via-blue-50/90 to-purple-50/85 backdrop-blur-xl rounded-2xl p-5 md:p-6 transform group-hover:scale-105 transition-all duration-300 shadow-xl border border-white/30">
                    {/* Efecto de brillo sutil al hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Icono con animación flotante suave */}
                    <div className="relative drop-shadow-xl animate-float">
                      <AIChatBubbleIcon
                        className="w-16 h-16 md:w-20 md:h-20"
                        variant="default"
                      />
                    </div>

                    {/* Partículas decorativas (microinteracciones) */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse opacity-60"></div>
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent">
                  Iniciar Diagnóstico AI
                </h3>
                <p className="text-gray-600 mb-8 text-base md:text-lg max-w-xl mx-auto">
                  Nuestro asistente inteligente analizará tu problema en
                  segundos y te conectará con el técnico perfecto verificado
                </p>

                {/* Botón principal futurista */}
                <button
                  onClick={() => setIsChatbotOpen(true)}
                  className="relative group/btn inline-flex items-center justify-center gap-3 px-8 md:px-12 py-4 md:py-5 text-base md:text-lg font-bold text-white rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                    backgroundSize: "200% 200%",
                    animation: "gradientShift 3s ease infinite",
                  }}
                >
                  {/* Efecto de brillo animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>

                  {/* Contenido del botón - Mejorado para accesibilidad y feedback */}
                  <span className="relative flex items-center gap-3">
                    {/* Icono compacto con feedback visual */}
                    <div className="relative w-6 h-6 md:w-7 md:h-7 flex-shrink-0">
                      <div className="transform group-hover/btn:scale-110 transition-transform duration-300">
                        <AIChatBubbleIcon
                          className="w-full h-full"
                          variant="compact"
                        />
                      </div>
                      {/* Resplandor sutil al hover */}
                      <div className="absolute inset-0 bg-white/40 rounded-full blur-sm opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Texto con mejor contraste */}
                    <span className="relative z-10 font-semibold text-base md:text-lg">
                      Iniciar Diagnóstico AI
                    </span>

                    {/* Flecha con animación mejorada (principio de affordance) */}
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="relative z-10 transform group-hover/btn:translate-x-2 transition-all duration-300 opacity-90 group-hover/btn:opacity-100"
                    />
                  </span>

                  {/* Efecto de borde brillante */}
                  <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                </button>

                {/* Badges de características */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-8 pt-8 border-t border-gray-200/50">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Respuesta instantánea</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>IA avanzada Gemini</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>Técnicos verificados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal del Chatbot de Diagnóstico */}
      <AIDiagnosisChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </section>
  );
};
