"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { clearAuthSession } from "@/lib/auth-utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faRefresh,
  faHome,
  faCheckCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

export default function AuthErrorPage() {
  const [isClearing, setIsClearing] = useState(true);
  const [isCleared, setIsCleared] = useState(false);

  useEffect(() => {
    const clearSession = async () => {
      try {
        setIsClearing(true);
        await clearAuthSession();
        setIsCleared(true);
        setIsClearing(false);
      } catch (error) {
        console.error("Error clearing session:", error);
        setIsClearing(false);
      }
    };

    clearSession();
  }, []);

  const handleRetry = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <FontAwesomeIcon
            icon={
              isClearing
                ? faSpinner
                : isCleared
                ? faCheckCircle
                : faExclamationTriangle
            }
            className={`text-6xl mb-4 ${
              isClearing
                ? "text-blue-500 animate-spin"
                : isCleared
                ? "text-green-500"
                : "text-yellow-500"
            }`}
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isClearing
              ? "Limpiando Sesión..."
              : isCleared
              ? "Sesión Limpiada"
              : "Error de Autenticación"}
          </h1>
          <p className="text-gray-600">
            {isClearing
              ? "Estamos limpiando tu sesión para resolver el problema..."
              : isCleared
              ? "Tu sesión ha sido limpiada exitosamente. Puedes continuar."
              : "Ha ocurrido un problema con tu sesión. Esto puede suceder cuando:"}
          </p>
        </div>

        {!isClearing && !isCleared && (
          <div className="text-left mb-6 space-y-2 text-sm text-gray-600">
            <p>• Tu sesión ha expirado</p>
            <p>• Hay un problema con el token de autenticación</p>
            <p>• Tu cuenta fue eliminada o suspendida</p>
            <p>
              • El error &quot;Auth session missing&quot; indica una sesión
              corrupta
            </p>
          </div>
        )}

        <div className="space-y-3">
          {isCleared && (
            <button
              onClick={handleRetry}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FontAwesomeIcon icon={faRefresh} />
              <span>Continuar</span>
            </button>
          )}

          {!isClearing && !isCleared && (
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FontAwesomeIcon icon={faRefresh} />
              <span>Reintentar</span>
            </button>
          )}

          <Link
            href="/"
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Ir al Inicio</span>
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Si el problema persiste, por favor contacta a soporte.</p>
          <p className="mt-2 text-blue-600">
            <a
              href="https://wa.me/525636741156?text=Hola,%20tengo%20un%20problema%20con%20la%20autenticación%20en%20Sumee%20App"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Contactar por WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
