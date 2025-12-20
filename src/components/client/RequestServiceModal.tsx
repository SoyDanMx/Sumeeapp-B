"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faArrowLeft,
  faArrowRight,
  faCamera,
  faMapMarkerAlt,
  faCheck,
  faSpinner,
  faWrench,
  faLightbulb,
  faThermometerHalf,
  faKey,
  faPaintBrush,
  faBroom,
  faSeedling,
  faHammer,
  faVideo,
  faWifi,
  faBug,
  faHardHat,
  faCubes,
  faExclamationTriangle,
  faTools,
  faTv,
  faCouch,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp as faWhatsappBrand } from "@fortawesome/free-brands-svg-icons";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { sanitizeInput, sanitizePhone } from "@/lib/sanitize";
import { getAddressSuggestions, formatAddressSuggestion, AddressSuggestion } from "@/lib/address-autocomplete";
import ServicePricingSelector from "@/components/services/ServicePricingSelector";
import ServiceSummaryPanel from "@/components/services/ServiceSummaryPanel";

interface RequestServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated?: () => void;
  initialService?: string | null;
  initialServiceName?: string | null; // Nombre específico del servicio del catálogo
  initialDescription?: string | null; // Descripción prellenada para el paso 2
  initialStep?: number; // Paso inicial del modal (1-4)
}

// 🆕 Lista de servicios populares para auto-selección de categoría
const popularServiceNames = [
  "Montar TV en Pared",
  "Armado de muebles",
  "Instalación de Apagador",
  "Reparación de Fuga de Agua",
  "Limpieza Residencial Básica",
  "Instalación de Lámpara",
  "Instalación de Cámara CCTV",
];

// Función helper para verificar si un servicio es popular
const isPopularService = (serviceName: string | null | undefined): boolean => {
  if (!serviceName) return false;
  return popularServiceNames.some(
    (popular) => serviceName.toLowerCase().includes(popular.toLowerCase()) ||
                 popular.toLowerCase().includes(serviceName.toLowerCase())
  );
};

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

type AiStatus = "idle" | "typing" | "loading" | "success" | "error";

interface AiSuggestion {
  disciplina?: string | null;
  diagnostico?: string | null;
  urgencia?: number | string | null;
}

const disciplineServiceMap: Record<string, string | null> = {
  electricidad: "electricidad",
  "problema electrico": "electricidad",
  plomería: "plomeria",
  plomeria: "plomeria",
  hvac: "aire-acondicionado",
  "aire acondicionado": "aire-acondicionado",
  carpintería: "carpinteria",
  carpinteria: "carpinteria",
  albañilería: "construccion",
  albañileria: "construccion",
  otros: null,
};

const mapDisciplineToServiceId = (disciplina: string | undefined | null) => {
  if (!disciplina) return null;
  const normalized = disciplina.toLowerCase().trim();
  if (disciplineServiceMap[normalized] !== undefined) {
    return disciplineServiceMap[normalized];
  }

  if (normalized.includes("electric")) return "electricidad";
  if (normalized.includes("plom")) return "plomeria";
  if (normalized.includes("hvac") || normalized.includes("clima")) {
    return "aire-acondicionado";
  }
  if (normalized.includes("aire")) return "aire-acondicionado";
  if (normalized.includes("carp")) return "carpinteria";
  if (normalized.includes("albañ") || normalized.includes("alban")) {
    return "construccion";
  }

  return null;
};

const mapUrgencyToLabel = (urgencia?: number | null) => {
  if (typeof urgencia !== "number" || Number.isNaN(urgencia)) {
    return null;
  }
  if (urgencia >= 8) return "emergencia";
  if (urgencia >= 5) return "urgente";
  return "normal";
};

const normalizeWhatsappNumber = (input: string) => {
  const digits = (input || "").replace(/\D/g, "");

  if (digits.length === 0) {
    return { normalized: "", isValid: false };
  }

  if (digits.startsWith("521") && digits.length === 13) {
    return { normalized: `52${digits.slice(3)}`, isValid: true };
  }

  if (digits.startsWith("52") && digits.length === 12) {
    return { normalized: digits, isValid: true };
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    const trimmed = digits.slice(1);
    return {
      normalized: trimmed.length === 10 ? `52${trimmed}` : digits,
      isValid: trimmed.length === 10,
    };
  }

  if (digits.length === 10) {
    return { normalized: `52${digits}`, isValid: true };
  }

  if (digits.length > 12 && digits.startsWith("52")) {
    const trimmed = digits.slice(0, 12);
    return { normalized: trimmed, isValid: trimmed.length === 12 };
  }

  return { normalized: digits, isValid: false };
};

const formatWhatsappForDisplay = (normalized: string) => {
  if (!normalized) return "";

  const localDigits = normalized.startsWith("52")
    ? normalized.slice(2)
    : normalized;

  if (localDigits.length === 10) {
    return localDigits.replace(/(\d{2})(\d{4})(\d{4})/, "$1 $2 $3");
  }

  return normalized;
};

export default function RequestServiceModal({
  isOpen,
  onClose,
  onLeadCreated,
  initialService,
  initialServiceName,
  initialDescription,
  initialStep,
}: RequestServiceModalProps) {
  // Inicializar el paso: si hay initialStep o initialDescription, usar paso 2, sino paso 1
  const [currentStep, setCurrentStep] = useState(() => {
    // Si hay initialStep explícito, usarlo
    if (initialStep !== undefined && initialStep >= 1 && initialStep <= 4) {
      return initialStep;
    }
    // Si hay initialDescription, abrir en paso 2
    if (initialDescription && initialDescription.trim()) {
      return 2;
    }
    return 1;
  });
  const [formData, setFormData] = useState({
    servicio: "",
    descripcion: "",
    imagen: null as File | null,
    ubicacion: "",
    urgencia: "normal",
    whatsapp: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmittingFreeRequest, setIsSubmittingFreeRequest] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasPrefilledWhatsapp = useRef(false);
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  
  // 🆕 Debug: Log cuando el modal se abre con parámetros
  useEffect(() => {
    if (isOpen && initialService && initialServiceName) {
      console.log('🎯 Modal abierto con servicio pre-seleccionado:', {
        initialService,
        initialServiceName,
        hasUser: !!user,
        hasProfile: !!profile,
      });
    }
  }, [isOpen, initialService, initialServiceName, user, profile]);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [iaStatus, setIaStatus] = useState<AiStatus>("idle");
  const [iaSuggestion, setIaSuggestion] = useState<AiSuggestion | null>(null);
  const [iaError, setIaError] = useState<string | null>(null);
  const [disciplinaIa, setDisciplinaIa] = useState<string | null>(null);
  const [urgenciaIa, setUrgenciaIa] = useState<number | null>(null);
  const [diagnosticoIa, setDiagnosticoIa] = useState<string | null>(null);
  const aiDebounceRef = useRef<number | null>(null);
  const lastClassifiedDescription = useRef<string>("");
  const [userOverrodeService, setUserOverrodeService] = useState(false);
  const [userOverrodeUrgency, setUserOverrodeUrgency] = useState(false);

  // Estados para autocompletado de direcciones
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoadingAddressSuggestions, setIsLoadingAddressSuggestions] = useState(false);
  const [selectedAddressCoords, setSelectedAddressCoords] = useState<{ lat: number; lng: number } | null>(null);
  const addressInputRef = useRef<HTMLDivElement>(null);
  const addressSuggestionsRef = useRef<HTMLDivElement>(null);
  const addressSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Estados para controlar visibilidad del header al hacer scroll
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // totalSteps: 4 pasos (sin pago - Stripe se implementará después)
  const totalSteps = 4;
  const prevInitialService = useRef<string | null>(null);

  const classifyDescription = useCallback(
    async (description: string) => {
      try {
        setIaStatus("loading");
        setIaError(null);

        const { data, error } = await supabase.functions.invoke<AiSuggestion>(
          "classify-service",
          {
            body: { description },
          },
        );

        if (error) {
          throw new Error(error.message);
        }

        lastClassifiedDescription.current = description;

        const extras = (data ?? {}) as Record<string, unknown>;
        const disciplina = data?.disciplina ??
          (extras["disciplina_ia"] as string | undefined) ?? null;
        const diagnostico =
          data?.diagnostico ??
            (extras["diagnostico_sugerido"] as string | undefined) ??
            (extras["diagnostico_ia"] as string | undefined) ??
            null;
        const urgenciaValueRaw = data?.urgencia ??
          (extras["urgencia_ia"] as number | string | undefined) ?? null;

        const urgenciaNumber = typeof urgenciaValueRaw === "number"
          ? urgenciaValueRaw
          : urgenciaValueRaw
          ? Number.parseInt(String(urgenciaValueRaw), 10)
          : null;

        setIaSuggestion({
          disciplina: disciplina ?? "Otros",
          diagnostico: diagnostico,
          urgencia: Number.isFinite(urgenciaNumber) ? urgenciaNumber : null,
        });
        setDisciplinaIa(disciplina ?? null);
        setDiagnosticoIa(diagnostico ?? null);
        setUrgenciaIa(
          Number.isFinite(urgenciaNumber) ? urgenciaNumber ?? null : null,
        );
        setIaStatus("success");

        if (!userOverrodeService) {
          const mappedService = mapDisciplineToServiceId(disciplina);
          if (mappedService) {
            setFormData((prev) => ({
              ...prev,
              servicio: mappedService,
            }));
          }
        }

        if (!userOverrodeUrgency && Number.isFinite(urgenciaNumber)) {
          const urgencyLabel = mapUrgencyToLabel(urgenciaNumber);
          if (urgencyLabel) {
            setFormData((prev) => ({
              ...prev,
              urgencia: urgencyLabel,
            }));
          }
        }
      } catch (classificationError) {
        console.error("❌ Error clasificando con IA:", classificationError);
        setIaStatus("error");
        setIaError(
          "No pudimos sugerir automáticamente. Puedes continuar manualmente.",
        );
      }
    },
    // supabase client es un singleton estable
    [supabase, userOverrodeService, userOverrodeUrgency],
  );

  useEffect(() => {
    if (!isOpen) {
      console.log('🚫 Modal cerrado, reseteando estado');
      // Reset refs cuando el modal se cierra
      hasPrefilledWhatsapp.current = false;
      hasPrefilledLocation.current = false;
      return;
    }

    console.log('🔄 useEffect de prellenado ejecutado:', {
      isOpen,
      initialService,
      initialServiceName,
      hasUser: !!user,
      hasProfile: !!profile,
    });

    const fetchServiceData = async () => {
    if (initialService) {
      const serviceId = initialService;
      const isEmergencyService =
        serviceId === "electricidad" || serviceId === "plomeria";

      // Mapeo de servicio a disciplina_ia para prellenado
      const disciplinaMap: Record<string, string> = {
        "electricidad": "Electricidad",
        "plomeria": "Plomería",
          "montaje-armado": "Montaje y Armado",
          "limpieza": "Limpieza",
          "cctv": "CCTV",
      };

        // Si hay initialDescription, usarla directamente (tiene prioridad sobre búsqueda en catálogo)
        if (initialDescription && initialDescription.trim()) {
          console.log('✅ [PRIORIDAD] Usando descripción prellenada desde formulario detallado');
      setFormData((prev) => ({
        ...prev,
        servicio: serviceId,
            descripcion: initialDescription.trim(),
        urgencia: isEmergencyService ? "emergencia" : prev.urgencia,
      }));
          setUserOverrodeService(true); // Marcar que el servicio fue prellenado
          if (isEmergencyService) {
            setUserOverrodeUrgency(true);
            if (disciplinaMap[serviceId]) {
              setDisciplinaIa(disciplinaMap[serviceId]);
            }
          }
          prevInitialService.current = serviceId; // Marcar que ya se procesó este servicio
          return; // Salir temprano, no buscar en catálogo
        }
        // Si hay un nombre de servicio específico pero NO hay initialDescription, buscar en catálogo
        else if (initialServiceName) {
          console.log('🔍 Buscando servicio en catálogo:', { serviceName: initialServiceName, discipline: serviceId });
          
          // Buscar el servicio en el catálogo para obtener precio y descripción completa
          try {
            const { data: serviceData, error: serviceError } = await supabase
              .from("service_catalog")
              .select("*")
              .eq("service_name", initialServiceName)
              .eq("discipline", serviceId)
              .eq("is_active", true)
              .maybeSingle() as { data: any; error: any };
            
            if (serviceError) {
              console.error('❌ Error al buscar servicio en catálogo:', serviceError);
            }
            
            if (!serviceError && serviceData) {
              const priceText = serviceData.price_type === "fixed"
                ? `$${serviceData.min_price.toLocaleString("es-MX")}`
                : serviceData.price_type === "range"
                ? `$${serviceData.min_price.toLocaleString("es-MX")} - $${(serviceData.max_price || 0).toLocaleString("es-MX")}`
                : `Desde $${serviceData.min_price.toLocaleString("es-MX")}`;
              
              const unitText = serviceData.unit !== "servicio" ? ` por ${serviceData.unit}` : "";
              const materialsText = serviceData.includes_materials
                ? " (Incluye materiales)"
                : " (Solo mano de obra - materiales aparte)";
              
              const fullDescription = `Me interesa: ${serviceData.service_name}. Precio: ${priceText}${unitText}${materialsText}`;
              
              console.log('✅ Servicio encontrado en catálogo, prellenando descripción:', fullDescription);
              
              setFormData((prev) => ({
                ...prev,
                servicio: serviceId,
                descripcion: fullDescription,
                urgencia: isEmergencyService ? "emergencia" : prev.urgencia,
              }));
            } else {
              // Si no se encuentra en el catálogo, usar descripción básica
              console.log('⚠️ Servicio no encontrado en catálogo, usando descripción básica');
              setFormData((prev) => ({
                ...prev,
                servicio: serviceId,
                descripcion: `Me interesa: ${initialServiceName}`,
                urgencia: isEmergencyService ? "emergencia" : prev.urgencia,
              }));
            }
          } catch (error) {
            console.error('❌ Error en búsqueda de catálogo:', error);
            // Fallback a descripción básica
            setFormData((prev) => ({
              ...prev,
              servicio: serviceId,
              descripcion: `Me interesa: ${initialServiceName}`,
              urgencia: isEmergencyService ? "emergencia" : prev.urgencia,
            }));
          }
        } else {
          setFormData((prev) => ({
            ...prev,
            servicio: serviceId,
            urgencia: isEmergencyService ? "emergencia" : prev.urgencia,
          }));
        }

      setUserOverrodeService(true);
      if (isEmergencyService) {
        setUserOverrodeUrgency(true);
        // Prellenar disciplina_ia para urgencias
        if (disciplinaMap[serviceId]) {
          setDisciplinaIa(disciplinaMap[serviceId]);
        }
      }

        // 🚀 No avanzar automáticamente aquí - el useEffect de avance automático inteligente lo hará
        // Esto permite que todos los prellenados se completen antes de avanzar
        // setCurrentStep((prev) => (prev === 1 ? 2 : prev));
      prevInitialService.current = serviceId;
      }
    };

    fetchServiceData();
    
    if (!initialService && prevInitialService.current) {
      prevInitialService.current = null;
      setFormData((prev) => ({
        ...prev,
        servicio: "",
        descripcion: "",
        urgencia: "normal",
      }));
      setUserOverrodeService(false);
      setUserOverrodeUrgency(false);
      setIaStatus("idle");
      setIaSuggestion(null);
      setIaError(null);
      setDisciplinaIa(null);
      setUrgenciaIa(null);
      setDiagnosticoIa(null);
      lastClassifiedDescription.current = "";
      setCurrentStep(1);
    }
  }, [initialService, initialServiceName, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const description = formData.descripcion.trim();

    if (aiDebounceRef.current) {
      clearTimeout(aiDebounceRef.current);
      aiDebounceRef.current = null;
    }

    if (description.length < 15) {
      if (iaStatus !== "idle") {
        setIaStatus("idle");
        setIaError(null);
      }
      setIaSuggestion(null);
      setDisciplinaIa(null);
      setDiagnosticoIa(null);
      setUrgenciaIa(null);
      lastClassifiedDescription.current = "";
      return;
    }

    if (description === lastClassifiedDescription.current) {
      return;
    }

    setIaStatus("typing");

    aiDebounceRef.current = window.setTimeout(() => {
      classifyDescription(description);
    }, 1000);

    return () => {
      if (aiDebounceRef.current) {
        clearTimeout(aiDebounceRef.current);
        aiDebounceRef.current = null;
      }
    };
  }, [formData.descripcion, isOpen, classifyDescription, iaStatus]);

  // Safety timeout: Reset isSubmittingFreeRequest si se queda atascado
  useEffect(() => {
    if (!isSubmittingFreeRequest) return;

    const safetyTimeout = setTimeout(() => {
      console.warn("⚠️ Safety timeout: isSubmittingFreeRequest estaba atascado, reseteando...");
      setIsSubmittingFreeRequest(false);
      setError("La solicitud está tardando demasiado. Por favor, intenta de nuevo.");
    }, 30000); // 30 segundos

    return () => {
      clearTimeout(safetyTimeout);
    };
  }, [isSubmittingFreeRequest]);

  const handleServiceSelect = (serviceId: string) => {
    setUserOverrodeService(true);
    setFormData((prev) => ({ ...prev, servicio: serviceId }));
  };

  // Nueva función para manejar selección desde el catálogo de precios
  const handleServiceCatalogSelect = (
    serviceName: string,
    priceText: string,
    fullDescription: string,
    categoryId: string
  ) => {
    setUserOverrodeService(true);
    setFormData((prev) => ({
      ...prev,
      servicio: categoryId,
      descripcion: fullDescription,
    }));
    // Avanzar automáticamente al Paso 2 después de un breve delay para mejor UX
    setTimeout(() => {
      setCurrentStep(2);
    }, 300);
  };

  // Función para saltar a descripción manual sin pre-llenar
  const handleManualDescription = () => {
    setCurrentStep(2);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imagen: file }));
    }
  };

  // Función para buscar sugerencias de direcciones
  const fetchAddressSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    setIsLoadingAddressSuggestions(true);
    
    // Limpiar timeout anterior
    if (addressSearchTimeoutRef.current) {
      clearTimeout(addressSearchTimeoutRef.current);
    }

    // Debounce: esperar 400ms antes de buscar
    addressSearchTimeoutRef.current = setTimeout(async () => {
      try {
        const suggestions = await getAddressSuggestions(query, 5);
        setAddressSuggestions(suggestions);
        setShowAddressSuggestions(suggestions.length > 0);
        setSelectedSuggestionIndex(-1);
      } catch (error) {
        console.error("Error al obtener sugerencias de dirección:", error);
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      } finally {
        setIsLoadingAddressSuggestions(false);
      }
    }, 400);
  }, []);

  // Manejar cambio en el input de dirección con autocompletado
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, ubicacion: value }));
    
    // Si se limpia el campo, limpiar también las coordenadas seleccionadas
    if (value.length === 0) {
      setSelectedAddressCoords(null);
      setShowAddressSuggestions(false);
      setAddressSuggestions([]);
    } else if (value.length >= 3) {
      // Buscar sugerencias mientras el usuario escribe
      fetchAddressSuggestions(value);
    } else {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    }
  };

  // Manejar selección de sugerencia de dirección
  const handleSelectAddressSuggestion = (suggestion: AddressSuggestion) => {
    const formatted = formatAddressSuggestion(suggestion);
    console.log("✅ Sugerencia de dirección seleccionada:", formatted);
    
    setFormData((prev) => {
      const updated = { ...prev, ubicacion: formatted };
      console.log("📝 Prellenando dirección:", formatted);
      return updated;
    });
    
    // Si la sugerencia tiene coordenadas, guardarlas
    if (suggestion.lat && suggestion.lon) {
      const lat = parseFloat(suggestion.lat);
      const lng = parseFloat(suggestion.lon);
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log("📍 Guardando coordenadas de dirección:", { lat, lng });
        setSelectedAddressCoords({ lat, lng });
      }
    }
    
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  // Manejar navegación con teclado en sugerencias de dirección
  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAddressSuggestions || addressSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < addressSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSelectAddressSuggestion(addressSuggestions[selectedSuggestionIndex]);
    } else if (e.key === "Escape") {
      setShowAddressSuggestions(false);
    }
  };

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node) &&
        addressSuggestionsRef.current &&
        !addressSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowAddressSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Limpiar estado de autocompletado cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      setSelectedSuggestionIndex(-1);
      setSelectedAddressCoords(null);
      setIsLoadingAddressSuggestions(false);
      // Limpiar timeout si existe
      if (addressSearchTimeoutRef.current) {
        clearTimeout(addressSearchTimeoutRef.current);
        addressSearchTimeoutRef.current = null;
      }
    }
  }, [isOpen]);

  const handleUseMyLocation = async () => {
    console.log("🔍 Iniciando geolocalización...");

    if (!navigator.geolocation) {
      console.error("❌ Geolocalización no disponible");
      setError("La geolocalización no está disponible en tu navegador");
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    try {
      console.log("📍 Solicitando ubicación...");
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              console.log("✅ Ubicación obtenida:", pos.coords);
              resolve(pos);
            },
            (err) => {
              console.error("❌ Error de geolocalización:", err);
              reject(err);
            },
            {
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 300000,
            }
          );
        }
      );

      const { latitude, longitude } = position.coords;
      console.log(`📍 Coordenadas: ${latitude}, ${longitude}`);

      // Verificar si tenemos API key de Google Maps
      const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      console.log(
        "🔑 Google Maps API Key:",
        googleMapsApiKey ? "Configurada" : "No configurada"
      );

      if (!googleMapsApiKey) {
        // Fallback: usar OpenStreetMap Nominatim (gratuito)
        console.log("🗺️ Usando OpenStreetMap Nominatim...");
        try {
          // Agregar un pequeño delay para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
          
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=es&zoom=18`,
            {
              headers: {
                "User-Agent": "SumeeApp/1.0 (https://sumeeapp.com; contact@sumeeapp.com)",
                "Accept-Language": "es-MX,es;q=0.9",
              },
            }
        );

        console.log("📡 Respuesta OpenStreetMap:", response.status);
          
          if (!response.ok) {
            console.error("❌ Error en respuesta de OpenStreetMap:", response.status);
            setError(
              "No se pudo obtener la dirección. Por favor, ingrésala manualmente."
            );
            return;
          }

        const data = await response.json();
        console.log("📋 Datos OpenStreetMap:", data);

        if (data && data.display_name) {
          const address = data.display_name;
          console.log("✅ Dirección obtenida:", address);
            console.log("📝 Actualizando formData.ubicacion con:", address);
            
            // Actualizar el estado de forma explícita
            setFormData((prev) => {
              const updated = { ...prev, ubicacion: address };
              console.log("📝 formData actualizado:", updated);
              return updated;
            });
            
            // Guardar coordenadas para uso posterior
            setSelectedAddressCoords({ lat: latitude, lng: longitude });
            
            // Cerrar sugerencias si estaban abiertas
            setShowAddressSuggestions(false);
            setAddressSuggestions([]);
            
            setError(null); // Limpiar cualquier error previo
        } else {
            console.error("❌ No se pudo obtener dirección de OpenStreetMap. Datos:", data);
          setError(
            "No se pudo obtener la dirección. Por favor, ingrésala manualmente."
            );
          }
        } catch (fetchError) {
          console.error("❌ Error al hacer fetch a OpenStreetMap:", fetchError);
          setError(
            "Error de conexión al obtener la dirección. Por favor, ingrésala manualmente."
          );
        }
      } else {
        // Usar Google Maps Geocoding API
        console.log("🗺️ Usando Google Maps API...");
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}&language=es&region=mx`
        );

        console.log("📡 Respuesta Google Maps:", response.status);
        const data = await response.json();
        console.log("📋 Datos Google Maps:", data);

        if (data.status === "OK" && data.results && data.results.length > 0) {
          const address = data.results[0].formatted_address;
          console.log("✅ Dirección obtenida:", address);
          setFormData((prev) => ({ ...prev, ubicacion: address }));
        } else if (data.status === "ZERO_RESULTS") {
          console.error("❌ ZERO_RESULTS de Google Maps");
          setError(
            "No se encontró dirección para esta ubicación. Por favor, ingrésala manualmente."
          );
        } else if (data.status === "OVER_QUERY_LIMIT") {
          console.error("❌ OVER_QUERY_LIMIT de Google Maps");
          setError(
            "Límite de consultas excedido. Por favor, ingresa la dirección manualmente."
          );
        } else {
          console.error("❌ Error de Google Maps:", data.status);
          setError(
            "Error en el servicio de geocodificación. Por favor, ingresa la dirección manualmente."
          );
        }
      }
    } catch (err) {
      console.error("❌ Error en geolocalización:", err);
      // GeolocationPositionError no es accesible directamente en TypeScript
      // Verificamos por propiedades específicas
      if (err && typeof err === "object" && "code" in err) {
        const geoError = err as { code: number; message?: string };
        if (geoError.code === 1) {
          setError(
            "Permiso de ubicación denegado. Por favor, ingresa la dirección manualmente."
          );
        } else if (geoError.code === 2) {
          setError(
            "Ubicación no disponible. Por favor, ingresa la dirección manualmente."
          );
        } else if (geoError.code === 3) {
          setError(
            "Tiempo de espera agotado. Por favor, ingresa la dirección manualmente."
          );
        } else {
          setError(
            "Error al obtener la ubicación. Por favor, ingresa la dirección manualmente."
          );
        }
      } else if (err instanceof Error && err.name === "NetworkError") {
        setError(
          "Error de conexión. Por favor, verifica tu internet e intenta de nuevo."
        );
      } else {
        setError(
          "Error al obtener la ubicación. Por favor, ingresa la dirección manualmente."
        );
      }
    } finally {
      console.log("🏁 Finalizando geolocalización...");
      setIsGettingLocation(false);
    }
  };

  const whatsappValidation = useMemo(
    () => normalizeWhatsappNumber(formData.whatsapp),
    [formData.whatsapp]
  );

  const formattedWhatsappDisplay = useMemo(() => {
    if (!whatsappValidation.normalized) return formData.whatsapp;
    return formatWhatsappForDisplay(whatsappValidation.normalized);
  }, [whatsappValidation.normalized, formData.whatsapp]);

  const handleWhatsappChange = (value: string) => {
    setFormData((prev) => ({ ...prev, whatsapp: value }));
    if (whatsappError) {
      setWhatsappError(null);
    }
  };

  const ensureWhatsappIsValid = () => {
    const { normalized, isValid } = whatsappValidation;
    if (!isValid) {
      setWhatsappError(
        "Ingresa un número de WhatsApp válido de 10 dígitos (ejemplo: 55 1234 5678)."
      );
      return null;
    }
    return normalized;
  };

  const applyWhatsappFormatting = () => {
    const normalized = ensureWhatsappIsValid();
    if (normalized) {
      setFormData((prev) => ({
        ...prev,
        whatsapp: formatWhatsappForDisplay(normalized),
      }));
    }
    return normalized;
  };

  const persistWhatsapp = async (normalized: string) => {
    try {
      await supabase.auth.updateUser({ data: { phone: normalized } });
    } catch (authError) {
      console.warn(
        "No se pudo actualizar el teléfono en Supabase Auth:",
        authError
      );
    }

    if (user?.id) {
      try {
        const updateData: any = { phone: normalized, whatsapp: normalized };
        await (supabase
          .from("profiles") as any)
          .update(updateData)
          .eq("user_id", user.id);
      } catch (profileError) {
        console.warn(
          "No se pudo actualizar el WhatsApp en el perfil:",
          profileError
        );
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset cuando el modal se cierra
      hasPrefilledWhatsapp.current = false;
      return;
    }
    if (hasPrefilledWhatsapp.current) return;
    if (!user && !profile) return;

    const existingPhone =
      (user?.user_metadata?.phone as string | undefined) ||
      (profile?.whatsapp as string | undefined) ||
      (profile?.phone as string | undefined) ||
      "";

    if (existingPhone) {
      const { normalized, isValid } = normalizeWhatsappNumber(existingPhone);
      const displayValue = isValid
        ? formatWhatsappForDisplay(normalized)
        : existingPhone;
      setFormData((prev) => ({ ...prev, whatsapp: displayValue }));
      hasPrefilledWhatsapp.current = true;
      console.log('📱 WhatsApp pre-llenado desde perfil:', displayValue);
    }
  }, [user, profile, isOpen]);

  // 🆕 Prellenar ubicación desde perfil del usuario
  const hasPrefilledLocation = useRef(false);
  useEffect(() => {
    if (!isOpen) {
      // Reset cuando el modal se cierra
      hasPrefilledLocation.current = false;
      return;
    }
    if (hasPrefilledLocation.current) return;
    if (!profile) return;

    // Intentar obtener ubicación desde el perfil
    const profileAddress = (profile as any).ubicacion_direccion;
    if (profileAddress && typeof profileAddress === 'string' && profileAddress.trim()) {
      setFormData((prev) => ({ ...prev, ubicacion: profileAddress.trim() }));
      hasPrefilledLocation.current = true;
      console.log('📍 Ubicación pre-llenada desde perfil:', profileAddress);
    }
  }, [profile, isOpen]);

  // 🆕 Establecer paso inicial cuando el modal se abre (si viene del formulario detallado)
  useEffect(() => {
    if (!isOpen) return;
    
    // Si hay initialStep explícito, establecer el paso
    if (initialStep !== undefined && initialStep >= 1 && initialStep <= 4) {
      console.log('✅ [STEP] Forzando paso', initialStep, 'desde URL');
      setCurrentStep(initialStep);
    }
    // Si hay initialDescription, forzar paso 2
    else if (initialDescription && initialDescription.trim()) {
      console.log('✅ [STEP] Forzando paso 2 (tiene descripción prellenada)');
      setCurrentStep(2);
    }
  }, [isOpen, initialStep, initialDescription]);

  // 🆕 Prellenar descripción cuando el modal se abre (si viene del formulario detallado)
  useEffect(() => {
    if (!isOpen) return;
    
    // Prellenar descripción si viene desde formulario detallado
    if (initialDescription && initialDescription.trim()) {
      console.log('📝 [PRIORIDAD] Prellenando descripción desde formulario detallado:', initialDescription);
      setFormData((prev) => ({
        ...prev,
        servicio: initialService || prev.servicio,
        descripcion: initialDescription.trim(),
      }));
    }
  }, [isOpen, initialDescription, initialService]);

  // 🚀 LÓGICA DE AVANCE AUTOMÁTICO: Prellenar todo y avanzar hasta el último paso necesario
  // IMPORTANTE: Si hay un initialStep explícito o initialDescription, NO ejecutar auto-avance
  useEffect(() => {
    if (!isOpen) return;
    // Si hay un initialStep explícito (viene de URL), NO ejecutar auto-avance
    if (initialStep !== undefined && initialStep !== 1) {
      console.log('🚫 Saltando auto-avance: initialStep ya está definido:', initialStep);
      return;
    }
    // Si hay initialDescription, ya se abrió en paso 2, no hacer auto-avance
    if (initialDescription && initialDescription.trim()) {
      console.log('🚫 Saltando auto-avance: tiene descripción prellenada, ya está en paso 2');
      return;
    }
    if (!initialService || !initialServiceName) return;
    if (!user || !profile) return; // Solo para usuarios autenticados

    // Esperar un momento para que todos los prellenados se completen
    const autoAdvanceTimeout = setTimeout(() => {
      const hasService = !!formData.servicio;
      const hasDescription = !!formData.descripcion.trim();
      const hasWhatsapp = !!formData.whatsapp.trim();
      const hasLocation = !!formData.ubicacion.trim();

      console.log('🔍 Estado del formulario:', {
        hasService,
        hasDescription,
        hasWhatsapp,
        hasLocation,
        currentStep,
      });

      // Si todo está completo, avanzar directamente al paso 4 (confirmación)
      if (hasService && hasDescription && hasWhatsapp && hasLocation) {
        console.log('✅ Todo pre-llenado, avanzando al paso 4 (confirmación)');
        setCurrentStep(4);
        return;
      }

      // Si tenemos servicio y descripción, avanzar al paso 3 (WhatsApp + Ubicación)
      if (hasService && hasDescription && currentStep < 3) {
        console.log('✅ Servicio y descripción completos, avanzando al paso 3');
        setCurrentStep(3);
        return;
      }

      // Si tenemos servicio, avanzar al paso 2 (descripción)
      if (hasService && currentStep < 2) {
        console.log('✅ Servicio seleccionado, avanzando al paso 2');
        setCurrentStep(2);
        return;
      }
    }, 800); // Esperar 800ms para que todos los prellenados se completen

    return () => clearTimeout(autoAdvanceTimeout);
  }, [isOpen, initialService, initialServiceName, user, profile, formData, currentStep]);

  const handleSubmit = async () => {
    if (!user) {
      setError("Debes estar logueado para solicitar un servicio");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const normalizedWhatsapp = ensureWhatsappIsValid();
      if (!normalizedWhatsapp) {
        setLoading(false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        whatsapp: formatWhatsappForDisplay(normalizedWhatsapp),
      }));

      await persistWhatsapp(normalizedWhatsapp);

      // Subir imagen si existe
      let imagenUrl = null;
      if (formData.imagen) {
        const fileExt = formData.imagen.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("lead-images")
          .upload(fileName, formData.imagen);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("lead-images").getPublicUrl(fileName);

        imagenUrl = publicUrl;
      }

      // 🆕 Geocodificar ubicación si está disponible
      let ubicacionLat = 19.4326; // CDMX por defecto
      let ubicacionLng = -99.1332;
      
      if (formData.ubicacion && formData.ubicacion.trim()) {
        try {
          // Intentar usar coordenadas del perfil si están disponibles
          if (profile && (profile as any).ubicacion_lat && (profile as any).ubicacion_lng) {
            ubicacionLat = (profile as any).ubicacion_lat;
            ubicacionLng = (profile as any).ubicacion_lng;
            console.log('📍 Usando coordenadas del perfil:', { ubicacionLat, ubicacionLng });
          } else {
            // Si no hay coordenadas en el perfil, intentar geocodificar la dirección
            const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (googleMapsApiKey) {
              const geocodeResponse = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formData.ubicacion)}&key=${googleMapsApiKey}&language=es&region=mx`
              );
              const geocodeData = await geocodeResponse.json();
              if (geocodeData.status === "OK" && geocodeData.results && geocodeData.results.length > 0) {
                ubicacionLat = geocodeData.results[0].geometry.location.lat;
                ubicacionLng = geocodeData.results[0].geometry.location.lng;
                console.log('📍 Coordenadas geocodificadas:', { ubicacionLat, ubicacionLng });
              }
            }
          }
        } catch (geocodeError) {
          console.warn('⚠️ Error al geocodificar, usando coordenadas por defecto:', geocodeError);
        }
      }

      // Crear el lead
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        // @ts-ignore - Supabase types inference issue, but this works correctly at runtime
        .insert({
          nombre_cliente: user.user_metadata?.full_name || (profile as any)?.full_name || "Cliente",
          whatsapp: normalizedWhatsapp,
          descripcion_proyecto: formData.descripcion || "Sin descripción",
          ubicacion_lat: ubicacionLat,
          ubicacion_lng: ubicacionLng,
          estado: "nuevo", // Usar 'nuevo' según el schema
          servicio: formData.servicio, // Campo correcto según schema
          servicio_solicitado: initialServiceName || formData.servicio, // Nombre específico del servicio
          ubicacion_direccion: formData.ubicacion || null,
          cliente_id: user.id,
          disciplina_ia: disciplinaIa,
          urgencia_ia: urgenciaIa,
          diagnostico_ia: diagnosticoIa,
        })
        .select()
        .maybeSingle();

      if (leadError) {
        console.error(
          "Error creating lead:",
          JSON.stringify(leadError, null, 2)
        );

        // Traducir errores técnicos a mensajes amigables
        let errorMessage = "Error desconocido al crear la solicitud";

        if (
          leadError.message?.includes("row-level security") ||
          leadError.message?.includes("RLS") ||
          leadError.code === "42501"
        ) {
          errorMessage =
            "No tienes permisos para crear solicitudes. Por favor, verifica tu sesión o contacta a soporte.";
        } else if (
          leadError.message?.includes("violates") ||
          leadError.message?.includes("constraint")
        ) {
          // 🆕 Mensaje específico para constraint de servicio
          if (leadError.message?.includes("leads_servicio_check")) {
            errorMessage =
              `El servicio "${formData.servicio}" no está permitido en la base de datos. Por favor, contacta a soporte.`;
            console.error("❌ Servicio no permitido en constraint:", {
              servicio: formData.servicio,
              servicio_solicitado: initialServiceName,
              error: leadError.message,
            });
          } else {
          errorMessage =
            "Error en los datos proporcionados. Por favor, verifica que todos los campos sean correctos.";
          }
        } else if (
          leadError.message?.includes("network") ||
          leadError.message?.includes("fetch")
        ) {
          errorMessage =
            "Problema de conexión. Verifica tu internet e intenta de nuevo.";
        } else if (leadError.message) {
          // Usar el mensaje original si es entendible
          errorMessage = leadError.message;
        } else if (leadError.details) {
          errorMessage = leadError.details;
        }

        throw new Error(errorMessage);
      }

      if (!leadData) {
        throw new Error("No se pudo crear la solicitud. Intenta de nuevo.");
      }

      // Redirigir a WhatsApp con número de soporte
      const whatsappPhone = "525636741156"; // Número de soporte de Sumee App
      const message = encodeURIComponent(
        `Hola, necesito ayuda con el servicio de ${formData.servicio}. ` +
          `Ubicación: ${formData.ubicacion || "No especificada"}. ` +
          // @ts-ignore - Supabase types inference issue
          `Mi solicitud ID: ${leadData.id.substring(0, 8)}`
      );
      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${message}`;
      window.open(whatsappUrl, "_blank");
      onClose();
    } catch (err) {
      console.error("Error creating lead:", err);

      // Asegurar que el error sea amigable
      let errorMessage =
        "Error al crear la solicitud. Por favor, intenta de nuevo.";

      if (err instanceof Error) {
        // Si el mensaje ya es amigable (de nuestro código), usarlo
        errorMessage = err.message;
        if (err.message.includes("row-level security")) {
          errorMessage =
            "Problema de permisos. Por favor, contacta a soporte si el problema persiste.";
        }
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // FUNCIÓN PARA ENVIAR ALERTA DE WHATSAPP A LA EMPRESA
  // =========================================================================
  const sendLeadAlertToWhatsApp = async (
    leadId: string,
    servicio: string,
    servicioSolicitado: string | null
  ) => {
    try {
      const response = await fetch('/api/whatsapp/lead-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId,
          servicio,
          servicioSolicitado: servicioSolicitado || servicio,
          ubicacion: formData.ubicacion || 'No especificada',
          clienteWhatsapp: formData.whatsapp || 'No proporcionado',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al enviar alerta WhatsApp');
      }

      const result = await response.json();
      console.log('✅ Alerta WhatsApp enviada exitosamente:', result);
      return result;
    } catch (error) {
      console.error('❌ Error al enviar alerta WhatsApp:', error);
      throw error;
    }
  };

  // =========================================================================
  // FUNCIÓN ORIGINAL (SIN PAGO) - Extraída para mantener código intacto
  // =========================================================================
  const handleFreeRequestSubmitWithoutPayment = async () => {
    console.log("🔍 handleFreeRequestSubmit - Iniciando proceso simplificado");

    // 1. Validaciones iniciales
    if (!user || !isAuthenticated || !user.id) {
      setError("Debes estar logueado para solicitar un servicio.");
      return;
    }

    if (isSubmittingFreeRequest) return;

    setIsSubmittingFreeRequest(true);
    setError(null);

    try {
      // 2. Validaciones de formulario
      const normalizedWhatsapp = ensureWhatsappIsValid();
      if (!normalizedWhatsapp) {
        setIsSubmittingFreeRequest(false);
        return;
      }

      const sanitizedDescription = sanitizeInput(formData.descripcion || "");
      if (!formData.servicio?.trim()) {
        throw new Error("Por favor selecciona un servicio.");
      }
      if (sanitizedDescription.length < 20) {
        throw new Error("Por favor describe el problema con más detalle (mínimo 20 caracteres).");
      }

      // 3. Obtener coordenadas (Simplificado: Usar guardadas o default CDMX)
      // No bloqueamos el proceso por geocoding externo para evitar retrasos
      let lat = 19.4326;
      let lng = -99.1332;
      
      if (selectedAddressCoords) {
        lat = selectedAddressCoords.lat;
        lng = selectedAddressCoords.lng;
      }

      // 4. Preparar el objeto para insertar
      // IMPORTANTE: Insertamos directamente usando el cliente estándar
      const leadPayload: any = {
        nombre_cliente: user.user_metadata?.full_name || profile?.full_name || "Cliente",
        whatsapp: normalizedWhatsapp,
        descripcion_proyecto: sanitizedDescription,
        servicio: formData.servicio,
        ubicacion_lat: lat,
        ubicacion_lng: lng,
        ubicacion_direccion: formData.ubicacion || null,
        cliente_id: user.id,
        estado: "Nuevo",
        // Campos opcionales
        imagen_url: null, // La imagen se puede manejar aparte si es necesario
        disciplina_ia: disciplinaIa || null,
        urgencia_ia: urgenciaIa ? Number(urgenciaIa) : null,
        diagnostico_ia: diagnosticoIa || null
      };

      console.log("📦 Enviando INSERT a Supabase:", leadPayload);

      // 5. EJECUCIÓN DEL INSERT (Sin timeouts manuales, sin RPCs extraños)
      // @ts-ignore - Supabase types inference issue, but this works correctly at runtime
      const { data, error } = await supabase
        .from('leads')
        // @ts-ignore
        .insert(leadPayload)
        .select('id') // Solicitamos solo el ID de vuelta
        .single();

      // 6. Manejo de Errores Real
      if (error) {
        console.error("❌ Error de Supabase:", error);
        throw new Error(error.message || "Error al guardar la solicitud en la base de datos.");
      }

      if (!data) {
        throw new Error("La solicitud se creó pero no recibimos confirmación.");
      }

      // @ts-ignore - Supabase types inference issue
      console.log("✅ ¡ÉXITO! Lead creado con ID:", data.id);

      // 7. Éxito: Persistir datos secundarios en background (Fire and forget)
      // No esperamos a esto para liberar al usuario
      if (formData.imagen) {
        // Lógica de subida de imagen en background si quieres
        const fileExt = formData.imagen.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        supabase.storage
          .from("lead-images")
          .upload(fileName, formData.imagen)
          .then(({ error: uploadError }) => {
            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from("lead-images")
                .getPublicUrl(fileName);
              // Actualizar el lead con la URL de la imagen
              (supabase
                .from("leads") as any)
                .update({ imagen_url: publicUrl, photos_urls: [publicUrl] })
                // @ts-ignore - Supabase types inference issue
                .eq("id", data.id)
                .then(() => console.log("✅ Imagen subida y actualizada en lead"));
            }
          })
          .catch((error: any) => console.warn("⚠️ Error al subir imagen (no crítico):", error));
      }
      persistWhatsapp(normalizedWhatsapp).catch(console.warn);

      // 8. Enviar alerta de WhatsApp a la empresa (en background, no bloquea)
      // @ts-ignore - Supabase types inference issue
      sendLeadAlertToWhatsApp(data.id, formData.servicio, initialServiceName || formData.descripcion).catch((error: any) => {
        console.warn("⚠️ Error al enviar alerta WhatsApp (no crítico):", error);
      });

      // 9. Navegación y Cierre
      resetModal();
      onClose();
      
      // Pequeño delay para UX suave antes de redirigir
      setTimeout(() => {
        // Redirigir al dashboard del cliente donde se muestran todas las solicitudes
        router.push('/dashboard/client');
        if (onLeadCreated) onLeadCreated();
      }, 100);

    } catch (err: any) {
      console.error("💥 Error en Frontend:", err);
      
      // Mensajes amigables
      let msg = err.message || "Error desconocido";
      if (msg.includes("fetch") || msg.includes("network")) msg = "Error de conexión. Verifica tu internet.";
      if (msg.includes("RLS") || msg.includes("policy")) msg = "No tienes permisos. Cierra sesión y vuelve a entrar.";
      
      setError(msg);
      // No reseteamos el modal completo, solo el loading para que el usuario pueda reintentar
    } finally {
      setIsSubmittingFreeRequest(false);
    }
  };

  // =========================================================================
  // FUNCIÓN NUEVA (CON PAGO) - Comentada (Stripe se implementará después)
  // =========================================================================
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleFreeRequestSubmitWithPayment = async () => {
    // Esta función está deshabilitada temporalmente - Stripe se implementará después
    throw new Error("Función de pago deshabilitada temporalmente");
    /* COMENTADO TEMPORALMENTE - STRIPE SE IMPLEMENTARÁ DESPUÉS
    console.log("🔍 handleFreeRequestSubmitWithPayment - Iniciando proceso con pago");

    // 1. Validaciones iniciales
    if (!user || !isAuthenticated || !user.id) {
      setError("Debes estar logueado para solicitar un servicio.");
      return;
    }

    if (isSubmittingFreeRequest) return;

    setIsSubmittingFreeRequest(true);
    setError(null);

    try {
      // 2. Validaciones de formulario
      const normalizedWhatsapp = ensureWhatsappIsValid();
      if (!normalizedWhatsapp) {
        setIsSubmittingFreeRequest(false);
        return;
      }

      const sanitizedDescription = sanitizeInput(formData.descripcion || "");
      if (!formData.servicio?.trim()) {
        throw new Error("Por favor selecciona un servicio.");
      }
      if (sanitizedDescription.length < 20) {
        throw new Error("Por favor describe el problema con más detalle (mínimo 20 caracteres).");
      }

      // 3. Validar que tenemos paymentMethodId
      if (!paymentMethodId) {
        throw new Error("No se ha proporcionado un método de pago válido. Por favor, completa el paso de pago.");
      }

      // 4. Obtener coordenadas
      let lat = 19.4326;
      let lng = -99.1332;
      
      if (selectedAddressCoords) {
        lat = selectedAddressCoords.lat;
        lng = selectedAddressCoords.lng;
      }

      // 5. AUTORIZACIÓN DE FONDOS (HOLD) - $350 MXN
      console.log("💳 Autorizando fondos en Stripe...");
      const { data: authData, error: authError } = await supabase.functions.invoke('stripe-service', {
        body: {
          action: 'authorize-hold',
          paymentMethodId: paymentMethodId,
          amount: 350, // Monto de la visita
          userId: user.id
        }
      });

      if (authError || !authData?.success) {
        const errorMessage = authData?.error || authData?.stripeError || "No se pudo autorizar el pago. Verifica que tu tarjeta tenga fondos suficientes.";
        console.error("❌ Error autorizando hold:", errorMessage);
        throw new Error(errorMessage);
      }

      const paymentIntentId = authData.paymentIntentId;
      console.log("✅ Fondos retenidos exitosamente. Payment Intent:", paymentIntentId);

      // 6. Preparar el objeto para insertar (incluyendo datos de pago)
      const leadPayload: any = {
        nombre_cliente: user.user_metadata?.full_name || profile?.full_name || "Cliente",
        whatsapp: normalizedWhatsapp,
        descripcion_proyecto: sanitizedDescription,
        servicio: formData.servicio,
        ubicacion_lat: lat,
        ubicacion_lng: lng,
        ubicacion_direccion: formData.ubicacion || null,
        cliente_id: user.id,
        estado: "Nuevo",
        // Campos opcionales
        imagen_url: null,
        disciplina_ia: disciplinaIa || null,
        urgencia_ia: urgenciaIa ? Number(urgenciaIa) : null,
        diagnostico_ia: diagnosticoIa || null,
        // NUEVOS CAMPOS DE PAGO
        payment_method_id: paymentMethodId,
        payment_intent_id: paymentIntentId,
        payment_status: 'authorized' // Estado inicial: retención exitosa
      };

      // console.log("📦 Enviando INSERT a Supabase con datos de pago:", leadPayload);
      // ... resto del código comentado ...
    */
  };

  // =========================================================================
  // FUNCIÓN PRINCIPAL - Flujo sin pago (Stripe se implementará después)
  // =========================================================================
  const handleFreeRequestSubmit = async () => {
    return handleFreeRequestSubmitWithoutPayment();
  };

  // =========================================================================
  // useEffect para inicializar SetupIntent - Removido (Stripe se implementará después)
  // =========================================================================

  const nextStep = () => {
    if (currentStep === 2 && !formData.descripcion.trim()) {
      setError("Por favor describe el problema con más detalle.");
      return;
    }

    if (currentStep === 3) {
      const normalized = applyWhatsappFormatting();
      if (!normalized) {
        return;
      }
    }

    if (currentStep < totalSteps) {
      setError(null);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setFormData({
      servicio: "",
      descripcion: "",
      imagen: null,
      ubicacion: "",
      urgencia: "normal",
      whatsapp: "",
    });
    setError(null);
    setWhatsappError(null);
    hasPrefilledWhatsapp.current = false;
    setIaStatus("idle");
    setIaSuggestion(null);
    setIaError(null);
    setIsSubmittingFreeRequest(false);
    setLoading(false);
    // Limpiar estados de autocompletado
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setSelectedAddressCoords(null);
    setIsLoadingAddressSuggestions(false);
    // Limpiar timeout de búsqueda si existe
    if (addressSearchTimeoutRef.current) {
      clearTimeout(addressSearchTimeoutRef.current);
      addressSearchTimeoutRef.current = null;
    }
    setDisciplinaIa(null);
    setUrgenciaIa(null);
    setDiagnosticoIa(null);
    setUserOverrodeService(false);
    setUserOverrodeUrgency(false);
    if (aiDebounceRef.current) {
      clearTimeout(aiDebounceRef.current);
      aiDebounceRef.current = null;
    }
    lastClassifiedDescription.current = "";
    // Limpiar estados de Stripe - Removido (Stripe se implementará después)
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-start pt-24 md:pt-28 p-1 md:p-3 z-[110] overflow-y-auto">
      <div className="bg-white rounded-lg md:rounded-xl shadow-2xl w-full max-w-3xl max-h-[calc(100vh-7rem)] md:max-h-[calc(100vh-8rem)] overflow-hidden my-auto flex flex-col">
        {/* Header Compacto - Se oculta al hacer scroll */}
        <div 
          className={`bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white p-2 md:p-3 flex-shrink-0 shadow-lg transition-transform duration-300 ${
            isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <div className="flex items-center justify-between mb-1 md:mb-1.5">
            <div className="flex items-center space-x-1.5 md:space-x-2 flex-1 min-w-0">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <FontAwesomeIcon
                  icon={faWrench}
                  className="text-xs md:text-sm"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xs md:text-sm lg:text-base font-bold truncate">
                  Solicitar Servicio
                </h2>
                <p className="text-blue-100 text-[9px] md:text-[10px] opacity-90">
                  Paso {currentStep} de {totalSteps}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors flex-shrink-0 ml-1.5 p-0.5 md:p-1 rounded-lg hover:bg-white/10"
              aria-label="Cerrar"
            >
              <FontAwesomeIcon icon={faTimes} className="text-sm md:text-base" />
            </button>
          </div>

          {/* Progress Bar Delgada */}
          <div className="mt-1">
            <div className="w-full bg-white/20 rounded-full h-0.5 md:h-1">
              <div
                className="bg-white h-0.5 md:h-1 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content Compacto */}
        <div 
          ref={contentRef}
          className="p-2 md:p-3 lg:p-4 flex-1 overflow-y-auto"
          onScroll={(e) => {
            const currentScrollTop = e.currentTarget.scrollTop;
            // Ocultar header al hacer scroll hacia abajo, mostrar al hacer scroll hacia arriba
            if (currentScrollTop > lastScrollTop && currentScrollTop > 50) {
              setIsHeaderVisible(false);
            } else if (currentScrollTop < lastScrollTop) {
              setIsHeaderVisible(true);
            }
            setLastScrollTop(currentScrollTop);
          }}
        >
          {currentStep === 1 && (
            <div className="space-y-2 md:space-y-3">
              <div className="text-center mb-2 md:mb-3 pt-1 md:pt-2">
                <h3 className="text-xs md:text-sm lg:text-base font-bold text-gray-900 mb-1">
                  ¿Qué servicio necesitas?
                </h3>
                <p className="text-[9px] md:text-[10px] lg:text-xs text-gray-600">
                  Explora nuestros servicios con precios estandarizados
                </p>
              </div>

              {/* 🆕 Sección de Servicios Específicos Populares */}
              <div className="mb-3 md:mb-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 md:p-4 border-2 border-yellow-300 shadow-sm">
                <div className="flex items-center gap-2 mb-2 md:mb-3">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-sm md:text-base" />
                  <h4 className="text-xs md:text-sm font-bold text-gray-900">
                    ⭐ Servicios Más Solicitados
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-2.5">
                  {/* Instalación de Contactos */}
                  <button
                    onClick={() => {
                      onClose(); // Cerrar modal primero
                      router.push('/servicios/electricidad/instalacion-contactos');
                    }}
                    className="group relative p-2.5 md:p-3 rounded-lg border-2 border-yellow-300 hover:border-yellow-500 hover:shadow-md transition-all duration-200 text-left bg-white hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FontAwesomeIcon icon={faLightbulb} className="text-yellow-600 text-sm md:text-base flex-shrink-0" />
                      <h5 className="font-bold text-gray-900 text-xs md:text-sm leading-tight line-clamp-2">
                        Instalación de Contactos
                      </h5>
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-blue-600 mb-0.5">Desde $350</p>
                    <p className="text-[10px] md:text-xs text-gray-500">Mano de obra</p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FontAwesomeIcon icon={faArrowRight} className="text-yellow-600 text-xs" />
                    </div>
                  </button>

                  {/* Reparación de Fugas */}
                  <button
                    onClick={() => {
                      onClose(); // Cerrar modal primero
                      router.push('/servicios/plomeria/reparacion-de-fugas');
                    }}
                    className="group relative p-2.5 md:p-3 rounded-lg border-2 border-blue-300 hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FontAwesomeIcon icon={faWrench} className="text-blue-600 text-sm md:text-base flex-shrink-0" />
                      <h5 className="font-bold text-gray-900 text-xs md:text-sm leading-tight line-clamp-2">
                        Reparación de Fugas
                      </h5>
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-blue-600 mb-0.5">Desde $400</p>
                    <p className="text-[10px] md:text-xs text-gray-500">Mano de obra</p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FontAwesomeIcon icon={faArrowRight} className="text-blue-600 text-xs" />
                    </div>
                  </button>

                  {/* Montar TV en Pared */}
                  <button
                    onClick={() => {
                      handleServiceCatalogSelect("Montar TV en Pared", "$800", "Me interesa: Montar TV en Pared. Precio: $800 (Solo mano de obra - materiales aparte)", "montaje-armado");
                      nextStep();
                    }}
                    className="group relative p-2.5 md:p-3 rounded-lg border-2 border-purple-300 hover:border-purple-500 hover:shadow-md transition-all duration-200 text-left bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FontAwesomeIcon icon={faTv} className="text-purple-600 text-sm md:text-base flex-shrink-0" />
                      <h5 className="font-bold text-gray-900 text-xs md:text-sm leading-tight line-clamp-2">
                        Montar TV en Pared
                      </h5>
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-blue-600 mb-0.5">Desde $800</p>
                    <p className="text-[10px] md:text-xs text-gray-500">Mano de obra</p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FontAwesomeIcon icon={faArrowRight} className="text-purple-600 text-xs" />
                    </div>
                  </button>

                  {/* Instalación de Cámara CCTV */}
                  <button
                    onClick={() => {
                      onClose(); // Cerrar modal primero
                      router.push('/servicios/cctv/instalacion-de-camara-cctv');
                    }}
                    className="group relative p-2.5 md:p-3 rounded-lg border-2 border-indigo-300 hover:border-indigo-500 hover:shadow-md transition-all duration-200 text-left bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FontAwesomeIcon icon={faVideo} className="text-indigo-600 text-sm md:text-base flex-shrink-0" />
                      <h5 className="font-bold text-gray-900 text-xs md:text-sm leading-tight line-clamp-2">
                        Instalación de Cámara CCTV
                      </h5>
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-blue-600 mb-0.5">Desde $800</p>
                    <p className="text-[10px] md:text-xs text-gray-500">Mano de obra</p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FontAwesomeIcon icon={faArrowRight} className="text-indigo-600 text-xs" />
                    </div>
                  </button>

                  {/* Armar Muebles */}
                  <button
                    onClick={() => {
                      handleServiceCatalogSelect("Armado de muebles", "$600", "Me interesa: Armar muebles. Precio: $600 (Solo mano de obra - materiales aparte)", "montaje-armado");
                      nextStep();
                    }}
                    className="group relative p-2.5 md:p-3 rounded-lg border-2 border-green-300 hover:border-green-500 hover:shadow-md transition-all duration-200 text-left bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FontAwesomeIcon icon={faCouch} className="text-green-600 text-sm md:text-base flex-shrink-0" />
                      <h5 className="font-bold text-gray-900 text-xs md:text-sm leading-tight line-clamp-2">
                        Armar Muebles
                      </h5>
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-blue-600 mb-0.5">Desde $600</p>
                    <p className="text-[10px] md:text-xs text-gray-500">Mano de obra</p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FontAwesomeIcon icon={faArrowRight} className="text-green-600 text-xs" />
                    </div>
                  </button>

                  {/* Instalación de Lámpara */}
                  <button
                    onClick={() => {
                      onClose(); // Cerrar modal primero
                      router.push('/servicios/electricidad/instalacion-de-luminarias');
                    }}
                    className="group relative p-2.5 md:p-3 rounded-lg border-2 border-yellow-300 hover:border-yellow-500 hover:shadow-md transition-all duration-200 text-left bg-white hover:bg-gradient-to-br hover:from-yellow-50 hover:to-amber-50 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FontAwesomeIcon icon={faLightbulb} className="text-yellow-600 text-sm md:text-base flex-shrink-0" />
                      <h5 className="font-bold text-gray-900 text-xs md:text-sm leading-tight line-clamp-2">
                        Instalación de Lámpara
                      </h5>
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-blue-600 mb-0.5">Desde $500</p>
                    <p className="text-[10px] md:text-xs text-gray-500">Mano de obra</p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FontAwesomeIcon icon={faArrowRight} className="text-yellow-600 text-xs" />
                    </div>
                  </button>
                </div>
              </div>

              {/* Separador visual */}
              <div className="flex items-center gap-2 my-2 md:my-3">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-xs md:text-sm text-gray-500 font-medium px-2">
                  O explora por categoría
                </span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Componente de Catálogo de Precios con Categoría "Populares" */}
              <ServicePricingSelector
                onServiceSelect={handleServiceCatalogSelect}
                preSelectedCategory={
                  // 🆕 Si el servicio inicial es uno de los populares, seleccionar "populares"
                  initialService && isPopularService(initialServiceName || "")
                    ? "populares"
                    : formData.servicio || undefined
                }
                onManualDescription={handleManualDescription}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              <div className="text-center mb-3">
                <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1">
                  Describe el problema
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Sé detallado. ¿Puedes subir una foto o video? ¡Ayuda mucho!
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Descripción detallada
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        descripcion: e.target.value,
                      }))
                    }
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={4}
                    placeholder="Describe el problema en detalle. Incluye síntomas, cuándo empezó, qué has intentado..."
                  />
                  <div className="mt-2">
                    {iaStatus === "typing" && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        <FontAwesomeIcon icon={faLightbulb} className="text-sm" />
                        Analizando descripción…
                      </span>
                    )}
                    {iaStatus === "loading" && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Sugerencia inteligente en curso…
                      </span>
                    )}
                    {iaStatus === "success" && iaSuggestion && (
                      <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-3">
                        <p className="text-xs text-indigo-700 font-semibold uppercase tracking-[0.2em]">
                          Sugerencia automática
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-indigo-900">
                          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white text-indigo-700 border border-indigo-200 text-xs font-semibold">
                            <FontAwesomeIcon icon={faLightbulb} className="text-yellow-400" />
                            {iaSuggestion.disciplina || "Otros"}
                          </span>
                          {Number.isFinite(iaSuggestion.urgencia) && (
                            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white text-indigo-700 border border-indigo-200 text-xs font-semibold">
                              Urgencia {iaSuggestion.urgencia}/10
                            </span>
                          )}
                        </div>
                        {iaSuggestion.diagnostico && (
                          <p className="mt-2 text-xs text-indigo-700">
                            Diagnóstico sugerido:{" "}
                            <span className="font-medium">
                              {iaSuggestion.diagnostico}
                            </span>
                          </p>
                        )}
                        <p className="mt-2 text-[11px] text-indigo-700/80">
                          {userOverrodeService
                            ? "Puedes ajustar la disciplina manualmente en el Paso 1."
                            : "Aplicamos automáticamente esta disciplina sugerida. Puedes ajustarla en el Paso 1 si prefieres otra opción."}
                        </p>
                      </div>
                    )}
                    {iaStatus === "error" && iaError && (
                      <p className="text-xs text-red-500 mt-1">
                        {iaError}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Foto o Video <span className="text-gray-400 font-normal">(Opcional)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center space-y-1.5 text-gray-600 hover:text-blue-600 w-full"
                    >
                      <FontAwesomeIcon
                        icon={faCamera}
                        className="text-xl"
                      />
                      <span className="text-xs font-medium">
                        {formData.imagen
                          ? formData.imagen.name.length > 25 
                            ? formData.imagen.name.substring(0, 25) + "..."
                            : formData.imagen.name
                          : "Subir foto o video"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3">
              <div className="text-center mb-3">
                <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1">
                  ¿Dónde es el servicio?
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Confirma la dirección y tu contacto
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    WhatsApp de contacto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleWhatsappChange(e.target.value)}
                    onBlur={() => {
                      const normalized = applyWhatsappFormatting();
                      if (!normalized && !formData.whatsapp) {
                        setWhatsappError(
                          "Ingresa tu número de WhatsApp para que el profesional pueda contactarte."
                        );
                      }
                    }}
                    className={`w-full p-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      whatsappError ? "border-red-400" : "border-gray-300"
                    }`}
                    placeholder="55 1234 5678"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Se compartirá con el profesional para coordinar el servicio.
                  </p>
                  {whatsappError && (
                    <p className="text-[10px] text-red-600 mt-1">{whatsappError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Dirección
                  </label>
                  <div className="relative" ref={addressInputRef}>
                  <div className="flex flex-col md:flex-row gap-2">
                      <div className="flex-1 relative">
                    <input
                      type="text"
                      value={formData.ubicacion}
                          onChange={handleAddressChange}
                          onKeyDown={handleAddressKeyDown}
                          onFocus={() => {
                            if (addressSuggestions.length > 0) {
                              setShowAddressSuggestions(true);
                            }
                          }}
                          className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                          placeholder="Escribe tu dirección (aparecerán sugerencias)"
                          autoComplete="off"
                        />
                        {isLoadingAddressSuggestions && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <FontAwesomeIcon
                              icon={faSpinner}
                              className="animate-spin text-gray-400"
                            />
                          </div>
                        )}
                      </div>
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={isGettingLocation}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1.5 text-xs whitespace-nowrap"
                      title="Permite al navegador acceder a tu ubicación para llenar automáticamente la dirección"
                    >
                      {isGettingLocation ? (
                        <>
                            <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />
                            <span>Detectando...</span>
                        </>
                      ) : (
                        <>
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                            <span>GPS</span>
                        </>
                      )}
                    </button>
                  </div>
                    
                    {/* Dropdown de sugerencias de direcciones */}
                    {showAddressSuggestions && addressSuggestions.length > 0 && (
                      <div
                        ref={addressSuggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        {addressSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectAddressSuggestion(suggestion)}
                            className={`w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors ${
                              index === selectedSuggestionIndex
                                ? "bg-blue-50 border-l-4 border-blue-500"
                                : "border-l-4 border-transparent"
                            }`}
                          >
                            <div className="flex items-start">
                              <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="mr-2 text-blue-600 mt-1 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 truncate">
                                  {formatAddressSuggestion(suggestion)}
                                </p>
                                {suggestion.address?.city && (
                  <p className="text-xs text-gray-500 mt-1">
                                    {suggestion.address.city}
                                    {suggestion.address.state && `, ${suggestion.address.state}`}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    💡 Escribe tu dirección o usa GPS para prellenar
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Urgencia
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "normal", label: "Normal", sublabel: "1-2 días", borderColor: "border-blue-500", bgColor: "bg-blue-50", textColor: "text-blue-700" },
                      { value: "urgente", label: "Urgente", sublabel: "Hoy", borderColor: "border-orange-500", bgColor: "bg-orange-50", textColor: "text-orange-700" },
                      { value: "emergencia", label: "Emergencia", sublabel: "Ya", borderColor: "border-red-500", bgColor: "bg-red-50", textColor: "text-red-700" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                        setUserOverrodeUrgency(true);
                          setFormData((prev) => ({ ...prev, urgencia: option.value }));
                        }}
                        className={`p-2.5 rounded-lg border-2 transition-all ${
                          formData.urgencia === option.value
                            ? `${option.borderColor} ${option.bgColor} shadow-sm`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-xs font-semibold ${formData.urgencia === option.value ? option.textColor : "text-gray-700"}`}>
                            {option.label}
                          </div>
                          <div className="text-[10px] text-gray-600 mt-0.5">
                            {option.sublabel}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 4: Confirmación */}
          {currentStep === 4 && (
            <div className="space-y-3">
              <div className="text-center mb-3">
                <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1">
                  Confirma y Envía
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Revisa los detalles de tu solicitud
                </p>
              </div>

              {/* Resumen Visual del Servicio */}
              <ServiceSummaryPanel
                serviceName={
                  initialServiceName ||
                  serviceCategories.find((s) => s.id === formData.servicio)?.name ||
                  "Servicio"
                }
                serviceId={formData.servicio}
                formData={(() => {
                  // Intentar extraer información del formulario detallado desde la descripción
                  const desc = formData.descripcion.toLowerCase();
                  const quantityMatch = desc.match(/(\d+)\s*(contacto|interruptor|unidad)/i);
                  const hasMaterials = desc.includes("cliente proporciona") || desc.includes("tengo los");
                  const hasExistingContact = desc.includes("ya existe") || desc.includes("contacto existente");
                  const action = desc.includes("reemplazar") ? "reemplazar" : desc.includes("visita") ? "visita" : "instalar";
                  
                  return {
                    action: action as "instalar" | "reemplazar" | "visita" | null,
                    quantity: quantityMatch ? parseInt(quantityMatch[1]) : null,
                    hasMaterials: hasMaterials ? true : desc.includes("necesario cotizar") ? false : null,
                    hasExistingInfrastructure: hasExistingContact ? true : null,
                    additionalInfo: formData.descripcion.length > 100 ? formData.descripcion : "",
                  };
                })()}
                onShowConditions={() => {
                  // TODO: Abrir modal de condiciones del servicio
                  alert("Modal de condiciones del servicio (próximamente)");
                }}
                className="mb-4"
              />

              <div className="bg-gray-50 rounded-lg p-4 space-y-2.5">
                <div className="flex items-center space-x-2 text-sm">
                  <FontAwesomeIcon icon={faWrench} className="text-blue-600 text-xs" />
                  <span className="text-gray-700">
                    <span className="font-semibold">Servicio:</span>{" "}
                    {
                      serviceCategories.find((s) => s.id === formData.servicio)
                        ?.name
                    }
                  </span>
                </div>
                <div className="flex items-start space-x-2 text-sm">
                  <FontAwesomeIcon
                    icon={faCheck}
                    className="text-green-600 mt-0.5 text-xs"
                  />
                  <span className="text-gray-700">
                    <span className="font-semibold">Descripción:</span>{" "}
                    <span className="text-gray-600">{formData.descripcion.substring(0, 80)}{formData.descripcion.length > 80 ? "..." : ""}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FontAwesomeIcon
                    icon={faWhatsappBrand}
                    className="text-green-600 text-xs"
                  />
                  <span className="text-gray-700">
                    <span className="font-semibold">WhatsApp:</span>{" "}
                    {formattedWhatsappDisplay || formData.whatsapp || "—"}
                  </span>
                </div>
                {(disciplinaIa || urgenciaIa || diagnosticoIa) && (
                  <div className="flex flex-wrap gap-1.5 text-xs text-blue-800 bg-white/70 border border-blue-100 rounded-lg p-2">
                    <span className="font-semibold text-blue-900 text-[10px] uppercase tracking-wide">IA Sumee:</span>
                    {disciplinaIa && (
                      <span className="px-2 py-0.5 bg-blue-100 rounded text-blue-700">
                        {disciplinaIa}
                      </span>
                    )}
                    {Number.isFinite(urgenciaIa) && (
                      <span className="px-2 py-0.5 bg-blue-100 rounded text-blue-700">
                        Urgencia {urgenciaIa}/10
                      </span>
                    )}
                    {diagnosticoIa && (
                      <span className="px-2 py-0.5 bg-blue-100 rounded text-blue-700 text-[10px]">
                        {diagnosticoIa.substring(0, 40)}{diagnosticoIa.length > 40 ? "..." : ""}
                      </span>
                    )}
                  </div>
                )}
                {formData.imagen && (
                  <div className="flex items-center space-x-2 text-sm">
                    <FontAwesomeIcon
                      icon={faCamera}
                      className="text-purple-600 text-xs"
                    />
                    <span className="text-gray-700">
                      <span className="font-semibold">Imagen:</span>{" "}
                      <span className="text-gray-600">{formData.imagen.name.length > 30 ? formData.imagen.name.substring(0, 30) + "..." : formData.imagen.name}</span>
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-red-600 text-xs"
                  />
                  <span className="text-gray-700">
                    <span className="font-semibold">Ubicación:</span>{" "}
                    <span className="text-gray-600">{formData.ubicacion || "CDMX"}</span>
                  </span>
                </div>
                {/* Información de pago - Removida (Stripe se implementará después) */}
              </div>

            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Navigation Compacta */}
          <div className="flex flex-col-reverse md:flex-row justify-between gap-2 mt-4 pt-3 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              <span>Anterior</span>
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                  disabled={
                    !formData.servicio ||
                    (currentStep === 2 && !formData.descripcion.trim()) ||
                    (currentStep === 3 && !whatsappValidation.isValid)
                  }
                className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md text-xs md:text-sm transition-colors"
              >
                <span>Siguiente</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </button>
            ) : (
              <button
                onClick={async (e) => {
                  try {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("🔍 Botón Enviar Solicitud - onClick ejecutado");
                    console.log("🔍 Botón Enviar Solicitud - isSubmittingFreeRequest:", isSubmittingFreeRequest);
                    console.log("🔍 Botón Enviar Solicitud - handleFreeRequestSubmit existe:", typeof handleFreeRequestSubmit);
                    
                    // Asegurar que el estado no esté bloqueado
                    if (isSubmittingFreeRequest) {
                      console.warn("⚠️ Botón Enviar Solicitud - Estado bloqueado, reseteando...");
                      setIsSubmittingFreeRequest(false);
                      // Esperar un momento para que el estado se actualice
                      await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    
                    if (typeof handleFreeRequestSubmit === 'function') {
                      await handleFreeRequestSubmit();
                    } else {
                      console.error("❌ Botón Enviar Solicitud - handleFreeRequestSubmit no es una función");
                      setError("Error interno: función no disponible. Por favor, recarga la página.");
                    }
                  } catch (error) {
                    console.error("❌ Botón Enviar Solicitud - Error en onClick:", error);
                    setError("Error al enviar la solicitud. Por favor, intenta de nuevo.");
                    setIsSubmittingFreeRequest(false);
                  }
                }}
                disabled={isSubmittingFreeRequest}
                className="flex items-center space-x-1.5 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md text-xs md:text-sm transition-colors z-[100] relative"
                type="button"
                aria-label="Enviar solicitud de servicio"
              >
                {isSubmittingFreeRequest ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} className="text-xs" />
                    <span>Enviar Solicitud</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

