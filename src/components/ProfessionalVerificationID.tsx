// src/components/ProfessionalVerificationID.tsx
"use client";

import React, { useState, useRef } from "react";
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
  faPercent,
  faMap,
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
  const [isDownloading, setIsDownloading] = useState<"image" | "pdf" | null>(
    null
  );
  const credentialRef = useRef<HTMLDivElement>(null);

  // Calcular tasa de aceptación
  // La tasa de aceptación se calcula como: (leads aceptados / leads disponibles) * 100
  const acceptedLeads = leads.filter(
    (lead) => lead.profesional_asignado_id === profesional.user_id
  );
  const totalLeadsAvailable = leads.length;
  const acceptanceRate =
    totalLeadsAvailable > 0
      ? Math.round((acceptedLeads.length / totalLeadsAvailable) * 100)
      : 0;

  // Calificar estrellas - SIEMPRE mostrar 5 estrellas
  const rating = profesional.calificacion_promedio || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  // Siempre mostramos 5 estrellas, rellenas según la calificación

  // Obtener áreas de servicio
  const areasServicio = profesional.areas_servicio || [];

  // Obtener zonas de trabajo
  const workZones = profesional.work_zones || [];

  // Número de trabajos completados
  const completedLeads = leads.filter(
    (lead) =>
      lead.profesional_asignado_id === profesional.user_id &&
      lead.estado === "completado"
  ).length;

  // URL de la página del profesional
  const professionalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/profesional/${profesional.user_id}`
      : "";

  // Obtener configuración de estilo actual
  const styleConfig = STYLE_CONFIGS[selectedStyle];

  // Función mejorada para descargar la credencial como imagen
  const handleDownloadImage = async () => {
    if (!credentialRef.current) {
      alert("Error: No se pudo encontrar la credencial.");
      return;
    }

    setIsDownloading("image");
    try {
      // Importar html2canvas dinámicamente
      const html2canvas = (await import("html2canvas")).default;

      // Esperar un momento para asegurar que todo esté renderizado
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Configuración mejorada para html2canvas
      const canvas = await html2canvas(credentialRef.current, {
        backgroundColor: "#ffffff",
        scale: 3, // Mayor resolución para mejor calidad
        logging: false,
        useCORS: true, // Permitir imágenes de otros dominios
        allowTaint: false,
        removeContainer: true,
        imageTimeout: 15000, // Timeout más largo para imágenes
        onclone: (clonedDoc) => {
          // Asegurar que las imágenes se carguen en el documento clonado
          const clonedElement = clonedDoc.getElementById(
            "professional-credential"
          );
          if (clonedElement) {
            // Forzar carga de imágenes
            const images = clonedElement.getElementsByTagName("img");
            Array.from(images).forEach((img) => {
              if (!img.complete) {
                img.crossOrigin = "anonymous";
              }
            });
          }
        },
      });

      // Convertir canvas a blob para mejor compatibilidad
      canvas.toBlob((blob) => {
        if (!blob) {
          alert("Error al generar la imagen. Intenta de nuevo.");
          setIsDownloading(null);
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `credencial-${
          profesional.full_name?.replace(/\s+/g, "-") || "profesional"
        }.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsDownloading(null);
      }, "image/png");
    } catch (error: any) {
      console.error("Error al descargar credencial:", error);
      alert(
        `Error al descargar la credencial: ${
          error.message || "Intenta de nuevo."
        }`
      );
      setIsDownloading(null);
    }
  };

  // Función mejorada para descargar la credencial como PDF
  const handleDownloadPDF = async () => {
    if (!credentialRef.current) {
      alert("Error: No se pudo encontrar la credencial.");
      return;
    }

    setIsDownloading("pdf");
    try {
      // Importar html2pdf dinámicamente
      const html2pdf = (await import("html2pdf.js")).default;

      // Esperar un momento para asegurar que todo esté renderizado
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Configuración mejorada para html2pdf
      const opt = {
        margin: [5, 5, 5, 5] as [number, number, number, number],
        filename: `credencial-${
          profesional.full_name?.replace(/\s+/g, "-") || "profesional"
        }.pdf`,
        image: { type: "jpeg" as const, quality: 0.95 },
        html2canvas: {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: false,
          imageTimeout: 15000,
        },
        jsPDF: {
          unit: "mm" as const,
          format: [210, 297] as [number, number], // A4
          orientation: "portrait" as const,
          compress: true,
        },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdf().set(opt).from(credentialRef.current).save();
      setIsDownloading(null);
    } catch (error: any) {
      console.error("Error al descargar PDF:", error);
      alert(
        `Error al descargar el PDF: ${error.message || "Intenta de nuevo."}`
      );
      setIsDownloading(null);
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

      {/* Credencial - Diseño mejorado con UX/UI profesional */}
      <div
        ref={credentialRef}
        id="professional-credential"
        className={`relative bg-gradient-to-br ${styleConfig.backgroundGradient} rounded-3xl shadow-2xl overflow-hidden border-4 ${styleConfig.borderColor} max-w-2xl mx-auto`}
      >
        {/* Header con logo y verificación - Diseño mejorado */}
        <div
          className={`relative px-8 pt-8 pb-6 border-b-2 ${styleConfig.borderColor} bg-white/80 backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Sumee Logo"
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
              <div>
                <h3
                  className="text-3xl font-black tracking-tight"
                  style={{ color: styleConfig.primaryColor }}
                >
                  Sumee
                </h3>
                <p className="text-xs text-gray-600 font-medium">
                  Plataforma de Servicios Profesionales
                </p>
              </div>
            </div>
            <div
              className="flex items-center space-x-2 text-white px-5 py-2.5 rounded-full shadow-lg font-bold text-sm"
              style={{
                background: `linear-gradient(135deg, ${styleConfig.accentColor}, ${styleConfig.primaryColor})`,
              }}
            >
              <FontAwesomeIcon icon={faShieldAlt} className="text-lg" />
              <span>Verificado</span>
            </div>
          </div>
        </div>

        {/* Contenido principal - Diseño mejorado */}
        <div className="p-8 space-y-6">
          {/* Foto y nombre - Diseño mejorado */}
          <div className="flex items-start space-x-6">
            <div
              className="relative w-36 h-36 rounded-2xl overflow-hidden border-4 shadow-xl flex-shrink-0"
              style={{ borderColor: styleConfig.primaryColor }}
            >
              {profesional.avatar_url ? (
                <Image
                  src={profesional.avatar_url}
                  alt={profesional.full_name || "Profesional"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-5xl font-black"
                  style={{
                    background: `linear-gradient(135deg, ${styleConfig.primaryColor}, ${styleConfig.secondaryColor})`,
                  }}
                >
                  {(profesional.full_name || "P")[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-black text-gray-900 mb-3 leading-tight">
                {profesional.full_name || "Nombre no disponible"}
              </h2>
              {profesional.numero_imss && (
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <FontAwesomeIcon
                    icon={faIdCard}
                    className="text-sm"
                    style={{ color: styleConfig.primaryColor }}
                  />
                  <span className="text-sm font-medium">
                    IMSS: {profesional.numero_imss}
                  </span>
                </div>
              )}
              {completedLeads > 0 && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <FontAwesomeIcon
                    icon={faBriefcase}
                    className="text-sm"
                    style={{ color: styleConfig.primaryColor }}
                  />
                  <span className="text-sm font-semibold">
                    {completedLeads} trabajo{completedLeads !== 1 ? "s" : ""}{" "}
                    completado{completedLeads !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Grid de métricas - Calificación y Tasa de Aceptación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Calificación Promedio - SIEMPRE 5 estrellas */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border-2 border-yellow-200 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Calificación
                </p>
                <FontAwesomeIcon
                  icon={faStar}
                  className="text-yellow-400 text-lg"
                />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                {/* SIEMPRE mostrar 5 estrellas */}
                {Array.from({ length: 5 }, (_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className={`text-2xl ${
                      i < fullStars
                        ? "text-yellow-400"
                        : i === fullStars && hasHalfStar
                        ? "text-yellow-300"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-2xl font-black text-gray-900">
                {rating > 0 ? rating.toFixed(1) : "0.0"}{" "}
                <span className="text-sm font-normal text-gray-500">/ 5.0</span>
              </p>
              {rating === 0 && (
                <p className="text-xs text-gray-500 mt-1">Sin calificar aún</p>
              )}
            </div>

            {/* Tasa de Aceptación - Nuevo diseño mejorado */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-200 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Tasa de Aceptación
                </p>
                <FontAwesomeIcon
                  icon={faPercent}
                  className="text-green-500 text-lg"
                />
              </div>
              <div className="flex items-center space-x-3 mb-2">
                <p
                  className="text-4xl font-black"
                  style={{ color: styleConfig.accentColor }}
                >
                  {acceptanceRate}%
                </p>
                {totalLeadsAvailable > 0 && (
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${acceptanceRate}%`,
                          backgroundColor: styleConfig.accentColor,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {acceptedLeads.length} de {totalLeadsAvailable} leads
                    </p>
                  </div>
                )}
              </div>
              {totalLeadsAvailable === 0 && (
                <p className="text-xs text-gray-500">Aún no hay datos</p>
              )}
            </div>
          </div>

          {/* Especialidades - CON "Especialista en" */}
          {areasServicio.length > 0 && (
            <div
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border-2 shadow-lg"
              style={{ borderColor: styleConfig.primaryColor }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <FontAwesomeIcon
                  icon={faBriefcase}
                  className="text-xl"
                  style={{ color: styleConfig.primaryColor }}
                />
                <div>
                  <p className="text-sm font-bold text-gray-700">
                    Especialista en
                  </p>
                  <p className="text-xs text-gray-500">
                    Áreas de servicio y especialidades
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {areasServicio.map((area, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${styleConfig.primaryColor}, ${styleConfig.secondaryColor})`,
                    }}
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Zonas de Trabajo - NUEVO */}
          {workZones.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <FontAwesomeIcon
                  icon={faMap}
                  className="text-xl text-blue-600"
                />
                <div>
                  <p className="text-sm font-bold text-gray-700">
                    Zonas de Trabajo
                  </p>
                  <p className="text-xs text-gray-500">
                    Ubicaciones donde presto servicios
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {workZones.map((zone, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-50 text-blue-700 border-2 border-blue-200"
                  >
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="mr-2 text-blue-500"
                    />
                    {zone}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* QR Code y fecha - Diseño mejorado */}
          <div
            className={`flex items-center justify-between pt-6 border-t-2 ${styleConfig.borderColor}`}
          >
            <div className="text-sm">
              <p className="text-gray-500 font-medium mb-1">
                Fecha de verificación:
              </p>
              <p className="font-black text-gray-900">
                {new Date().toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="bg-white p-3 rounded-xl shadow-lg border-2 border-gray-200">
                <QRCodeSVG
                  value={professionalUrl}
                  size={100}
                  level="H"
                  bgColor="#FFFFFF"
                  fgColor={styleConfig.primaryColor}
                />
              </div>
              <div
                className="flex items-center space-x-2"
                style={{ color: styleConfig.primaryColor }}
              >
                <FontAwesomeIcon icon={faQrcode} className="text-base" />
                <span className="text-xs font-bold">Código QR</span>
              </div>
              <p className="text-xs text-gray-500 text-center max-w-[100px] font-medium">
                Escanea para verificar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción - Diseño mejorado */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={handleDownloadImage}
          disabled={isDownloading !== null}
          className={`flex items-center space-x-3 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold ${
            isDownloading === "image" ? "animate-pulse" : ""
          }`}
        >
          {isDownloading === "image" ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generando...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faDownload} />
              <span>Descargar Imagen</span>
            </>
          )}
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading !== null}
          className={`flex items-center space-x-3 px-6 py-3.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold ${
            isDownloading === "pdf" ? "animate-pulse" : ""
          }`}
        >
          {isDownloading === "pdf" ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generando PDF...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faFilePdf} />
              <span>Descargar PDF</span>
            </>
          )}
        </button>
        <button
          onClick={handleShare}
          disabled={isDownloading !== null}
          className="flex items-center space-x-3 px-6 py-3.5 bg-white border-2 border-indigo-300 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold"
        >
          <FontAwesomeIcon icon={faShare} />
          <span>Compartir</span>
        </button>
      </div>

      {/* Mensaje informativo - Diseño mejorado */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 shadow-md">
        <div className="flex items-start space-x-4">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: styleConfig.primaryColor + "20" }}
          >
            <FontAwesomeIcon
              icon={faBriefcase}
              style={{ color: styleConfig.primaryColor }}
              className="text-xl"
            />
          </div>
          <div>
            <p className="font-bold text-gray-900 mb-2 text-lg">
              ¿Qué es esta credencial?
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
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

  // Obtener zonas de trabajo
  const workZones = profesional.work_zones || [];
  const areasServicio = profesional.areas_servicio || [];
  const rating = profesional.calificacion_promedio || 0;

  return `
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; padding: 32px; box-shadow: 0 8px 16px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb;">
        <h2 style="color: ${
          styleConfig.primaryColor
        }; margin: 0; font-size: 28px; font-weight: 900;">Sumee</h2>
        <p style="color: #666; margin: 4px 0 0 0; font-size: 12px;">Plataforma de Servicios Profesionales</p>
        <div style="display: inline-block; background: linear-gradient(135deg, ${
          styleConfig.accentColor
        }, ${
    styleConfig.primaryColor
  }); color: white; padding: 10px 20px; border-radius: 25px; margin-top: 12px; font-weight: 700;">
          ✓ Profesional Verificado
        </div>
      </div>
      <div style="text-align: center; margin-bottom: 24px;">
        <h3 style="color: #1f2937; margin: 0 0 8px 0; font-size: 24px; font-weight: 900;">${
          profesional.full_name || "Profesional"
        }</h3>
        ${
          profesional.numero_imss
            ? `<p style="color: #666; margin: 4px 0; font-size: 14px;">IMSS: ${profesional.numero_imss}</p>`
            : ""
        }
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div style="background: #fef3c7; border-radius: 16px; padding: 16px; border: 2px solid #fde68a;">
          <p style="color: #374151; margin: 0 0 8px 0; font-weight: 700; font-size: 11px; text-transform: uppercase;">Calificación</p>
          <p style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 900;">${
            rating > 0 ? rating.toFixed(1) : "0.0"
          } <span style="font-size: 14px; font-weight: 400; color: #6b7280;">/ 5.0</span></p>
        </div>
        <div style="background: #d1fae5; border-radius: 16px; padding: 16px; border: 2px solid #a7f3d0;">
          <p style="color: #374151; margin: 0 0 8px 0; font-weight: 700; font-size: 11px; text-transform: uppercase;">Tasa de Aceptación</p>
          <p style="color: ${
            styleConfig.accentColor
          }; margin: 0; font-size: 24px; font-weight: 900;">${acceptanceRate}%</p>
          ${
            totalLeadsAvailable > 0
              ? `<p style="color: #6b7280; margin: 4px 0 0 0; font-size: 12px;">${acceptedLeads.length} de ${totalLeadsAvailable} leads</p>`
              : '<p style="color: #6b7280; margin: 4px 0 0 0; font-size: 12px;">Aún no hay datos</p>'
          }
        </div>
      </div>
      ${
        areasServicio.length > 0
          ? `
        <div style="background: #f9fafb; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 2px solid ${
          styleConfig.primaryColor
        }40;">
          <p style="color: #374151; margin: 0 0 12px 0; font-weight: 700; font-size: 14px;">Especialista en</p>
          <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.8;">${areasServicio.join(
            ", "
          )}</p>
        </div>
      `
          : ""
      }
      ${
        workZones.length > 0
          ? `
        <div style="background: #eff6ff; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 2px solid #bfdbfe;">
          <p style="color: #374151; margin: 0 0 12px 0; font-weight: 700; font-size: 14px;">📍 Zonas de Trabajo</p>
          <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.8;">${workZones.join(
            ", "
          )}</p>
        </div>
      `
          : ""
      }
      <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
        <p style="color: #666; font-size: 12px; margin: 0 0 8px 0;">Verifica esta credencial en:</p>
        <a href="${professionalUrl}" style="color: ${
    styleConfig.primaryColor
  }; text-decoration: none; font-weight: 700; font-size: 14px;">${professionalUrl}</a>
      </div>
    </div>
  `;
}
