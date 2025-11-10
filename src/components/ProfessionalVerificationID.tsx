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

// Función auxiliar para convertir gradientes de Tailwind a valores hexadecimales
// Esto evita el error "oklch" con html2canvas
function getBackgroundGradientHex(style: CredentialStyle): string {
  const gradients: Record<CredentialStyle, string> = {
    classic: "linear-gradient(135deg, #ffffff 0%, #eff6ff 50%, #eef2ff 100%)", // white -> blue-50 -> indigo-50
    modern: "linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #fdf2f8 100%)", // white -> purple-50 -> pink-50
    elegant: "linear-gradient(135deg, #ffffff 0%, #f9fafb 50%, #f3f4f6 100%)", // white -> gray-50 -> gray-100
    vibrant: "linear-gradient(135deg, #ffffff 0%, #fff7ed 50%, #fef2f2 100%)", // white -> orange-50 -> red-50
  };
  return gradients[style];
}

function getBorderColorHex(style: CredentialStyle): string {
  const colors: Record<CredentialStyle, string> = {
    classic: "#c7d2fe", // indigo-200
    modern: "#e9d5ff", // purple-200
    elegant: "#d1d5db", // gray-300
    vibrant: "#fed7aa", // orange-200
  };
  return colors[style];
}

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

  // Calificar estrellas - Todos los profesionales parten con 5 estrellas
  // La calificación se modifica según reseñas y acciones de usuarios
  const rating = profesional.calificacion_promedio ?? 5;
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

      // ANTES de clonar: Procesar el DOM original para convertir todos los colores oklch
      // Esto es crítico porque html2canvas puede procesar algunos elementos antes de que onclone se ejecute
      const originalElement = credentialRef.current;
      if (originalElement) {
        // Función auxiliar para convertir colores oklch
        const convertOklchToRgb = (color: string): string => {
          if (
            !color ||
            color === "transparent" ||
            color === "none" ||
            color === "currentColor"
          ) {
            return color;
          }
          // Usar expresión regular más robusta para detectar oklch/oklab
          const oklchRegex =
            /oklch\s*\([^)]*\)|oklab\s*\([^)]*\)|lab\s*\([^)]*\)|lch\s*\([^)]*\)/i;
          if (
            oklchRegex.test(color) ||
            color.includes("color-mix") ||
            color.includes("display-p3")
          ) {
            return "rgba(79, 70, 229, 1)"; // Fallback indigo
          }
          // Si ya es un formato seguro, devolverlo tal cual
          if (
            color.includes("rgba") ||
            color.includes("rgb(") ||
            color.startsWith("#")
          ) {
            return color;
          }
          return color;
        };

        // Procesar TODOS los elementos, no solo SVG
        const allElements = originalElement.querySelectorAll("*");
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const computedStyle = window.getComputedStyle(htmlEl);

          // Procesar todas las propiedades de color posibles
          const colorProperties = [
            "color",
            "backgroundColor",
            "borderColor",
            "outlineColor",
            "fill",
            "stroke",
            "stopColor",
          ];

          colorProperties.forEach((prop) => {
            try {
              const value =
                (computedStyle as any)[prop] ||
                htmlEl.style.getPropertyValue(prop);
              if (
                value &&
                value !== "none" &&
                value !== "transparent" &&
                value !== "rgba(0, 0, 0, 0)"
              ) {
                const converted = convertOklchToRgb(value);
                if (converted !== value) {
                  htmlEl.style.setProperty(prop, converted, "important");
                }
              }
            } catch (e) {
              // Ignorar propiedades que no existen
            }
          });

          // Procesar backgroundImage (puede contener gradientes con oklch)
          const bgImage = computedStyle.backgroundImage;
          if (bgImage && bgImage !== "none") {
            const oklchRegex =
              /oklch\s*\([^)]*\)|oklab\s*\([^)]*\)|lab\s*\([^)]*\)|lch\s*\([^)]*\)/i;
            if (oklchRegex.test(bgImage) || bgImage.includes("color-mix")) {
              htmlEl.style.backgroundImage =
                "linear-gradient(135deg, rgba(79, 70, 229, 1) 0%, rgba(37, 99, 235, 1) 100%)";
            }
          }
        });

        // Procesar también atributos SVG específicos
        const allOriginalSVGs = originalElement.querySelectorAll("svg, svg *");
        allOriginalSVGs.forEach((svgEl) => {
          const svg = svgEl as SVGElement;
          const computedStyle = window.getComputedStyle(svg as any);

          // Procesar fill
          const fill = svg.getAttribute("fill") || computedStyle.fill;
          if (fill && fill !== "none" && fill !== "currentColor") {
            const converted = convertOklchToRgb(fill);
            if (converted !== fill) {
              svg.setAttribute("fill", converted);
              (svg as any).style.fill = converted;
            }
          }

          // Procesar stroke
          const stroke = svg.getAttribute("stroke") || computedStyle.stroke;
          if (stroke && stroke !== "none" && stroke !== "currentColor") {
            const converted = convertOklchToRgb(stroke);
            if (converted !== stroke) {
              svg.setAttribute("stroke", converted);
              (svg as any).style.stroke = converted;
            }
          }

          // Procesar stop-color para elementos <stop>
          if (svg.tagName === "stop") {
            const stopColor = svg.getAttribute("stop-color");
            if (stopColor) {
              const converted = convertOklchToRgb(stopColor);
              if (converted !== stopColor) {
                svg.setAttribute("stop-color", converted);
                (svg as any).style.stopColor = converted;
              }
            }
          }
        });

        // Procesar estilos CSS globales que puedan contener oklch
        try {
          const styleSheets = Array.from(document.styleSheets);
          styleSheets.forEach((sheet) => {
            try {
              const rules = Array.from(sheet.cssRules || []);
              rules.forEach((rule) => {
                if (rule instanceof CSSStyleRule) {
                  const style = rule.style;
                  const oklchRegex =
                    /oklch\s*\([^)]*\)|oklab\s*\([^)]*\)|lab\s*\([^)]*\)|lch\s*\([^)]*\)/i;

                  // Verificar todas las propiedades
                  for (let i = 0; i < style.length; i++) {
                    const prop = style[i];
                    const value = style.getPropertyValue(prop);
                    if (
                      value &&
                      (oklchRegex.test(value) || value.includes("color-mix"))
                    ) {
                      const converted = convertOklchToRgb(value);
                      if (converted !== value) {
                        style.setProperty(prop, converted, "important");
                      }
                    }
                  }
                }
              });
            } catch (e) {
              // Ignorar errores de acceso a hojas de estilo (CORS, etc.)
            }
          });
        } catch (e) {
          // Ignorar errores de acceso a styleSheets
        }
      }

      // Configuración mejorada para html2canvas
      // IMPORTANTE: foreignObjectRendering: false evita que html2canvas procese SVG directamente
      // Esto previene errores con colores oklch que html2canvas no puede parsear
      let canvas;
      try {
        canvas = await html2canvas(credentialRef.current, {
          backgroundColor: "#ffffff",
          scale: 3, // Mayor resolución para mejor calidad
          logging: false,
          useCORS: true, // Permitir imágenes de otros dominios
          allowTaint: false,
          removeContainer: true,
          imageTimeout: 15000, // Timeout más largo para imágenes
          windowWidth: credentialRef.current.scrollWidth,
          windowHeight: credentialRef.current.scrollHeight,
          foreignObjectRendering: false, // CRÍTICO: Evita errores con oklch en SVG
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

              // IMPORTANTE: Convertir todos los estilos inline a valores hexadecimales/rgb
              // Esto previene errores con oklch/oklab u otros formatos de color modernos
              // Incluir también elementos SVG que pueden tener estilos oklch
              const allElements = clonedElement.querySelectorAll("*");
              const allSVGs = clonedElement.querySelectorAll("svg, svg *");

              // Función mejorada para convertir cualquier color a RGB válido
              const convertColorToRGB = (color: string): string | null => {
                if (
                  !color ||
                  color === "transparent" ||
                  color === "rgba(0, 0, 0, 0)"
                ) {
                  return null;
                }
                try {
                  // Usar expresión regular más robusta para detectar oklch/oklab en cualquier formato
                  const oklchRegex =
                    /oklch\s*\([^)]*\)|oklab\s*\([^)]*\)|lab\s*\([^)]*\)|lch\s*\([^)]*\)/i;
                  const hasModernColor =
                    oklchRegex.test(color) ||
                    color.includes("color-mix") ||
                    color.includes("display-p3");

                  if (hasModernColor) {
                    console.warn(
                      "Color moderno no soportado detectado, usando fallback:",
                      color
                    );
                    // Intentar extraer un color base o usar un fallback seguro
                    if (color.includes("oklch") || color.includes("oklab")) {
                      return "rgba(79, 70, 229, 1)"; // Color indigo de fallback
                    }
                    return "rgba(0, 0, 0, 1)"; // Fallback negro seguro
                  }

                  // Si ya es rgba, verificar que sea válido
                  if (color.startsWith("rgba")) {
                    // Verificar que no contenga valores oklch dentro
                    if (!color.match(/oklch|oklab|lab/i)) {
                      return color;
                    }
                    // Si contiene oklch, usar fallback
                    return "rgba(79, 70, 229, 1)";
                  }

                  // Si es rgb, convertir a rgba
                  if (color.startsWith("rgb")) {
                    const rgbMatch = color.match(/rgba?\(([^)]+)\)/);
                    if (rgbMatch) {
                      const values = rgbMatch[1]
                        .split(",")
                        .map((v) => v.trim());
                      if (values.length >= 3) {
                        const r = parseInt(values[0]);
                        const g = parseInt(values[1]);
                        const b = parseInt(values[2]);
                        const a = values[3] ? parseFloat(values[3]) : 1;
                        return `rgba(${r}, ${g}, ${b}, ${a})`;
                      }
                    }
                    return color
                      .replace(/rgb\(/, "rgba(")
                      .replace(/\)$/, ", 1)");
                  }

                  // Si es hex, convertir a rgba
                  if (color.startsWith("#")) {
                    const hex = color.replace("#", "");
                    const r = parseInt(hex.substring(0, 2), 16);
                    const g = parseInt(hex.substring(2, 4), 16);
                    const b = parseInt(hex.substring(4, 6), 16);
                    const a =
                      hex.length === 8
                        ? parseInt(hex.substring(6, 8), 16) / 255
                        : 1;
                    return `rgba(${r}, ${g}, ${b}, ${a})`;
                  }

                  // Intentar parsear como valores numéricos directos
                  const rgbMatch = color.match(/\d+/g);
                  if (rgbMatch && rgbMatch.length >= 3) {
                    const r = parseInt(rgbMatch[0]);
                    const g = parseInt(rgbMatch[1]);
                    const b = parseInt(rgbMatch[2]);
                    return `rgba(${r}, ${g}, ${b}, 1)`;
                  }

                  // Si no se puede convertir, usar fallback
                  console.warn(
                    "No se pudo convertir color, usando fallback:",
                    color
                  );
                  return "rgba(79, 70, 229, 1)";
                } catch (e) {
                  console.warn("Error convirtiendo color:", color, e);
                  return "rgba(79, 70, 229, 1)"; // Fallback seguro
                }
              };

              // Función para convertir gradientes que puedan contener oklch
              const convertGradient = (gradient: string): string | null => {
                if (!gradient || !gradient.includes("gradient")) {
                  return null;
                }
                // Si contiene oklch, reemplazar con un gradiente RGB seguro
                if (
                  gradient.includes("oklch") ||
                  gradient.includes("oklab") ||
                  gradient.includes("lab")
                ) {
                  console.warn(
                    "Gradiente moderno detectado, usando fallback:",
                    gradient
                  );
                  // Extraer tipo de gradiente (linear, radial, etc.)
                  const isLinear = gradient.includes("linear-gradient");
                  const isRadial = gradient.includes("radial-gradient");

                  if (isLinear) {
                    return "linear-gradient(135deg, rgba(79, 70, 229, 1) 0%, rgba(37, 99, 235, 1) 100%)";
                  }
                  if (isRadial) {
                    return "radial-gradient(circle, rgba(79, 70, 229, 1) 0%, rgba(37, 99, 235, 1) 100%)";
                  }
                  return "linear-gradient(135deg, rgba(79, 70, 229, 1) 0%, rgba(37, 99, 235, 1) 100%)";
                }
                return null; // No necesita conversión
              };

              allElements.forEach((el) => {
                const htmlEl = el as HTMLElement;

                // Obtener estilos computados en el documento clonado
                const computedStyle =
                  clonedDoc.defaultView?.getComputedStyle(htmlEl);
                if (!computedStyle) return;

                // Convertir backgroundColor (puede ser color o gradiente)
                const bgColor = computedStyle.backgroundColor;
                const bgImage = computedStyle.backgroundImage;

                // Si backgroundImage es un gradiente con oklch, convertirlo
                if (bgImage && bgImage !== "none") {
                  const convertedGradient = convertGradient(bgImage);
                  if (convertedGradient) {
                    htmlEl.style.backgroundImage = convertedGradient;
                    htmlEl.style.backgroundColor = "transparent";
                  } else if (bgImage.includes("gradient")) {
                    // Si es un gradiente normal, asegurarse de que se copie correctamente
                    htmlEl.style.backgroundImage = bgImage;
                  }
                } else {
                  // Si es un color sólido
                  const convertedBg = convertColorToRGB(bgColor);
                  if (
                    convertedBg &&
                    bgColor !== "rgba(0, 0, 0, 0)" &&
                    bgColor !== "transparent"
                  ) {
                    htmlEl.style.backgroundColor = convertedBg;
                  }
                }

                // Convertir color (texto)
                const textColor = computedStyle.color;
                const convertedText = convertColorToRGB(textColor);
                if (convertedText) {
                  htmlEl.style.color = convertedText;
                }

                // Convertir borderColor
                const borderColor = computedStyle.borderColor;
                const convertedBorder = convertColorToRGB(borderColor);
                if (convertedBorder && borderColor !== "rgba(0, 0, 0, 0)") {
                  htmlEl.style.borderColor = convertedBorder;
                }

                // Convertir outlineColor
                const outlineColor = computedStyle.outlineColor;
                const convertedOutline = convertColorToRGB(outlineColor);
                if (convertedOutline && outlineColor !== "rgba(0, 0, 0, 0)") {
                  htmlEl.style.outlineColor = convertedOutline;
                }

                // Convertir boxShadow (puede contener colores)
                const boxShadow = computedStyle.boxShadow;
                if (boxShadow && boxShadow !== "none") {
                  // Reemplazar cualquier oklch en boxShadow
                  if (
                    boxShadow.includes("oklch") ||
                    boxShadow.includes("oklab")
                  ) {
                    htmlEl.style.boxShadow = boxShadow.replace(
                      /oklch\([^)]+\)|oklab\([^)]+\)/g,
                      "rgba(0, 0, 0, 0.25)"
                    );
                  }
                }

                // Eliminar backdrop-filter que puede causar problemas
                if (
                  htmlEl.style.backdropFilter ||
                  computedStyle.backdropFilter !== "none"
                ) {
                  htmlEl.style.backdropFilter = "none";
                }

                // Eliminar filter que puede contener funciones no soportadas
                const filter = computedStyle.filter;
                if (
                  filter &&
                  filter !== "none" &&
                  (filter.includes("oklch") || filter.includes("oklab"))
                ) {
                  htmlEl.style.filter = "none";
                }
              });

              // Procesar elementos SVG y sus atributos (fill, stroke, etc.)
              // CRÍTICO: Procesar TODOS los elementos SVG antes de que html2canvas los procese
              allSVGs.forEach((svgEl) => {
                const svgElement = svgEl as SVGElement;
                if (!svgElement) return;

                // Obtener estilos computados del SVG
                const computedStyle = clonedDoc.defaultView?.getComputedStyle(
                  svgElement as any
                );

                // Lista de propiedades de color que pueden contener oklch
                const colorProperties = [
                  "fill",
                  "stroke",
                  "color",
                  "stop-color",
                  "flood-color",
                  "lighting-color",
                  "marker",
                  "marker-start",
                  "marker-end",
                ];

                // Procesar cada propiedad de color
                colorProperties.forEach((prop) => {
                  try {
                    // Intentar obtener desde estilos computados
                    const computedValue =
                      (computedStyle as any)?.getPropertyValue?.(prop) ||
                      (computedStyle as any)?.[prop];

                    // También verificar atributos inline
                    const attrValue = svgElement.getAttribute(prop);

                    // Usar el valor que esté disponible
                    const colorValue = computedValue || attrValue;

                    if (
                      colorValue &&
                      colorValue !== "none" &&
                      colorValue !== "transparent" &&
                      colorValue !== "currentColor"
                    ) {
                      // Convertir cualquier color oklch/oklab a RGB
                      const convertedColor = convertColorToRGB(colorValue);
                      if (convertedColor) {
                        // Establecer en estilos inline
                        (svgElement as any).style[prop] = convertedColor;
                        // También establecer como atributo SVG (más compatible)
                        svgElement.setAttribute(prop, convertedColor);
                      }
                    }
                  } catch (e) {
                    // Ignorar errores en propiedades que no existen
                  }
                });

                // Procesar también atributos directos que pueden tener colores
                const attributesToCheck = ["fill", "stroke"];
                attributesToCheck.forEach((attr) => {
                  const attrValue = svgElement.getAttribute(attr);
                  if (
                    attrValue &&
                    attrValue !== "none" &&
                    attrValue !== "transparent" &&
                    attrValue !== "currentColor"
                  ) {
                    // Verificar si contiene oklch
                    if (
                      attrValue.includes("oklch") ||
                      attrValue.includes("oklab") ||
                      attrValue.includes("lab(") ||
                      attrValue.includes("lch(")
                    ) {
                      const convertedColor = convertColorToRGB(attrValue);
                      if (convertedColor) {
                        svgElement.setAttribute(attr, convertedColor);
                        (svgElement as any).style[attr] = convertedColor;
                      }
                    }
                  }
                });

                // También procesar elementos <stop> en gradientes que pueden tener stop-color
                if (svgElement.tagName === "stop") {
                  const stopColor = svgElement.getAttribute("stop-color");
                  if (stopColor) {
                    const convertedStopColor = convertColorToRGB(stopColor);
                    if (convertedStopColor) {
                      svgElement.setAttribute("stop-color", convertedStopColor);
                      (svgElement as any).style.stopColor = convertedStopColor;
                    }
                  }
                }
              });

              // Procesar también todos los estilos CSS en el documento que puedan afectar SVG
              try {
                const styleSheets = Array.from(clonedDoc.styleSheets);
                styleSheets.forEach((sheet) => {
                  try {
                    const rules = Array.from(sheet.cssRules || []);
                    rules.forEach((rule) => {
                      if (rule instanceof CSSStyleRule) {
                        const style = rule.style;
                        // Buscar propiedades de color que puedan tener oklch
                        const colorProps = [
                          "fill",
                          "stroke",
                          "color",
                          "stop-color",
                          "background-color",
                          "border-color",
                        ];
                        colorProps.forEach((prop) => {
                          const value = style.getPropertyValue(prop);
                          if (
                            value &&
                            (value.includes("oklch") ||
                              value.includes("oklab") ||
                              value.includes("lab(") ||
                              value.includes("lch("))
                          ) {
                            const converted = convertColorToRGB(value);
                            if (converted) {
                              style.setProperty(prop, converted, "important");
                            }
                          }
                        });
                      }
                    });
                  } catch (e) {
                    // Ignorar errores de acceso a hojas de estilo (CORS, etc.)
                  }
                });
              } catch (e) {
                // Ignorar errores de acceso a styleSheets
              }

              // También convertir estilos inline directos en el elemento principal
              if (clonedElement) {
                const mainElement = clonedElement as HTMLElement;
                const mainStyle =
                  clonedDoc.defaultView?.getComputedStyle(mainElement);
                if (mainStyle) {
                  // Verificar y convertir background del elemento principal
                  const mainBgImage = mainStyle.backgroundImage;
                  if (mainBgImage && mainBgImage !== "none") {
                    const convertedGradient = convertGradient(mainBgImage);
                    if (convertedGradient) {
                      mainElement.style.backgroundImage = convertedGradient;
                    }
                  }
                }
              }
            }
          },
        });
      } catch (html2canvasError: any) {
        // Si html2canvas falla, intentar de nuevo con foreignObjectRendering: false
        console.warn(
          "html2canvas falló, intentando con foreignObjectRendering: false",
          html2canvasError
        );
        canvas = await html2canvas(credentialRef.current, {
          backgroundColor: "#ffffff",
          scale: 3,
          logging: false,
          useCORS: true,
          allowTaint: false,
          removeContainer: true,
          imageTimeout: 15000,
          windowWidth: credentialRef.current.scrollWidth,
          windowHeight: credentialRef.current.scrollHeight,
          foreignObjectRendering: false, // Deshabilitar para evitar problemas con SVG
        });
      }

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
          backgroundColor: "#ffffff",
          windowWidth: credentialRef.current.scrollWidth,
          windowHeight: credentialRef.current.scrollHeight,
          onclone: (clonedDoc: Document) => {
            // Aplicar la misma lógica mejorada de conversión de colores que en handleDownloadImage
            const clonedElement = clonedDoc.getElementById(
              "professional-credential"
            );
            if (clonedElement) {
              const allElements = clonedElement.querySelectorAll("*");
              const allSVGs = clonedElement.querySelectorAll("svg, svg *");

              // Función mejorada para convertir cualquier color a RGB válido
              const convertColorToRGB = (color: string): string | null => {
                if (
                  !color ||
                  color === "transparent" ||
                  color === "rgba(0, 0, 0, 0)"
                ) {
                  return null;
                }
                try {
                  // Si contiene oklab, oklch, lab, o cualquier formato moderno no soportado
                  if (
                    color.includes("oklab") ||
                    color.includes("oklch") ||
                    color.includes("lab") ||
                    color.includes("color-mix") ||
                    color.includes("lch") ||
                    color.includes("display-p3")
                  ) {
                    console.warn(
                      "Color moderno no soportado detectado, usando fallback:",
                      color
                    );
                    if (color.includes("oklch") || color.includes("oklab")) {
                      return "rgba(79, 70, 229, 1)";
                    }
                    return "rgba(0, 0, 0, 1)";
                  }

                  if (color.startsWith("rgba")) {
                    if (!color.match(/oklch|oklab|lab/i)) {
                      return color;
                    }
                    return "rgba(79, 70, 229, 1)";
                  }

                  if (color.startsWith("rgb")) {
                    const rgbMatch = color.match(/rgba?\(([^)]+)\)/);
                    if (rgbMatch) {
                      const values = rgbMatch[1]
                        .split(",")
                        .map((v) => v.trim());
                      if (values.length >= 3) {
                        const r = parseInt(values[0]);
                        const g = parseInt(values[1]);
                        const b = parseInt(values[2]);
                        const a = values[3] ? parseFloat(values[3]) : 1;
                        return `rgba(${r}, ${g}, ${b}, ${a})`;
                      }
                    }
                    return color
                      .replace(/rgb\(/, "rgba(")
                      .replace(/\)$/, ", 1)");
                  }

                  if (color.startsWith("#")) {
                    const hex = color.replace("#", "");
                    const r = parseInt(hex.substring(0, 2), 16);
                    const g = parseInt(hex.substring(2, 4), 16);
                    const b = parseInt(hex.substring(4, 6), 16);
                    const a =
                      hex.length === 8
                        ? parseInt(hex.substring(6, 8), 16) / 255
                        : 1;
                    return `rgba(${r}, ${g}, ${b}, ${a})`;
                  }

                  const rgbMatch = color.match(/\d+/g);
                  if (rgbMatch && rgbMatch.length >= 3) {
                    const r = parseInt(rgbMatch[0]);
                    const g = parseInt(rgbMatch[1]);
                    const b = parseInt(rgbMatch[2]);
                    return `rgba(${r}, ${g}, ${b}, 1)`;
                  }

                  console.warn(
                    "No se pudo convertir color, usando fallback:",
                    color
                  );
                  return "rgba(79, 70, 229, 1)";
                } catch (e) {
                  console.warn("Error convirtiendo color:", color, e);
                  return "rgba(79, 70, 229, 1)";
                }
              };

              // Función para convertir gradientes
              const convertGradient = (gradient: string): string | null => {
                if (!gradient || !gradient.includes("gradient")) {
                  return null;
                }
                if (
                  gradient.includes("oklch") ||
                  gradient.includes("oklab") ||
                  gradient.includes("lab")
                ) {
                  console.warn(
                    "Gradiente moderno detectado, usando fallback:",
                    gradient
                  );
                  const isLinear = gradient.includes("linear-gradient");
                  const isRadial = gradient.includes("radial-gradient");

                  if (isLinear) {
                    return "linear-gradient(135deg, rgba(79, 70, 229, 1) 0%, rgba(37, 99, 235, 1) 100%)";
                  }
                  if (isRadial) {
                    return "radial-gradient(circle, rgba(79, 70, 229, 1) 0%, rgba(37, 99, 235, 1) 100%)";
                  }
                  return "linear-gradient(135deg, rgba(79, 70, 229, 1) 0%, rgba(37, 99, 235, 1) 100%)";
                }
                return null;
              };

              allElements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                const computedStyle =
                  clonedDoc.defaultView?.getComputedStyle(htmlEl);
                if (!computedStyle) return;

                const bgColor = computedStyle.backgroundColor;
                const bgImage = computedStyle.backgroundImage;

                if (bgImage && bgImage !== "none") {
                  const convertedGradient = convertGradient(bgImage);
                  if (convertedGradient) {
                    htmlEl.style.backgroundImage = convertedGradient;
                    htmlEl.style.backgroundColor = "transparent";
                  } else if (bgImage.includes("gradient")) {
                    htmlEl.style.backgroundImage = bgImage;
                  }
                } else {
                  const convertedBg = convertColorToRGB(bgColor);
                  if (
                    convertedBg &&
                    bgColor !== "rgba(0, 0, 0, 0)" &&
                    bgColor !== "transparent"
                  ) {
                    htmlEl.style.backgroundColor = convertedBg;
                  }
                }

                const textColor = convertColorToRGB(computedStyle.color);
                if (textColor) {
                  htmlEl.style.color = textColor;
                }

                const borderColor = convertColorToRGB(
                  computedStyle.borderColor
                );
                if (
                  borderColor &&
                  computedStyle.borderColor !== "rgba(0, 0, 0, 0)"
                ) {
                  htmlEl.style.borderColor = borderColor;
                }

                const outlineColor = convertColorToRGB(
                  computedStyle.outlineColor
                );
                if (
                  outlineColor &&
                  computedStyle.outlineColor !== "rgba(0, 0, 0, 0)"
                ) {
                  htmlEl.style.outlineColor = outlineColor;
                }

                const boxShadow = computedStyle.boxShadow;
                if (boxShadow && boxShadow !== "none") {
                  if (
                    boxShadow.includes("oklch") ||
                    boxShadow.includes("oklab")
                  ) {
                    htmlEl.style.boxShadow = boxShadow.replace(
                      /oklch\([^)]+\)|oklab\([^)]+\)/g,
                      "rgba(0, 0, 0, 0.25)"
                    );
                  }
                }

                if (
                  htmlEl.style.backdropFilter ||
                  computedStyle.backdropFilter !== "none"
                ) {
                  htmlEl.style.backdropFilter = "none";
                }

                const filter = computedStyle.filter;
                if (
                  filter &&
                  filter !== "none" &&
                  (filter.includes("oklch") || filter.includes("oklab"))
                ) {
                  htmlEl.style.filter = "none";
                }
              });

              // Procesar elementos SVG y sus atributos (fill, stroke, etc.)
              allSVGs.forEach((svgEl) => {
                const svgElement = svgEl as SVGElement;
                if (!svgElement) return;

                // Obtener estilos computados del SVG
                const computedStyle = clonedDoc.defaultView?.getComputedStyle(
                  svgElement as any
                );
                if (computedStyle) {
                  // Convertir fill
                  const fill =
                    computedStyle.fill || svgElement.getAttribute("fill");
                  if (fill && fill !== "none") {
                    const convertedFill = convertColorToRGB(fill);
                    if (convertedFill) {
                      (svgElement as any).style.fill = convertedFill;
                      svgElement.setAttribute("fill", convertedFill);
                    }
                  }

                  // Convertir stroke
                  const stroke =
                    computedStyle.stroke || svgElement.getAttribute("stroke");
                  if (stroke && stroke !== "none") {
                    const convertedStroke = convertColorToRGB(stroke);
                    if (convertedStroke) {
                      (svgElement as any).style.stroke = convertedStroke;
                      svgElement.setAttribute("stroke", convertedStroke);
                    }
                  }

                  // Convertir color (usado en SVG para fill/stroke por defecto)
                  const color = computedStyle.color;
                  if (color) {
                    const convertedColor = convertColorToRGB(color);
                    if (convertedColor) {
                      (svgElement as any).style.color = convertedColor;
                    }
                  }
                }

                // También procesar atributos inline directos
                const fillAttr = svgElement.getAttribute("fill");
                if (fillAttr && fillAttr !== "none") {
                  // Si es currentColor, obtener el color del CSS y convertirlo
                  if (fillAttr === "currentColor" && computedStyle) {
                    const currentColor = computedStyle.color;
                    if (currentColor) {
                      const convertedColor = convertColorToRGB(currentColor);
                      if (convertedColor) {
                        svgElement.setAttribute("fill", convertedColor);
                      }
                    }
                  } else if (
                    fillAttr.includes("oklch") ||
                    fillAttr.includes("oklab") ||
                    fillAttr.includes("lab")
                  ) {
                    const convertedFill = convertColorToRGB(fillAttr);
                    if (convertedFill) {
                      svgElement.setAttribute("fill", convertedFill);
                    }
                  }
                }

                const strokeAttr = svgElement.getAttribute("stroke");
                if (strokeAttr && strokeAttr !== "none") {
                  // Si es currentColor, obtener el color del CSS y convertirlo
                  if (strokeAttr === "currentColor" && computedStyle) {
                    const currentColor = computedStyle.color;
                    if (currentColor) {
                      const convertedColor = convertColorToRGB(currentColor);
                      if (convertedColor) {
                        svgElement.setAttribute("stroke", convertedColor);
                      }
                    }
                  } else if (
                    strokeAttr.includes("oklch") ||
                    strokeAttr.includes("oklab") ||
                    strokeAttr.includes("lab")
                  ) {
                    const convertedStroke = convertColorToRGB(strokeAttr);
                    if (convertedStroke) {
                      svgElement.setAttribute("stroke", convertedStroke);
                    }
                  }
                }
              });

              // Convertir estilos del elemento principal
              if (clonedElement) {
                const mainElement = clonedElement as HTMLElement;
                const mainStyle =
                  clonedDoc.defaultView?.getComputedStyle(mainElement);
                if (mainStyle) {
                  const mainBgImage = mainStyle.backgroundImage;
                  if (mainBgImage && mainBgImage !== "none") {
                    const convertedGradient = convertGradient(mainBgImage);
                    if (convertedGradient) {
                      mainElement.style.backgroundImage = convertedGradient;
                    }
                  }
                }
              }
            }
          },
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
        className="relative rounded-3xl shadow-2xl overflow-hidden border-4 max-w-2xl mx-auto"
        style={{
          background: getBackgroundGradientHex(selectedStyle),
          borderColor: getBorderColorHex(selectedStyle),
        }}
      >
        {/* Header con logo y verificación - Diseño mejorado */}
        <div
          className="relative px-8 pt-8 pb-6 border-b-2"
          style={{
            borderBottomColor: getBorderColorHex(selectedStyle),
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(8px)",
          }}
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
            <div
              className="rounded-2xl p-5 border-2 border-yellow-200 shadow-lg"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
              }}
            >
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
                {rating.toFixed(1)}{" "}
                <span className="text-sm font-normal text-gray-500">/ 5.0</span>
              </p>
                </div>

            {/* Tasa de Aceptación - Nuevo diseño mejorado */}
            <div
              className="rounded-2xl p-5 border-2 border-green-200 shadow-lg"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
              }}
            >
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
              className="rounded-2xl p-5 border-2 shadow-lg"
              style={{
                borderColor: styleConfig.primaryColor,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
              }}
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
            <div
              className="rounded-2xl p-5 border-2 border-blue-200 shadow-lg"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
              }}
            >
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
            className="flex items-center justify-between pt-6 border-t-2"
            style={{
              borderTopColor: getBorderColorHex(selectedStyle),
            }}
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
          className="flex items-center space-x-3 px-6 py-3.5 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          style={{
            background:
              isDownloading === "image"
                ? "linear-gradient(90deg, #4f46e5 0%, #2563eb 100%)"
                : "linear-gradient(90deg, #4f46e5 0%, #2563eb 100%)",
          }}
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
          className="flex items-center space-x-3 px-6 py-3.5 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          style={{
            background: "linear-gradient(90deg, #dc2626 0%, #ec4899 100%)",
          }}
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
  // Todos los profesionales parten con 5 estrellas por defecto
  const rating = profesional.calificacion_promedio ?? 5;

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
          <p style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 900;">${rating.toFixed(1)} <span style="font-size: 14px; font-weight: 400; color: #6b7280;">/ 5.0</span></p>
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
