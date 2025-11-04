// src/components/ProfessionalVerificationID.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import QRCodeSVG from "react-qr-code";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faStar,
  faCheckCircle,
  faMapMarkerAlt,
  faBriefcase,
  faIdCard,
  faDownload,
  faShare,
  faQrcode,
  faPalette,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import { Profesional, Lead } from "@/types/supabase";

interface ProfessionalVerificationIDProps {
  profesional: Profesional;
  leads?: Lead[]; // Para calcular tasa de aceptación
  showCustomization?: boolean; // Mostrar opciones de personalización
}

// Estilos predefinidos para la credencial
type CredentialStyle = "classic" | "modern" | "elegant" | "vibrant";

interface StyleConfig {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundGradient: string;
  borderColor: string;
}

const STYLE_CONFIGS: Record<CredentialStyle, StyleConfig> = {
  classic: {
    name: "Clásico",
    primaryColor: "#4F46E5", // indigo
    secondaryColor: "#2563EB", // blue
    accentColor: "#10B981", // green
    backgroundGradient: "from-white via-blue-50 to-indigo-50",
    borderColor: "border-indigo-200",
  },
  modern: {
    name: "Moderno",
    primaryColor: "#7C3AED", // purple
    secondaryColor: "#EC4899", // pink
    accentColor: "#F59E0B", // amber
    backgroundGradient: "from-white via-purple-50 to-pink-50",
    borderColor: "border-purple-200",
  },
  elegant: {
    name: "Elegante",
    primaryColor: "#1F2937", // gray
    secondaryColor: "#374151", // gray-700
    accentColor: "#059669", // emerald
    backgroundGradient: "from-white via-gray-50 to-gray-100",
    borderColor: "border-gray-300",
  },
  vibrant: {
    name: "Vibrante",
    primaryColor: "#DC2626", // red
    secondaryColor: "#EA580C", // orange
    accentColor: "#CA8A04", // yellow
    backgroundGradient: "from-white via-orange-50 to-red-50",
    borderColor: "border-orange-200",
  },
};

export default function ProfessionalVerificationID({
  profesional,
  leads = [],
  showCustomization = true,
}: ProfessionalVerificationIDProps) {
  const [selectedStyle, setSelectedStyle] =
    useState<CredentialStyle>("classic");

  // Calcular tasa de aceptación
  const acceptedLeads = leads.filter(
    (lead) => lead.profesional_asignado_id === profesional.user_id
  );
  const totalLeadsAvailable = leads.length;
  const acceptanceRate =
    totalLeadsAvailable > 0
      ? Math.round((acceptedLeads.length / totalLeadsAvailable) * 100)
      : 0;

  // Calificar estrellas
  const rating = profesional.calificacion_promedio || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  // Obtener áreas de servicio
  const areasServicio = profesional.areas_servicio || [];

  // Número de trabajos completados
  const completedLeads = leads.filter(
    (lead) =>
      lead.profesional_asignado_id === profesional.user_id &&
      lead.estado === "completado"
  ).length;

  // URL de la página del profesional
  const professionalUrl = `${window.location.origin}/profesional/${profesional.user_id}`;

  // Obtener configuración de estilo actual
  const styleConfig = STYLE_CONFIGS[selectedStyle];

  // Función para descargar la credencial como imagen (usando html2canvas)
  const handleDownloadImage = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const element = document.getElementById("professional-credential");
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `credencial-${
        profesional.full_name || "profesional"
      }.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error al descargar credencial:", error);
      alert("Error al descargar la credencial. Intenta de nuevo.");
    }
  };

  // Función para descargar la credencial como PDF
  const handleDownloadPDF = async () => {
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("professional-credential");
      if (!element) return;

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `credencial-${profesional.full_name || "profesional"}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, logging: false },
        jsPDF: {
          unit: "mm" as const,
          format: "a4" as const,
          orientation: "portrait" as const,
        },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      alert("Error al descargar el PDF. Intenta de nuevo.");
    }
  };

  // Función para compartir
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Credencial de ${
            profesional.full_name || "Profesional Verificado"
          }`,
          text: `Verifica la credencial de ${
            profesional.full_name || "este profesional"
          }`,
          url: professionalUrl,
        });
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(professionalUrl);
        alert("Link copiado al portapapeles");
      }
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de estilo (si está habilitado) */}
      {showCustomization && (
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faPalette} className="text-indigo-500" />
              <h3 className="font-semibold text-gray-800">
                Personalizar Estilo
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(STYLE_CONFIGS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedStyle(key as CredentialStyle)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedStyle === key
                    ? "border-indigo-500 bg-indigo-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className="h-8 rounded mb-2"
                  style={{
                    background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`,
                  }}
                />
                <p className="text-xs font-medium text-gray-700">
                  {config.name}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Credencial */}
      <div
        id="professional-credential"
        className={`relative bg-gradient-to-br ${styleConfig.backgroundGradient} rounded-2xl shadow-2xl p-8 border-4 ${styleConfig.borderColor} max-w-2xl mx-auto`}
      >
        {/* Header con logo y verificación */}
        <div
          className={`flex items-center justify-between mb-6 pb-6 border-b-2 ${styleConfig.borderColor}`}
        >
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16">
              <Image
                src="/logo.png"
                alt="Sumee Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h3
                className="text-2xl font-bold"
                style={{ color: styleConfig.primaryColor }}
              >
                Sumee
              </h3>
              <p className="text-sm text-gray-600">Plataforma de Servicios</p>
            </div>
          </div>
          <div
            className="flex items-center space-x-2 text-white px-4 py-2 rounded-full shadow-lg"
            style={{ backgroundColor: styleConfig.accentColor }}
          >
            <FontAwesomeIcon icon={faShieldAlt} className="text-lg" />
            <span className="font-bold text-sm">Profesional Verificado</span>
          </div>
        </div>

        {/* Información del profesional */}
        <div className="space-y-6">
          {/* Foto y nombre */}
          <div className="flex items-center space-x-6">
            <div
              className="relative w-32 h-32 rounded-full overflow-hidden border-4 shadow-xl"
              style={{ borderColor: styleConfig.primaryColor }}
            >
              {profesional.avatar_url ? (
                <Image
                  src={profesional.avatar_url}
                  alt={profesional.full_name || "Profesional"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-4xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${styleConfig.primaryColor}, ${styleConfig.secondaryColor})`,
                  }}
                >
                  {(profesional.full_name || "P")[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {profesional.full_name || "Nombre no disponible"}
              </h2>
              <div className="flex items-center space-x-4 text-gray-600">
                {profesional.numero_imss && (
                  <div className="flex items-center space-x-2">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      style={{ color: styleConfig.primaryColor }}
                    />
                    <span className="text-sm">
                      IMSS: {profesional.numero_imss}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Calificación */}
          <div className="bg-white rounded-xl p-4 border-2 border-yellow-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Calificación Promedio
                </p>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className={`text-xl ${
                        i < fullStars
                          ? "text-yellow-400"
                          : i === fullStars && hasHalfStar
                          ? "text-yellow-300"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="font-semibold text-gray-700 ml-2">
                    {rating > 0 ? rating.toFixed(1) : "Sin calificar"}
                  </span>
                </div>
              </div>
              {completedLeads > 0 && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Trabajos completados</p>
                  <p
                    className="text-2xl font-bold"
                    style={{ color: styleConfig.primaryColor }}
                  >
                    {completedLeads}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tasa de aceptación */}
          {totalLeadsAvailable > 0 && (
            <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Tasa de Aceptación
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {acceptanceRate}%
                  </p>
                  {acceptedLeads.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {acceptedLeads.length} de {totalLeadsAvailable} leads
                    </p>
                  )}
                </div>
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-4xl text-green-400"
                />
              </div>
            </div>
          )}

          {/* Área de servicio y oficios */}
          <div
            className="bg-white rounded-xl p-4 border-2 shadow-md"
            style={{ borderColor: styleConfig.primaryColor }}
          >
            <div className="flex items-start space-x-3 mb-3">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="text-xl mt-1"
                style={{ color: styleConfig.primaryColor }}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Áreas de Servicio
                </p>
                {areasServicio.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {areasServicio.map((area, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: styleConfig.primaryColor }}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No se han definido áreas de servicio
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* QR Code y fecha */}
          <div
            className={`flex items-center justify-between pt-4 border-t-2 ${styleConfig.borderColor}`}
          >
            <div className="text-xs text-gray-500">
              <p>Fecha de verificación:</p>
              <p className="font-semibold">
                {new Date().toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="bg-white p-2 rounded-lg shadow-md">
                <QRCodeSVG
                  value={professionalUrl}
                  size={80}
                  level="H"
                  bgColor="#FFFFFF"
                  fgColor={styleConfig.primaryColor}
                />
              </div>
              <div
                className="flex items-center space-x-2"
                style={{ color: styleConfig.primaryColor }}
              >
                <FontAwesomeIcon icon={faQrcode} className="text-sm" />
                <span className="text-xs font-medium">Código QR</span>
              </div>
              <p className="text-xs text-gray-500 text-center max-w-[80px]">
                Escanea para verificar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handleDownloadImage}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          <FontAwesomeIcon icon={faDownload} />
          <span>Descargar Imagen</span>
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          <FontAwesomeIcon icon={faFilePdf} />
          <span>Descargar PDF</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-indigo-300 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faShare} />
          <span>Compartir</span>
        </button>
      </div>

      {/* Mensaje informativo */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <FontAwesomeIcon icon={faBriefcase} className="text-blue-500 mt-1" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">
              ¿Qué es esta credencial?
            </p>
            <p className="text-sm text-blue-700">
              Esta credencial se enviará automáticamente a los clientes cuando
              aceptes un trabajo. Les da certeza y seguridad de que eres un
              profesional verificado por Sumee. El código QR permite verificar
              tu identidad en cualquier momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Función helper para generar la credencial como HTML (para envío automático)
export function generateCredentialHTML(
  profesional: Profesional,
  leads: Lead[] = [],
  style: CredentialStyle = "classic"
): string {
  // Esta función generará HTML para enviar por email/WhatsApp
  // Por ahora, devolvemos una versión simplificada
  const styleConfig = STYLE_CONFIGS[style];
  const professionalUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/profesional/${profesional.user_id}`;

  // Calcular métricas
  const acceptedLeads = leads.filter(
    (lead) => lead.profesional_asignado_id === profesional.user_id
  );
  const totalLeadsAvailable = leads.length;
  const acceptanceRate =
    totalLeadsAvailable > 0
      ? Math.round((acceptedLeads.length / totalLeadsAvailable) * 100)
      : 0;
  const completedLeads = leads.filter(
    (lead) =>
      lead.profesional_asignado_id === profesional.user_id &&
      lead.estado === "completado"
  ).length;

  return `
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: ${styleConfig.primaryColor}; margin: 0;">Sumee</h2>
        <p style="color: #666; margin: 4px 0 0 0;">Plataforma de Servicios</p>
        <div style="display: inline-block; background: ${
          styleConfig.accentColor
        }; color: white; padding: 8px 16px; border-radius: 20px; margin-top: 8px;">
          ✓ Profesional Verificado
        </div>
      </div>
      <div style="text-align: center; margin-bottom: 24px;">
        <h3 style="color: #1f2937; margin: 0 0 8px 0;">${
          profesional.full_name || "Profesional"
        }</h3>
        ${
          profesional.numero_imss
            ? `<p style="color: #666; margin: 4px 0;">IMSS: ${profesional.numero_imss}</p>`
            : ""
        }
      </div>
      <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <p style="color: #374151; margin: 0 0 8px 0; font-weight: 600;">Calificación: ${
          profesional.calificacion_promedio
            ? profesional.calificacion_promedio.toFixed(1)
            : "Sin calificar"
        }/5.0</p>
        <p style="color: #374151; margin: 0 0 8px 0;">Trabajos completados: ${completedLeads}</p>
        ${
          totalLeadsAvailable > 0
            ? `<p style="color: #374151; margin: 0;">Tasa de aceptación: ${acceptanceRate}%</p>`
            : ""
        }
      </div>
      ${
        profesional.areas_servicio && profesional.areas_servicio.length > 0
          ? `
        <div style="margin-bottom: 16px;">
          <p style="color: #374151; margin: 0 0 8px 0; font-weight: 600;">Áreas de Servicio:</p>
          <p style="color: #666; margin: 0;">${profesional.areas_servicio.join(
            ", "
          )}</p>
        </div>
      `
          : ""
      }
      <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
        <p style="color: #666; font-size: 12px; margin: 0;">Verifica esta credencial en:</p>
        <a href="${professionalUrl}" style="color: ${
    styleConfig.primaryColor
  }; text-decoration: none; font-weight: 600;">${professionalUrl}</a>
      </div>
    </div>
  `;
}
