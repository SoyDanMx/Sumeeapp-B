"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlug,
  faCheckCircle,
  faInfoCircle,
  faLightbulb,
  faSpinner,
  faWandSparkles,
  faRocket,
  faShieldAlt,
  faClock,
  faTools,
  faBox,
  faBolt,
  faRoute,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import ServiceSummaryPanel from "@/components/services/ServiceSummaryPanel";
import ServiceConditionsModal from "@/components/services/ServiceConditionsModal";
import { supabase } from "@/lib/supabase/client";
import { ServiceFormData } from "@/components/services/ServiceFormBase";

// Mapeo de servicios a configuraciones específicas (sin precios, se obtienen de BD)
const SERVICE_CONFIG: Record<string, {
  name: string;
  icon: any;
  questions: {
    action?: boolean;
    quantity?: boolean;
    hasMaterials?: boolean;
    hasExistingContact?: boolean;
    additionalInfo?: boolean;
  };
  serviceNameMatch: string; // Nombre para buscar en service_catalog
  actionOptions: Array<{ value: string; label: string; icon: any; description: string; color: string }>;
}> = {
  "instalacion-contactos": {
    name: "Instalación de Contactos",
    icon: faPlug,
    questions: {
      action: true,
      quantity: true,
      hasMaterials: true,
      hasExistingContact: true,
      additionalInfo: true,
    },
    serviceNameMatch: "Instalación de Contacto",
    actionOptions: [
      { 
        value: "instalar", 
        label: "Instalar Contactos", 
        icon: faBolt, 
        description: "Nueva instalación",
        color: "from-blue-500 to-cyan-500"
      },
      { 
        value: "reemplazar", 
        label: "Reemplazar Contactos", 
        icon: faTools, 
        description: "Cambiar contacto existente",
        color: "from-purple-500 to-pink-500"
      },
      { 
        value: "visita", 
        label: "Visita de Inspección Preliminar", 
        icon: faInfoCircle, 
        description: "Evaluación y diagnóstico",
        color: "from-amber-500 to-orange-500"
      },
    ],
  },
  "instalacion-de-contactos": {
    name: "Instalación de Contactos",
    icon: faPlug,
    questions: {
      action: true,
      quantity: true,
      hasMaterials: true,
      hasExistingContact: true,
      additionalInfo: true,
    },
    serviceNameMatch: "Instalación de Contacto",
    actionOptions: [
      { 
        value: "instalar", 
        label: "Instalar Contactos", 
        icon: faBolt, 
        description: "Nueva instalación",
        color: "from-blue-500 to-cyan-500"
      },
      { 
        value: "reemplazar", 
        label: "Reemplazar Contactos", 
        icon: faTools, 
        description: "Cambiar contacto existente",
        color: "from-purple-500 to-pink-500"
      },
      { 
        value: "visita", 
        label: "Visita de Inspección Preliminar", 
        icon: faInfoCircle, 
        description: "Evaluación y diagnóstico",
        color: "from-amber-500 to-orange-500"
      },
    ],
  },
  "reparacion-de-cortos-circuitos": {
    name: "Reparación de Cortos Circuitos",
    icon: faLightbulb,
    questions: {
      action: true,
      quantity: true,
      hasMaterials: false,
      hasExistingContact: false,
      additionalInfo: true,
    },
    serviceNameMatch: "Reparación de Corto Circuito",
    actionOptions: [
      { 
        value: "reparar", 
        label: "Reparar", 
        icon: faTools, 
        description: "Solución inmediata",
        color: "from-red-500 to-pink-500"
      },
      { 
        value: "visita", 
        label: "Diagnóstico", 
        icon: faInfoCircle, 
        description: "Evaluación del problema",
        color: "from-amber-500 to-orange-500"
      },
    ],
  },
  "instalacion-de-luminarias": {
    name: "Instalación de Luminarias",
    icon: faLightbulb,
    questions: {
      action: true,
      quantity: true,
      hasMaterials: true,
      hasExistingContact: false,
      additionalInfo: true,
    },
    serviceNameMatch: "Instalación de Luminaria LED",
    actionOptions: [
      { 
        value: "instalar", 
        label: "Instalar", 
        icon: faBolt, 
        description: "Nueva instalación",
        color: "from-blue-500 to-cyan-500"
      },
      { 
        value: "reemplazar", 
        label: "Reemplazar", 
        icon: faTools, 
        description: "Cambiar luminaria",
        color: "from-purple-500 to-pink-500"
      },
    ],
  },
  "cableado-electrico": {
    name: "Cableado Eléctrico",
    icon: faPlug,
    questions: {
      action: true,
      quantity: false,
      hasMaterials: true,
      hasExistingContact: false,
      additionalInfo: true,
    },
    serviceNameMatch: "Cableado Nuevo (Habitación)",
    actionOptions: [
      { 
        value: "instalar", 
        label: "Instalación", 
        icon: faBolt, 
        description: "Cableado completo",
        color: "from-blue-500 to-cyan-500"
      },
    ],
  },
  "instalacion-de-ventiladores": {
    name: "Instalación de Ventiladores",
    icon: faLightbulb,
    questions: {
      action: true,
      quantity: true,
      hasMaterials: true,
      hasExistingContact: false,
      additionalInfo: true,
    },
    serviceNameMatch: "Instalación de Ventilador de Techo",
    actionOptions: [
      { 
        value: "instalar", 
        label: "Instalar", 
        icon: faBolt, 
        description: "Nueva instalación",
        color: "from-blue-500 to-cyan-500"
      },
    ],
  },
  "reparacion-de-tableros": {
    name: "Reparación de Tableros",
    icon: faPlug,
    questions: {
      action: true,
      quantity: false,
      hasMaterials: false,
      hasExistingContact: false,
      additionalInfo: true,
    },
    serviceNameMatch: "Actualización de Tablero Eléctrico",
    actionOptions: [
      { 
        value: "reparar", 
        label: "Reparar", 
        icon: faTools, 
        description: "Solución técnica",
        color: "from-red-500 to-pink-500"
      },
      { 
        value: "visita", 
        label: "Evaluación", 
        icon: faInfoCircle, 
        description: "Diagnóstico completo",
        color: "from-amber-500 to-orange-500"
      },
    ],
  },
};

export default function ElectricidadServicePage() {
  const router = useRouter();
  const params = useParams();
  let serviceSlug = params?.serviceSlug as string;
  
  // Normalizar slug: "instalacion-de-contactos" -> "instalacion-contactos"
  if (serviceSlug === "instalacion-de-contactos") {
    serviceSlug = "instalacion-contactos";
  }
  
  const serviceConfig = SERVICE_CONFIG[serviceSlug] || {
    name: "Servicio Eléctrico",
    icon: faPlug,
    questions: {
      action: true,
      quantity: true,
      hasMaterials: true,
      hasExistingContact: true,
      additionalInfo: true,
    },
    serviceNameMatch: "Instalación de Contacto",
    actionOptions: [
      { 
        value: "instalar", 
        label: "Instalar Contactos", 
        icon: faBolt, 
        description: "Nueva instalación",
        color: "from-blue-500 to-cyan-500"
      },
      { 
        value: "reemplazar", 
        label: "Reemplazar Contactos", 
        icon: faTools, 
        description: "Cambiar contacto existente",
        color: "from-purple-500 to-pink-500"
      },
      { 
        value: "visita", 
        label: "Visita de Inspección Preliminar", 
        icon: faInfoCircle, 
        description: "Evaluación y diagnóstico",
        color: "from-amber-500 to-orange-500"
      },
    ],
  };

  const [formData, setFormData] = useState<ServiceFormData>({
    action: null,
    quantity: null,
    hasMaterials: null,
    hasExistingInfrastructure: null,
    additionalInfo: "",
  });
  const [showConditions, setShowConditions] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<{
    laborPrice: number;
    materialsPrice: number;
    totalPrice: number;
  } | null>(null);
  const [serviceCatalogData, setServiceCatalogData] = useState<{
    min_price: number;
    max_price: number | null;
    price_type: "fixed" | "range" | "starting_at";
    unit: string;
    includes_materials: boolean;
  } | null>(null);
  const [loadingServiceData, setLoadingServiceData] = useState(true);

  // Calcular progreso del formulario (después de formData)
  const progress = useMemo(() => {
    let completed = 0;
    let total = 0;

    if (serviceConfig.questions.action) {
      total++;
      if (formData.action) completed++;
    }
    if (serviceConfig.questions.quantity) {
      total++;
      if (formData.quantity) completed++;
    }
    if (serviceConfig.questions.hasMaterials) {
      total++;
      if (formData.hasMaterials !== null) completed++;
    }
    if (serviceConfig.questions.hasExistingContact) {
      total++;
      if ((formData as any).hasExistingContact !== null && (formData as any).hasExistingContact !== undefined) completed++;
    }

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [formData, serviceConfig]);

  // Obtener datos del servicio desde la base de datos
  useEffect(() => {
    const fetchServiceData = async () => {
      setLoadingServiceData(true);
      try {
        const { data, error } = await supabase
          .from("service_catalog")
          .select("min_price, max_price, price_type, unit, includes_materials")
          .eq("discipline", "electricidad")
          .eq("service_name", serviceConfig.serviceNameMatch)
          .eq("is_active", true)
          .maybeSingle();

        if (error) {
          console.error("Error fetching service data:", error);
        } else if (data) {
          setServiceCatalogData(data);
        } else {
          console.warn(`Servicio no encontrado: ${serviceConfig.serviceNameMatch}`);
          // Valores por defecto si no se encuentra
          setServiceCatalogData({
            min_price: 350,
            max_price: null,
            price_type: "fixed",
            unit: "servicio",
            includes_materials: false,
          });
        }
      } catch (err) {
        console.error("Error in fetchServiceData:", err);
      } finally {
        setLoadingServiceData(false);
      }
    };

    fetchServiceData();
  }, [serviceConfig.serviceNameMatch]);

  // Calcular precio estimado cuando cambian los datos
  useEffect(() => {
    if (serviceCatalogData && formData.action && (serviceConfig.questions.quantity ? formData.quantity : true)) {
      calculatePriceEstimate();
    }
  }, [formData, serviceConfig, serviceCatalogData]);

  const calculatePriceEstimate = async () => {
    if (!serviceCatalogData) return;

    // Precio base de mano de obra desde la BD
    let laborPrice = serviceCatalogData.min_price;
    
    // Si es rango, usar el mínimo para el cálculo base
    if (serviceCatalogData.price_type === "range" && serviceCatalogData.max_price) {
      // Para rangos, usar el promedio o el mínimo según la acción
      if (formData.action === "reparar" || formData.action === "visita") {
        laborPrice = (serviceCatalogData.min_price + serviceCatalogData.max_price) / 2;
      }
    }
    
    // Ajustar según acción
    if (formData.action === "reemplazar") {
      laborPrice = laborPrice * 0.9; // 10% menos para reemplazo
    } else if (formData.action === "visita") {
      laborPrice = laborPrice * 1.2; // 20% más para visita
    } else if (formData.action === "reparar") {
      laborPrice = laborPrice * 1.1; // 10% más para reparación
    }

    // Multiplicar por cantidad si aplica
    const totalLabor = serviceConfig.questions.quantity && formData.quantity
      ? laborPrice * formData.quantity
      : laborPrice;

    // Precio de materiales si no los tiene - usar estimado fijo
    let materialsPrice = 0;
    if (serviceConfig.questions.hasMaterials && formData.hasMaterials === false) {
      // Estimado fijo basado en el precio del servicio (30% del precio base)
      const materialsBasePrice = serviceCatalogData.min_price * 0.3;
      materialsPrice = serviceConfig.questions.quantity && formData.quantity
        ? materialsBasePrice * formData.quantity
        : materialsBasePrice;
    }

    // NO sumar costo de cableado - solo se mostrará advertencia
    // El técnico confirmará los materiales exactos necesarios en sitio

    const totalPrice = totalLabor + materialsPrice;

    setPriceEstimate({
      laborPrice: totalLabor,
      materialsPrice: materialsPrice,
      totalPrice,
    });
  };

  const handleContinue = () => {
    // Validar campos requeridos
    if (!formData.action) {
      alert("Por favor selecciona qué necesitas");
      return;
    }
    if (serviceConfig.questions.quantity && !formData.quantity) {
      alert("Por favor indica la cantidad");
      return;
    }
    if (serviceConfig.questions.hasMaterials && formData.hasMaterials === null) {
      alert("Por favor indica si tienes los materiales");
      return;
    }
    if (serviceConfig.questions.hasExistingContact && formData.hasExistingContact === null) {
      alert("Por favor indica si ya existe contacto eléctrico");
      return;
    }

    // Construir descripción detallada con toda la información
    const actionText = serviceConfig.actionOptions?.find(opt => opt.value === formData.action)?.label || 
      (formData.action === "instalar" ? "Instalación" 
      : formData.action === "reemplazar" ? "Reemplazo" 
      : formData.action === "reparar" ? "Reparación"
      : "Visita de Inspección Preliminar");
    
    const quantityText = serviceConfig.questions.quantity && formData.quantity
      ? ` de ${formData.quantity} ${formData.quantity === 1 ? "unidad" : "unidades"}`
      : "";
    
    // Construir texto de materiales
    let materialsText = "";
    if (serviceConfig.questions.hasMaterials) {
      if (formData.hasMaterials) {
        materialsText = "Cliente proporciona los materiales.";
      } else {
        materialsText = "Necesario cotizar materiales por separado.";
      }
    }
    
    const contactText = serviceConfig.questions.hasExistingContact
      ? formData.hasExistingContact ? "Ya existe contacto eléctrico instalado." : "No existe contacto eléctrico, es una nueva instalación."
      : "";
    
    // Texto de advertencia si es nueva instalación
    let wiringText = "";
    if (serviceConfig.questions.hasExistingContact && formData.hasExistingContact === false) {
      wiringText = "Nueva instalación: El costo puede variar según la integración de cableado, cajas de interconexión y tubería necesarios. El técnico evaluará en sitio y confirmará el costo final.";
    }
    
    // Construir descripción completa y detallada
    let descriptionParts = [
      `Me interesa: ${actionText}${quantityText} de ${serviceConfig.name.toLowerCase()}.`
    ];
    
    if (materialsText) {
      descriptionParts.push(materialsText);
    }
    
    if (contactText) {
      descriptionParts.push(contactText);
    }
    
    if (wiringText) {
      descriptionParts.push(wiringText);
    }
    
    if (formData.additionalInfo && formData.additionalInfo.trim()) {
      descriptionParts.push(`Información adicional: ${formData.additionalInfo.trim()}`);
    }
    
    // Agregar precio estimado si está disponible
    if (priceEstimate) {
      descriptionParts.push(
        `Precio estimado: Mano de obra $${priceEstimate.laborPrice.toLocaleString("es-MX")}${priceEstimate.materialsPrice > 0 ? ` + Materiales $${priceEstimate.materialsPrice.toLocaleString("es-MX")}` : ""} = Total $${priceEstimate.totalPrice.toLocaleString("es-MX")}.`
      );
    }
    
    const description = descriptionParts.join(" ");

    // Redirigir al dashboard con datos prellenados, abriendo directamente en el Paso 2
    const params = new URLSearchParams({
      service: serviceConfig.name,
      discipline: "electricidad",
      description: description,
      step: "2", // Abrir directamente en el paso 2 (descripción)
    });

    router.push(`/dashboard/client?${params.toString()}`);
  };

  const canContinue = () => {
    if (!formData.action) return false;
    if (serviceConfig.questions.quantity && !formData.quantity) return false;
    if (serviceConfig.questions.hasMaterials && formData.hasMaterials === null) return false;
    if (serviceConfig.questions.hasExistingContact && formData.hasExistingContact === null) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/30">
      {/* Header Mejorado */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            <span>Volver</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de Progreso Superior */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={serviceConfig.icon} className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {serviceConfig.name}
                </h1>
                <p className="text-gray-600 text-sm">
                  Completa el formulario para obtener una cotización precisa
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{progress}%</div>
              <div className="text-xs text-gray-500">Completado</div>
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Formulario Mejorado */}
          <div className="lg:col-span-2 space-y-6">

            {/* Pregunta 1: ¿Qué necesitas? - Mejorada */}
            {serviceConfig.questions.action && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faWandSparkles} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    ¿Qué tipo de servicio necesitas?
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {serviceConfig.actionOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, action: option.value as any })}
                      className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        formData.action === option.value
                          ? `border-transparent bg-gradient-to-br ${option.color} text-white shadow-xl scale-105`
                          : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md text-gray-700"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          formData.action === option.value
                            ? "bg-white/20 backdrop-blur-sm"
                            : `bg-gradient-to-br ${option.color}`
                        }`}>
                          <FontAwesomeIcon 
                            icon={option.icon} 
                            className="text-2xl text-white"
                          />
                        </div>
                        <div>
                          <div className={`font-bold text-lg ${formData.action === option.value ? "text-white" : "text-gray-900"}`}>
                            {option.label}
                          </div>
                          <div className={`text-sm mt-1 ${formData.action === option.value ? "text-white/90" : "text-gray-500"}`}>
                            {option.description}
                          </div>
                        </div>
                        {formData.action === option.value && (
                          <div className="absolute top-2 right-2">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pregunta 2: ¿Cuántos? - Mejorada */}
            {serviceConfig.questions.quantity && formData.action && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faBox} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    ¿Cuántas unidades necesitas?
                  </h3>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setFormData({ ...formData, quantity: num })}
                      className={`relative w-14 h-14 rounded-xl border-2 font-bold text-lg transition-all duration-300 transform hover:scale-110 ${
                        formData.quantity === num
                          ? "border-purple-500 bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg scale-110"
                          : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md text-gray-700"
                      }`}
                    >
                      {num}
                      {formData.quantity === num && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xs" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {formData.quantity && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700">
                      <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                      Has seleccionado <strong>{formData.quantity} {formData.quantity === 1 ? "unidad" : "unidades"}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pregunta 3: ¿Tienes los materiales? - Mejorada */}
            {serviceConfig.questions.hasMaterials && formData.quantity && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faTools} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      ¿Tienes los materiales?
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Si no los tienes, los cotizamos por separado
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: true, label: "Sí, los tengo", icon: faCheckCircle, color: "from-green-500 to-emerald-500" },
                    { value: false, label: "No, necesito cotización", icon: faBox, color: "from-blue-500 to-cyan-500" },
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      onClick={() => setFormData({ ...formData, hasMaterials: option.value })}
                      className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        formData.hasMaterials === option.value
                          ? `border-transparent bg-gradient-to-br ${option.color} text-white shadow-xl`
                          : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md text-gray-700"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          formData.hasMaterials === option.value
                            ? "bg-white/20 backdrop-blur-sm"
                            : `bg-gradient-to-br ${option.color}`
                        }`}>
                          <FontAwesomeIcon 
                            icon={option.icon} 
                            className="text-xl text-white"
                          />
                        </div>
                        <span className="font-semibold text-lg">{option.label}</span>
                      </div>
                      {formData.hasMaterials === option.value && (
                        <div className="absolute top-2 right-2">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pregunta 4: ¿Ya existe contacto eléctrico? - Mejorada */}
            {serviceConfig.questions.hasExistingContact && formData.hasMaterials !== null && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faPlug} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      ¿Ya existe contacto eléctrico instalado?
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Esto nos ayuda a calcular mejor el tiempo y precio
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: true, label: "Sí, ya existe", icon: faCheckCircle, color: "from-green-500 to-emerald-500" },
                    { value: false, label: "No, es nuevo", icon: faBolt, color: "from-blue-500 to-cyan-500" },
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      onClick={() => setFormData({ ...formData, hasExistingContact: option.value })}
                      className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        formData.hasExistingContact === option.value
                          ? `border-transparent bg-gradient-to-br ${option.color} text-white shadow-xl`
                          : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md text-gray-700"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          formData.hasExistingContact === option.value
                            ? "bg-white/20 backdrop-blur-sm"
                            : `bg-gradient-to-br ${option.color}`
                        }`}>
                          <FontAwesomeIcon 
                            icon={option.icon} 
                            className="text-xl text-white"
                          />
                        </div>
                        <span className="font-semibold text-lg">{option.label}</span>
                      </div>
                      {formData.hasExistingContact === option.value && (
                        <div className="absolute top-2 right-2">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Advertencia sobre variación de costo (solo si es nueva instalación) */}
                {formData.hasExistingContact === false && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <FontAwesomeIcon icon={faInfoCircle} className="text-amber-600 text-xl" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-semibold text-amber-800 mb-1">
                            ⚠️ Advertencia sobre el costo
                          </h4>
                          <p className="text-sm text-amber-700">
                            Al ser una nueva instalación, el costo puede variar según la integración de <strong>cableado, cajas de interconexión y tubería</strong> necesarios. El técnico evaluará en sitio y confirmará el costo final antes de iniciar el trabajo.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pregunta 5: Información adicional - Mejorada */}
            {serviceConfig.questions.additionalInfo && 
             ((serviceConfig.questions.hasExistingContact && formData.hasExistingContact !== null) ||
              (serviceConfig.questions.hasMaterials && formData.hasMaterials !== null && !serviceConfig.questions.hasExistingContact) ||
              (formData.action && !serviceConfig.questions.hasMaterials && !serviceConfig.questions.hasExistingContact)) && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Información adicional (Opcional)
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Cualquier detalle que nos ayude a darte un mejor servicio
                    </p>
                  </div>
                </div>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="Ej: El contacto está en la cocina, necesito que sea resistente al agua..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all"
                  rows={4}
                />
              </div>
            )}
          </div>

          {/* Columna Derecha: Resumen Mejorado */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {loadingServiceData ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center justify-center space-x-3">
                    <FontAwesomeIcon icon={faSpinner} spin className="text-purple-600" />
                    <span className="text-gray-600">Cargando...</span>
                  </div>
                </div>
              ) : (
                <>
                  <ServiceSummaryPanel
                    serviceName={serviceConfig.name}
                    serviceId={serviceSlug}
                    formData={formData}
                    priceEstimate={priceEstimate || undefined}
                    onShowConditions={() => setShowConditions(true)}
                    className="shadow-xl"
                  />

                  {/* Badges de Confianza */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <FontAwesomeIcon icon={faShieldAlt} className="text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Garantía 7 días</div>
                          <div className="text-xs text-gray-500">En mano de obra</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <FontAwesomeIcon icon={faClock} className="text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Respuesta rápida</div>
                          <div className="text-xs text-gray-500">Técnicos verificados</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botón de continuar mejorado */}
                  {canContinue() && (
                    <button
                      onClick={handleContinue}
                      className="w-full px-6 py-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center space-x-2">
                        <span>Continuar con el Servicio</span>
                        <FontAwesomeIcon icon={faRocket} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Condiciones */}
      <ServiceConditionsModal
        isOpen={showConditions}
        onClose={() => setShowConditions(false)}
        serviceName={serviceConfig.name}
        serviceId={serviceSlug}
      />
    </div>
  );
}

