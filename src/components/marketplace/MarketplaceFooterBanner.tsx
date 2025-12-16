"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faList } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

interface MarketplaceFooterBannerProps {
  productCount?: number;
}

export function MarketplaceFooterBanner({ productCount = 0 }: MarketplaceFooterBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const whatsappNumber = "525636741156";
  const whatsappMessage = `Hola, estoy buscando un artículo específico en el Marketplace de Sumee y no lo encontré. ¿Pueden ayudarme a buscarlo?`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-indigo-500 shadow-2xl animate-slide-up">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Mensaje */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-gray-900 font-semibold text-sm sm:text-base mb-1">
              ¿No encontraste lo que buscas?
            </p>
            <p className="text-gray-600 text-xs sm:text-sm">
              Envíanos un mensaje por WhatsApp y te ayudamos a encontrarlo
            </p>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Botón WhatsApp */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Botón Mostrar Todos */}
            <Link
              href="/marketplace/all"
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faList} className="text-sm" />
              <span className="hidden sm:inline">Ver Todos</span>
              <span className="sm:hidden">Todos</span>
            </Link>

            {/* Botón Cerrar */}
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              aria-label="Cerrar banner"
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

