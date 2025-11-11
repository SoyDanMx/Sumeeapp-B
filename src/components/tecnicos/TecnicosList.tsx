"use client";

import { useEffect, useRef, useState } from "react";
import TecnicoCardCompact from "./TecnicoCardCompact";
import TecnicoDetailsModal from "./TecnicoDetailsModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

interface Professional {
  user_id: string;
  full_name: string;
  email?: string;
  profession?: string;
  avatar_url?: string | null;
  whatsapp?: string;
  calificacion_promedio?: number;
  ubicacion_lat?: number;
  ubicacion_lng?: number;
  areas_servicio?: string[];
  distance?: number;
  total_reviews?: number;
  verified?: boolean;
}

interface TecnicosListProps {
  professionals: Professional[];
  selectedId?: string | null;
  onSelect?: (professionalId: string) => void;
  loading?: boolean;
}

export default function TecnicosList({
  professionals,
  selectedId,
  onSelect,
  loading = false,
}: TecnicosListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);

  // Auto-scroll al seleccionado
  useEffect(() => {
    if (selectedId && cardRefs.current[selectedId]) {
      cardRefs.current[selectedId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedId]);

  const handleCardClick = (professional: Professional) => {
    onSelect?.(professional.user_id);
    setSelectedProfessional(professional);
    setDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-4xl text-indigo-600 animate-spin mb-4"
          />
          <p className="text-gray-600">Buscando profesionales cercanos...</p>
        </div>
      </div>
    );
  }

  if (professionals.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-3xl text-gray-400"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron profesionales
          </h3>
          <p className="text-sm text-gray-600">
            Intenta ajustar los filtros o aumentar el radio de búsqueda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={listRef}
        className="h-full overflow-y-auto overscroll-contain"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#CBD5E0 #F7FAFC",
        }}
      >
        {/* Results Count - Sticky Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-4 py-2.5 border-b border-gray-200 shadow-sm">
          <p className="text-xs sm:text-sm font-semibold text-gray-700">
            {professionals.length}{" "}
            {professionals.length === 1 ? "profesional" : "profesionales"} cerca de ti
          </p>
        </div>

        {/* List - Cards Compactas */}
        <div className="divide-y divide-gray-100">
          {professionals.map((professional) => (
            <div
              key={professional.user_id}
              ref={(el) => {
                cardRefs.current[professional.user_id] = el;
              }}
            >
              <TecnicoCardCompact
                professional={professional}
                isSelected={selectedId === professional.user_id}
                onClick={() => handleCardClick(professional)}
                onContactClick={() => {
                  // Track contacto
                  console.log("Contactando a:", professional.full_name);
                }}
              />
            </div>
          ))}
        </div>

        {/* Bottom Padding */}
        <div className="h-2"></div>
      </div>

      {/* Modal de Detalles */}
      <TecnicoDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedProfessional(null);
        }}
        professional={selectedProfessional}
      />
    </>
  );
}
