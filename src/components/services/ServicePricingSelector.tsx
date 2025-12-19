"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWrench,
  faLightbulb,
  faThermometerHalf,
  faKey,
  faPaintBrush,
  faBroom,
  faSeedling,
  faHammer,
  faHardHat,
  faCubes,
  faVideo,
  faWifi,
  faBug,
  faSpinner,
  faCheck,
  faBox,
  faArrowRight,
  faTools,
  faCheckCircle,
  faStar,
  faTv,
  faCouch,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/lib/supabase/client";

// 🆕 Servicios populares hardcodeados (no vienen de BD)
const popularServicesList: (ServiceCatalogItem & { icon?: any; color?: string; bgColor?: string })[] = [
  {
    id: "popular-montar-tv",
    service_name: "Montar TV en Pared",
    discipline: "montaje-armado",
    price_type: "fixed",
    min_price: 800,
    max_price: null,
    unit: "servicio",
    includes_materials: false,
    description: "Hasta 65 pulgadas",
    icon: faTv,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "popular-armar-muebles",
    service_name: "Armado de muebles",
    discipline: "montaje-armado",
    price_type: "fixed",
    min_price: 600,
    max_price: null,
    unit: "servicio",
    includes_materials: false,
    description: "Muebles estándar",
    icon: faCouch,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: "popular-instalar-apagador",
    service_name: "Instalación de Apagador",
    discipline: "electricidad",
    price_type: "fixed",
    min_price: 350,
    max_price: null,
    unit: "servicio",
    includes_materials: false,
    description: "Precio fijo garantizado",
    icon: faLightbulb,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    id: "popular-reparar-fuga",
    service_name: "Reparación de Fuga de Agua",
    discipline: "plomeria",
    price_type: "fixed",
    min_price: 400,
    max_price: null,
    unit: "servicio",
    includes_materials: false,
    description: "Fuga simple",
    icon: faWrench,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "popular-limpieza",
    service_name: "Limpieza Residencial Básica",
    discipline: "limpieza",
    price_type: "fixed",
    min_price: 800,
    max_price: null,
    unit: "servicio",
    includes_materials: true,
    description: "Hasta 80m²",
    icon: faBroom,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: "popular-instalar-lampara",
    service_name: "Instalación de Lámpara",
    discipline: "electricidad",
    price_type: "fixed",
    min_price: 500,
    max_price: null,
    unit: "servicio",
    includes_materials: false,
    description: "Colgante o empotrada",
    icon: faLightbulb,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    id: "popular-cctv-wifi",
    service_name: "Instalación de Cámara CCTV",
    discipline: "montaje-armado",
    price_type: "fixed",
    min_price: 800,
    max_price: null,
    unit: "servicio",
    includes_materials: false,
    description: "Cámara wifi",
    icon: faVideo,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
];

// Constante de categorías de servicio (debe coincidir con RequestServiceModal)
const serviceCategories = [
  {
    id: "populares",
    name: "Populares",
    icon: faStar,
    color: "text-yellow-600",
    bgColor: "bg-gradient-to-r from-yellow-50 to-orange-50",
    isPopular: true,
  },
  {
    id: "plomeria",
    name: "Plomería",
    icon: faWrench,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "electricidad",
    name: "Electricidad",
    icon: faLightbulb,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    id: "aire-acondicionado",
    name: "Aire Acondicionado",
    icon: faThermometerHalf,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    id: "cerrajeria",
    name: "Cerrajería",
    icon: faKey,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
  {
    id: "pintura",
    name: "Pintura",
    icon: faPaintBrush,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: "limpieza",
    name: "Limpieza",
    icon: faBroom,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: "jardineria",
    name: "Jardinería",
    icon: faSeedling,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: "carpinteria",
    name: "Carpintería",
    icon: faHammer,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: "construccion",
    name: "Construcción",
    icon: faHardHat,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    id: "tablaroca",
    name: "Tablaroca",
    icon: faCubes,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: "cctv",
    name: "CCTV",
    icon: faVideo,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    id: "wifi",
    name: "WiFi",
    icon: faWifi,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    id: "fumigacion",
    name: "Fumigación",
    icon: faBug,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    id: "montaje-armado",
    name: "Misceláneos",
    icon: faTools,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
];

// Tipo para servicio del catálogo
interface ServiceCatalogItem {
  id: string;
  discipline: string;
  service_name: string;
  price_type: "fixed" | "range" | "starting_at";
  min_price: number;
  max_price: number | null;
  unit: string;
  includes_materials: boolean;
  description: string | null;
}

// Props del componente
interface ServicePricingSelectorProps {
  onServiceSelect: (
    serviceName: string,
    priceText: string,
    fullDescription: string,
    categoryId: string
  ) => void;
  preSelectedCategory?: string;
  onManualDescription?: () => void;
}

export default function ServicePricingSelector({
  onServiceSelect,
  preSelectedCategory,
  onManualDescription,
}: ServicePricingSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    preSelectedCategory || "populares" // 🆕 Por defecto mostrar "Populares"
  );
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cliente Supabase (singleton)

  // Fetch servicios cuando cambia la categoría seleccionada
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);

      try {
        // 🆕 Si es categoría "Populares", usar lista hardcodeada
        if (selectedCategory === "populares") {
          setServices(popularServicesList as ServiceCatalogItem[]);
          setLoading(false);
          return;
        }

        // Si no, fetch normal desde BD
        const { data, error: fetchError } = await supabase
          .from("service_catalog")
          .select("*")
          .eq("discipline", selectedCategory)
          .eq("is_active", true)
          .order("min_price", { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        setServices(data || []);
      } catch (err: any) {
        console.error("Error fetching services:", err);
        setError(err.message || "Error al cargar servicios");
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, supabase]);

  // Formatear precio según el tipo
  const formatPrice = (service: ServiceCatalogItem): string => {
    if (service.price_type === "fixed") {
      return `$${service.min_price.toLocaleString("es-MX")}`;
    } else if (service.price_type === "range") {
      return `$${service.min_price.toLocaleString("es-MX")} - $${(
        service.max_price || 0
      ).toLocaleString("es-MX")}`;
    } else {
      // starting_at
      return `Desde $${service.min_price.toLocaleString("es-MX")}`;
    }
  };

  // Formatear descripción completa para el lead
  const formatFullDescription = (service: ServiceCatalogItem): string => {
    const priceText = formatPrice(service);
    const unitText = service.unit !== "servicio" ? ` por ${service.unit}` : "";
    const materialsText = service.includes_materials
      ? " (Incluye materiales)"
      : " (Solo mano de obra - materiales aparte)";

    return `Me interesa: ${service.service_name}. Precio: ${priceText}${unitText}${materialsText}`;
  };

  // Manejar selección de servicio
  const handleServiceClick = (service: ServiceCatalogItem) => {
    const priceText = formatPrice(service);
    const fullDescription = formatFullDescription(service);
    onServiceSelect(service.service_name, priceText, fullDescription, service.discipline);
  };

  // Obtener categoría activa
  const activeCategory = serviceCategories.find(
    (cat) => cat.id === selectedCategory
  );

  return (
    <div className="space-y-1 md:space-y-1.5">
      {/* Tabs de Disciplinas (Scroll Horizontal) - Ultra Compacto */}
      <div className="overflow-x-auto pb-0.5 -mx-3 md:-mx-4 px-3 md:px-4 scrollbar-hide">
        <div className="flex gap-0.5 min-w-max items-center">
          {serviceCategories.map((category, index) => {
            const isActive = selectedCategory === category.id;
            const isPopular = category.id === "populares";
            
            return (
              <React.Fragment key={category.id}>
                <button
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center gap-0.5 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md font-medium text-[9px] md:text-[10px]
                    whitespace-nowrap transition-all duration-200
                    ${
                      isPopular
                        ? isActive
                          ? `${category.bgColor} ${category.color} scale-105 shadow-sm ring-2 ring-yellow-300 ring-opacity-50 font-bold`
                          : "bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 hover:from-yellow-100 hover:to-orange-100 border border-yellow-200"
                        : isActive
                        ? `${category.bgColor} ${category.color} scale-105 shadow-sm ring-1 ring-opacity-50`
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }
                  `}
                >
                  <FontAwesomeIcon
                    icon={category.icon}
                    className={`text-[9px] md:text-[10px] ${isActive ? (isPopular ? "text-yellow-600" : category.color) : (isPopular ? "text-yellow-600" : "text-gray-500")}`}
                  />
                  <span className="hidden sm:inline">{category.name}</span>
                  <span className="sm:hidden">{isPopular ? "⭐" : category.name.split(' ')[0]}</span>
                </button>
                {/* Separador visual después de "Populares" */}
                {isPopular && index === 0 && (
                  <>
                    <div className="h-4 w-px bg-gray-300 mx-0.5"></div>
                    <span className="text-[8px] md:text-[9px] text-gray-500 font-medium px-1 hidden md:inline whitespace-nowrap">
                      O explora por categoría
                    </span>
                    <div className="h-4 w-px bg-gray-300 mx-0.5 hidden md:block"></div>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Grid de Servicios - Compacto y Responsive */}
      {loading ? (
        <div className="flex justify-center items-center py-8 md:py-12">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-2xl md:text-3xl text-blue-600"
          />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 text-center">
          <p className="text-red-800 text-xs md:text-sm">{error}</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 md:p-8 text-center">
          <FontAwesomeIcon
            icon={faBox}
            className="text-3xl md:text-4xl text-gray-400 mb-2 md:mb-3"
          />
          <p className="text-gray-600 text-xs md:text-sm">
            No hay servicios disponibles para {activeCategory?.name || "esta categoría"}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-1.5 max-h-[40vh] md:max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className="group relative p-1.5 md:p-2 rounded-md border-2 border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all duration-200 text-left bg-white hover:bg-blue-50 active:scale-[0.98]"
            >
              {/* Nombre del Servicio */}
              <h3 className="font-bold text-gray-900 mb-0.5 md:mb-1 text-[10px] md:text-xs leading-tight line-clamp-2">
                {service.service_name}
              </h3>

              {/* Precio y Badge de Materiales - Lado a lado */}
              <div className="flex justify-between items-center mt-1 md:mt-1.5 gap-1">
                <div className="flex-1">
                  <p className="text-base md:text-lg font-bold text-blue-600 leading-tight">
                    {formatPrice(service)}
                  </p>
                  <p className="text-[8px] md:text-[9px] text-gray-500 mt-0.5">
                    {service.price_type === "starting_at" && "MXN"}
                    {service.price_type === "fixed" && `MXN ${service.unit !== "servicio" ? `por ${service.unit}` : ""}`}
                    {service.price_type === "range" && `MXN ${service.unit !== "servicio" ? `por ${service.unit}` : ""}`}
                  </p>
                </div>

                {/* Badge de Materiales o Mano de Obra */}
                {service.includes_materials ? (
                  <span 
                    className="text-[8px] md:text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 flex-shrink-0"
                    title="El precio incluye materiales y mano de obra"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="text-[7px] md:text-[8px]" />
                    <span className="hidden sm:inline">Todo Incluido</span>
                    <span className="sm:hidden">Todo</span>
                  </span>
                ) : (
                  <span 
                    className="text-[8px] md:text-[9px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 flex-shrink-0"
                    title="El precio cubre el trabajo profesional. Los materiales (tubos, llaves, el equipo nuevo) los compra el cliente o se cotizan aparte."
                  >
                    <FontAwesomeIcon icon={faTools} className="text-[7px] md:text-[8px]" />
                    <span className="hidden sm:inline">Solo MO</span>
                    <span className="sm:hidden">MO</span>
                  </span>
                )}
              </div>

              {/* Descripción (opcional, si existe) - Oculto completamente para ahorrar espacio */}
              {service.description && (
                <p className="hidden lg:block text-[9px] text-gray-600 mt-1 line-clamp-1">
                  {service.description}
                </p>
              )}

              {/* Indicador de hover */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="text-blue-600 text-xs md:text-sm"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Nota sobre Precios - Sticky y Visible */}
      <div className="bg-amber-50 border border-amber-200 rounded-md p-1 md:p-1.5 mt-1 sticky bottom-0 z-10">
        <p className="text-[8px] md:text-[9px] text-amber-800 text-center leading-tight">
          <strong>💡 Precios de referencia para CDMX/Área Metropolitana.</strong>{" "}
          La mayoría de los servicios incluyen <strong>solo mano de obra profesional garantizada</strong>.{" "}
          Los materiales (tubos, llaves, equipos) se compran aparte o se cotizan por separado.
        </p>
      </div>

      {/* Botón de Descripción Manual - Más Atractivo */}
      {onManualDescription && (
        <div className="pt-1.5 md:pt-2 border-t border-gray-200">
          <button
            onClick={onManualDescription}
            className="w-full py-2 md:py-2.5 px-3 md:px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group text-xs md:text-sm"
          >
            <span className="hidden sm:inline">¿No encuentras lo que buscas?</span>
            <span className="sm:hidden">¿No encuentras?</span>
            <span className="font-extrabold underline decoration-2 underline-offset-2">
              Describir manualmente
            </span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="text-sm md:text-base group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      )}
    </div>
  );
}

