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
                {/* Icono animado del robot */}
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 transform group-hover:scale-110 transition-transform duration-300">
                    <FontAwesomeIcon
                      icon={faRobot}
                      className="text-4xl md:text-5xl text-white drop-shadow-lg animate-float"
                    />
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

                  {/* Contenido del botón */}
                  <span className="relative flex items-center gap-3">
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faRobot}
                        className="text-xl md:text-2xl animate-pulse"
                      />
                      <div className="absolute inset-0 bg-white/50 rounded-full blur-md"></div>
                    </div>
                    <span className="relative z-10">
                      Iniciar Diagnóstico AI
                    </span>
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="relative z-10 transform group-hover/btn:translate-x-1 transition-transform"
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
