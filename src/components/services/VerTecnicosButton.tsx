"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import LoginPromptModal from "@/components/auth/LoginPromptModal";

interface VerTecnicosButtonProps {
  serviceName: string;
  className?: string;
  title?: string;
}

export default function VerTecnicosButton({
  serviceName,
  className = "bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-300 inline-flex items-center justify-center",
  title,
}: VerTecnicosButtonProps) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Si aún está cargando la autenticación, prevenir el click
    if (authLoading) {
      e.preventDefault();
      return;
    }

    // Si no está autenticado, mostrar modal en lugar de navegar
    if (!user) {
      e.preventDefault();
      setShowLoginModal(true);
      return;
    }

    // Si está autenticado, permitir navegación normal
    // El href del <a> manejará la navegación
  };

  return (
    <>
      <a
        href="/tecnicos"
        onClick={handleClick}
        className={className}
        title={title || `Ver técnicos especializados en ${serviceName.toLowerCase()}`}
      >
        <FontAwesomeIcon icon={faStar} className="mr-2" />
        Ver Técnicos
      </a>

      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectTo="/tecnicos"
        title="Acceso al Directorio de Profesionales"
        message={`Para ver el directorio completo de técnicos especializados en ${serviceName.toLowerCase()} y contactarlos directamente, necesitas iniciar sesión o crear una cuenta gratuita.`}
      />
    </>
  );
}

