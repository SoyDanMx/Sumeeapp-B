import { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import MontajeArmadoServicePageClient from "./MontajeArmadoServicePageClient";

interface ServicePageProps {
  params: Promise<{ serviceSlug: string }>;
}

// Mapeo compacto de slugs a nombres de servicios
const SERVICE_SLUG_MAP: Record<string, string> = {
  "montar-tv-pared": "Montar TV en Pared", "montar-tv-grande": "Montar TV Grande (66\"-85\")",
  "armar-mueble-ikea-estandar": "Armar Mueble IKEA Estándar", "armar-mueble-ikea-grande": "Armar Mueble IKEA Grande",
  "armar-cuna-bebe": "Armar Cuna/Bebé", "armar-mueble-generico": "Armar Mueble Genérico",
  "montar-estantes": "Montar Estantes en Pared", "montar-rack-tv": "Montar Rack de TV/Mueble",
  "colgar-cuadros-hasta-3": "Colgar Cuadros/Arte (Hasta 3)", "colgar-cuadros-4-6": "Colgar Cuadros/Arte (4-6 piezas)",
  "instalar-cortinas-hasta-3": "Instalar Cortinas (Hasta 3 ventanas)", "instalar-cortinas-4-plus": "Instalar Cortinas (4+ ventanas)",
  "montar-espejo-grande": "Montar Espejo Grande", "instalar-lampara-colgante": "Instalar Lámpara Colgante",
  "montar-ventilador-techo": "Montar Ventilador de Techo", "paquete-montaje-completo": "Paquete Montaje Completo (TV + Estantes)",
};

// Metadata SEO específica por servicio - Compacta
const SERVICE_SEO_METADATA: Record<string, { title: string; description: string; keywords: string[]; ogDescription: string }> = {
  "montar-tv-pared": {
    title: "Montar TV en Pared - Servicio Profesional CDMX | Sumee App",
    description: "Montaje profesional de TV hasta 65 pulgadas en pared. Técnicos verificados, precio fijo $800 MXN. Incluye anclajes, nivelación y cable management. Cotización gratuita.",
    keywords: ["montar tv en pared", "instalación tv pared CDMX", "montaje televisor", "instalar tv pared", "montaje tv profesional", "servicio montaje tv CDMX", "técnico montaje tv", "precio montar tv", "montaje tv hasta 65 pulgadas", "instalación televisor pared", "montaje tv Ciudad de México", "servicio montaje televisor"],
    ogDescription: "Montaje profesional de TV hasta 65 pulgadas. Precio fijo $800 MXN. Técnicos verificados en CDMX.",
  },
  "armar-mueble-ikea-estandar": {
    title: "Armar Muebles IKEA - Servicio Profesional CDMX | Sumee App",
    description: "Armado completo de muebles IKEA estándar (hasta 2m). Precio fijo $600 MXN. Incluye desempaque, armado completo y limpieza. Técnicos especializados en muebles IKEA.",
    keywords: ["armar muebles IKEA", "ensamblar muebles IKEA CDMX", "armado muebles IKEA", "servicio armado muebles", "técnico armado muebles", "precio armar muebles IKEA", "ensamblaje muebles IKEA", "armar muebles Ciudad de México", "servicio montaje muebles", "técnico muebles IKEA CDMX", "armado profesional muebles"],
    ogDescription: "Armado profesional de muebles IKEA estándar. Precio fijo $600 MXN. Técnicos especializados.",
  },
  "montar-estantes": {
    title: "Montar Estantes en Pared - Servicio Profesional CDMX | Sumee App",
    description: "Montaje profesional de hasta 3 estantes en pared. Precio fijo $500 MXN. Incluye nivelación, anclajes y ajustes. Técnicos verificados en CDMX.",
    keywords: ["montar estantes pared", "instalación estantes pared", "montaje estantes CDMX", "colgar estantes pared", "instalar estantes", "montaje estantes profesional", "técnico montaje estantes", "precio montar estantes", "instalación estantes Ciudad de México", "servicio montaje estantes"],
    ogDescription: "Montaje profesional de estantes en pared. Precio fijo $500 MXN. Hasta 3 estantes incluidos.",
  },
  "colgar-cuadros-hasta-3": {
    title: "Colgar Cuadros y Arte - Servicio Profesional CDMX | Sumee App",
    description: "Colgado profesional de hasta 3 cuadros o piezas de arte. Precio fijo $400 MXN. Incluye nivelación, anclajes y distribución equilibrada. Técnicos especializados.",
    keywords: ["colgar cuadros", "instalar cuadros pared", "montaje cuadros arte", "colgar arte pared", "instalación cuadros CDMX", "técnico colgar cuadros", "precio colgar cuadros", "montaje cuadros profesional", "colgar cuadros Ciudad de México", "servicio montaje cuadros"],
    ogDescription: "Colgado profesional de cuadros y arte. Precio fijo $400 MXN. Hasta 3 piezas incluidas.",
  },
  "instalar-cortinas-hasta-3": {
    title: "Instalar Cortinas - Servicio Profesional CDMX | Sumee App",
    description: "Instalación profesional de cortinas con riel o varilla en hasta 3 ventanas. Precio fijo $600 MXN. Incluye montaje de soportes y colocación. Técnicos verificados.",
    keywords: ["instalar cortinas", "montaje cortinas CDMX", "instalación cortinas ventanas", "colgar cortinas", "montar cortinas", "técnico instalar cortinas", "precio instalar cortinas", "instalación cortinas Ciudad de México", "servicio montaje cortinas", "montaje cortinas profesional"],
    ogDescription: "Instalación profesional de cortinas. Precio fijo $600 MXN. Hasta 3 ventanas incluidas.",
  },
};

// Función para generar metadata SEO dinámica
export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  const serviceName = SERVICE_SLUG_MAP[serviceSlug];
  
  if (!serviceName) {
    return {
      title: "Servicio no encontrado - Sumee App",
      description: "El servicio solicitado no está disponible.",
    };
  }

  // Obtener datos del servicio desde la BD
  const supabase = await createSupabaseServerClient();
  const { data: serviceData } = await supabase
    .from("service_catalog")
    .select("min_price, max_price, price_type, description")
    .eq("discipline", "montaje-armado")
    .eq("service_name", serviceName)
    .eq("is_active", true)
    .maybeSingle();

  // Metadata específica del servicio si existe
  const seoData = SERVICE_SEO_METADATA[serviceSlug] || {
    title: `${serviceName} - Servicio Profesional CDMX | Sumee App`,
    description: serviceData?.description || `${serviceName}. Técnicos verificados y especializados. Cotización gratuita y respuesta rápida.`,
    keywords: [serviceName.toLowerCase(), "montaje armado CDMX", "servicio montaje", "técnico montaje", "instalación profesional", "montaje Ciudad de México", "servicio armado muebles"],
    ogDescription: serviceData?.description || `${serviceName}. Técnicos verificados en CDMX.`,
  };

  // Construir precio para metadata
  const priceText = serviceData?.price_type === "fixed" && serviceData.min_price
    ? `Precio fijo $${serviceData.min_price.toLocaleString("es-MX")} MXN`
    : serviceData?.min_price
    ? `Desde $${serviceData.min_price.toLocaleString("es-MX")} MXN`
    : "";

  const baseUrl = "https://www.sumeeapp.com";
  const serviceUrl = `${baseUrl}/servicios/montaje-armado/${serviceSlug}`;
  const ogImage = `${baseUrl}/images/services/montaje-armado.jpg`;

  return {
    title: seoData.title,
    description: `${seoData.description} ${priceText ? priceText + "." : ""}`,
    keywords: [...seoData.keywords, "montaje armado", "servicios para el hogar CDMX", "técnicos verificados", "cotización gratuita", "servicio a domicilio", "montaje profesional"],
    openGraph: {
      title: seoData.title,
      description: `${seoData.ogDescription} ${priceText ? priceText + "." : ""}`,
      type: "website",
      url: serviceUrl,
      siteName: "Sumee App",
      images: [{ url: ogImage, width: 1200, height: 630, alt: serviceName }],
      locale: "es_MX",
    },
    twitter: {
      card: "summary_large_image",
      title: seoData.title,
      description: `${seoData.ogDescription} ${priceText ? priceText + "." : ""}`,
      images: [ogImage],
    },
    alternates: { canonical: serviceUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function MontajeArmadoServicePage({ params }: ServicePageProps) {
  const { serviceSlug } = await params;
  const serviceName = SERVICE_SLUG_MAP[serviceSlug];
  
  if (!serviceName) {
    notFound();
  }

  // Obtener datos del servicio desde la BD
  const supabase = await createSupabaseServerClient();
  const { data: serviceData, error } = await supabase
    .from("service_catalog")
    .select("*")
    .eq("discipline", "montaje-armado")
    .eq("service_name", serviceName)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !serviceData) {
    notFound();
  }

  return <MontajeArmadoServicePageClient serviceSlug={serviceSlug} serviceName={serviceName} serviceData={serviceData} />;
}

