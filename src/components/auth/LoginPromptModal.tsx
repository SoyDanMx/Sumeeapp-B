"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUser,
  faUserPlus,
  faLock,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
  title?: string;
  message?: string;
}

export default function LoginPromptModal({
  isOpen,
  onClose,
  redirectTo = "/tecnicos",
  title = "Acceso Requerido",
  message = "Para ver el directorio de profesionales y contactar técnicos verificados, necesitas iniciar sesión.",
}: LoginPromptModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    // Guardar la URL de destino en sessionStorage para redirigir después del login
    if (redirectTo) {
      sessionStorage.setItem("redirectAfterLogin", redirectTo);
    }
    router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  };

  const handleRegister = () => {
    // Guardar la URL de destino en sessionStorage para redirigir después del registro
    if (redirectTo) {
      sessionStorage.setItem("redirectAfterLogin", redirectTo);
    }
    router.push(`/registro-cliente?redirect=${encodeURIComponent(redirectTo)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Cerrar"
          >
            <FontAwesomeIcon icon={faTimes} className="text-white text-sm" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldAlt} className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-white/90 text-sm">Acceso seguro y verificado</p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700 leading-relaxed">{message}</p>

          {/* Beneficios */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 space-y-3 border border-blue-100">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">
              Al iniciar sesión podrás:
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-sm text-gray-700">
                  Ver el directorio completo de profesionales verificados
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-sm text-gray-700">
                  Contactar directamente con técnicos por WhatsApp
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-sm text-gray-700">
                  Ver ubicación en tiempo real y distancias
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-sm text-gray-700">
                  Solicitar servicios con asistente AI inteligente
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faUser} />
              Iniciar Sesión
            </button>
            
            <button
              onClick={handleRegister}
              className="w-full bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faUserPlus} />
              Crear Cuenta Gratis
            </button>
          </div>

          {/* Texto de seguridad */}
          <p className="text-xs text-gray-500 text-center pt-2 flex items-center justify-center gap-1">
            <FontAwesomeIcon icon={faLock} className="text-xs" />
            Tus datos están protegidos y seguros
          </p>
        </div>
      </div>
    </div>
  );
}

