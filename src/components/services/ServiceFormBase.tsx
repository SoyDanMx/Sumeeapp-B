"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheckCircle,
  faInfoCircle,
  faSpinner,
  faWandSparkles,
  faRocket,
  faShieldAlt,
  faClock,
  faTools,
  faBox,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import ServiceSummaryPanel from "@/components/services/ServiceSummaryPanel";
import ServiceConditionsModal from "@/components/services/ServiceConditionsModal";
import { supabase } from "@/lib/supabase/client";

export interface ServiceFormData {
  action: string | null;
  quantity: number | null;
  hasMaterials: boolean | null;
  hasExistingInfrastructure?: boolean | null; // Genérico para diferentes tipos de infraestructura
  additionalInfo: string;
  [key: string]: any; // Para campos adicionales específicos de cada disciplina
}

export interface ServiceConfig {
  name: string;
  icon: any;
  discipline: string;
  questions: {
    action?: boolean;
    quantity?: boolean;
    hasMaterials?: boolean;
    hasExistingInfrastructure?: boolean;
    additionalInfo?: boolean;
    [key: string]: boolean | undefined;
  };
  serviceNameMatch: string;
  actionOptions: Array<{
    value: string;
    label: string;
    icon: any;
    description: string;
    color: string;
  }>;
  customQuestions?: Array<{
    id: string;
    label: string;
    type: "boolean" | "number" | "text";
    options?: Array<{ value: any; label: string }>;
    condition?: (formData: ServiceFormData) => boolean;
  }>;
  warningMessage?: string; // Mensaje de advertencia específico
}

interface ServiceFormBaseProps {
  config: ServiceConfig;
  onContinue: (formData: ServiceFormData, priceEstimate: any) => void;
}

export default function ServiceFormBase({ config, onContinue }: ServiceFormBaseProps) {
  const router = useRouter();

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

  // Calcular progreso del formulario
  const progress = useMemo(() => {
    let completed = 0;
    let total = 0;

    if (config.questions.action) {
      total++;
      if (formData.action) completed++;
    }
    if (config.questions.quantity) {
      total++;
      if (formData.quantity) completed++;
    }
    if (config.questions.hasMaterials) {
      total++;
      if (formData.hasMaterials !== null) completed++;
    }
    if (config.questions.hasExistingInfrastructure) {
      total++;
      if (formData.hasExistingInfrastructure !== null) completed++;
    }

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [formData, config]);

  // Obtener datos del servicio desde la base de datos
  useEffect(() => {
    const fetchServiceData = async () => {
      setLoadingServiceData(true);
      try {
        const { data, error } = await supabase
          .from("service_catalog")
          .select("min_price, max_price, price_type, unit, includes_materials")
          .eq("discipline", config.discipline)
          .eq("service_name", config.serviceNameMatch)
          .eq("is_active", true)
          .maybeSingle();

        if (error) {
          console.error("Error fetching service data:", error);
        } else if (data) {
          setServiceCatalogData(data);
        } else {
          console.warn(`Servicio no encontrado: ${config.serviceNameMatch}`);
          // Valores por defecto
          setServiceCatalogData({
            min_price: 500,
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
  }, [config.discipline, config.serviceNameMatch]);

  // Calcular precio estimado
  useEffect(() => {
    if (!serviceCatalogData) return;
    calculatePriceEstimate();
  }, [formData, serviceCatalogData, config]);

  const calculatePriceEstimate = () => {
    if (!serviceCatalogData) return;

    let laborPrice = serviceCatalogData.min_price;

    if (serviceCatalogData.price_type === "range" && serviceCatalogData.max_price) {
      if (formData.action === "reparar" || formData.action === "visita") {
        laborPrice = (serviceCatalogData.min_price + serviceCatalogData.max_price) / 2;
      }
    }

    if (formData.action === "reemplazar") {
      laborPrice = laborPrice * 0.9;
    } else if (formData.action === "visita") {
      laborPrice = laborPrice * 1.2;
    } else if (formData.action === "reparar") {
      laborPrice = laborPrice * 1.1;
    }

    const totalLabor = config.questions.quantity && formData.quantity
      ? laborPrice * formData.quantity
      : laborPrice;

    let materialsPrice = 0;
    if (config.questions.hasMaterials && formData.hasMaterials === false) {
      const materialsBasePrice = serviceCatalogData.min_price * 0.3;
      materialsPrice = (config.questions.quantity && formData.quantity)
        ? materialsBasePrice * formData.quantity
        : materialsBasePrice;
    }

    const totalPrice = totalLabor + materialsPrice;

    setPriceEstimate({
      laborPrice: Math.round(totalLabor),
      materialsPrice: Math.round(materialsPrice),
      totalPrice: Math.round(totalPrice),
    });
  };

  const handleContinue = () => {
    if (!formData.action) {
      alert("Por favor selecciona qué necesitas");
      return;
    }
    if (config.questions.quantity && !formData.quantity) {
      alert("Por favor indica la cantidad");
      return;
    }
    if (config.questions.hasMaterials && formData.hasMaterials === null) {
      alert("Por favor indica si tienes los materiales");
      return;
    }
    if (config.questions.hasExistingInfrastructure && formData.hasExistingInfrastructure === null) {
      alert("Por favor completa todas las preguntas");
      return;
    }

    onContinue(formData, priceEstimate);
  };

  const canContinue = () => {
    if (!formData.action) return false;
    if (config.questions.quantity && !formData.quantity) return false;
    if (config.questions.hasMaterials && formData.hasMaterials === null) return false;
    if (config.questions.hasExistingInfrastructure && formData.hasExistingInfrastructure === null) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/30">
      {/* Header */}
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
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={config.icon} className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{config.name}</h1>
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
          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Question */}
            {config.questions.action && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faWandSparkles} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">¿Qué tipo de servicio necesitas?</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {config.actionOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, action: option.value })}
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
                          <FontAwesomeIcon icon={option.icon} className="text-2xl text-white" />
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

            {/* Quantity Question */}
            {config.questions.quantity && formData.action && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faBox} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">¿Cuántas unidades necesitas?</h3>
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
              </div>
            )}

            {/* Materials Question */}
            {config.questions.hasMaterials && formData.quantity && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faTools} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">¿Tienes los materiales?</h3>
                    <p className="text-sm text-gray-500 mt-1">Si no los tienes, los cotizamos por separado</p>
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
                          <FontAwesomeIcon icon={option.icon} className="text-xl text-white" />
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

            {/* Existing Infrastructure Question */}
            {config.questions.hasExistingInfrastructure && formData.hasMaterials !== null && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={config.icon} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {config.name.includes("Contacto") ? "¿Ya existe contacto eléctrico instalado?" : "¿Ya tienes la infraestructura necesaria?"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Esto nos ayuda a calcular mejor el tiempo y precio</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: true, label: "Sí, ya existe", icon: faCheckCircle, color: "from-green-500 to-emerald-500" },
                    { value: false, label: "No, es nuevo", icon: faBolt, color: "from-blue-500 to-cyan-500" },
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      onClick={() => setFormData({ ...formData, hasExistingInfrastructure: option.value })}
                      className={`group relative p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        formData.hasExistingInfrastructure === option.value
                          ? `border-transparent bg-gradient-to-br ${option.color} text-white shadow-xl`
                          : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md text-gray-700"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          formData.hasExistingInfrastructure === option.value
                            ? "bg-white/20 backdrop-blur-sm"
                            : `bg-gradient-to-br ${option.color}`
                        }`}>
                          <FontAwesomeIcon icon={option.icon} className="text-xl text-white" />
                        </div>
                        <span className="font-semibold text-lg">{option.label}</span>
                      </div>
                      {formData.hasExistingInfrastructure === option.value && (
                        <div className="absolute top-2 right-2">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Warning Message */}
                {formData.hasExistingInfrastructure === false && config.warningMessage && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <FontAwesomeIcon icon={faInfoCircle} className="text-amber-600 text-xl" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-semibold text-amber-800 mb-1">⚠️ Advertencia sobre el costo</h4>
                          <p className="text-sm text-amber-700">{config.warningMessage}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Additional Info */}
            {config.questions.additionalInfo && 
             ((config.questions.hasExistingInfrastructure && formData.hasExistingInfrastructure !== null) ||
              (config.questions.hasMaterials && formData.hasMaterials !== null && !config.questions.hasExistingInfrastructure) ||
              (formData.action && !config.questions.hasMaterials && !config.questions.hasExistingInfrastructure)) && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Información adicional (Opcional)</h3>
                    <p className="text-sm text-gray-500 mt-1">Cualquier detalle que nos ayude a darte un mejor servicio</p>
                  </div>
                </div>
                <textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  placeholder="Ej: El servicio está en la cocina, necesito que sea resistente al agua..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all"
                  rows={4}
                />
              </div>
            )}
          </div>

          {/* Right Column: Summary */}
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
                    serviceName={config.name}
                    serviceId={config.discipline}
                    formData={formData}
                    priceEstimate={priceEstimate || undefined}
                    onShowConditions={() => setShowConditions(true)}
                    className="shadow-xl"
                  />

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

      <ServiceConditionsModal
        isOpen={showConditions}
        onClose={() => setShowConditions(false)}
        serviceName={config.name}
        serviceId={config.discipline}
      />
    </div>
  );
}

