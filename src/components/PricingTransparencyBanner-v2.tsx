"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp as faWhatsappBrand } from "@fortawesome/free-brands-svg-icons";

export const PricingTransparencyBannerV2 = () => {
  const whatsappNumber = "525636741156"; // Número de WhatsApp de soporte
  const whatsappDisplay = "56 3674 1156"; // Número para mostrar
  const whatsappMessage = encodeURIComponent(
    "Hola, tengo dudas sobre la tarifa de revisión y cómo funciona. ¿Podrían ayudarme?"
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 py-4 px-4 shadow-sm">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-green-500 text-xl flex-shrink-0 mt-1"
          />
          <div className="flex-1">
            <p className="text-gray-800 font-medium text-sm sm:text-base leading-relaxed">
              <span className="font-semibold text-green-700">
                Precio claro desde el inicio:
              </span>{" "}
              Tarifa de Revisión desde $350 MXN, incluida en tu presupuesto
              final.{" "}
              <span className="text-gray-600">
                ¿Preguntas?{" "}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 font-semibold underline transition-colors"
                >
                  Escríbenos al {whatsappDisplay}
                  <FontAwesomeIcon
                    icon={faWhatsappBrand}
                    className="text-base ml-1"
                  />
                </a>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
