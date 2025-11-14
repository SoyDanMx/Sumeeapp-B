"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPaperPlane,
  faImage,
  faSpinner,
  faRobot,
  faUser,
  faCheckCircle,
  faExclamationTriangle,
  faLightbulb,
  faWrench,
  faVideo,
  faHardHat,
  faSeedling,
  faThermometerHalf,
  faHammer,
  faPaintBrush,
  faBroom,
  faWifi,
  faBug,
  faKey,
  faCubes,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { geocodeAddress } from "@/lib/geocoding";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

interface AIClassification {
  disciplina?: string;
  urgencia?: string;
  diagnostico?: string;
  descripcion_final?: string;
}

interface DisciplineOption {
  id: string;
  name: string;
  icon: any;
  role: string;
  description: string;
  gradient: string;
  color: string;
}

interface AISumeeAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated?: () => void;
}

// Disciplinas disponibles con sus roles especializados
const DISCIPLINE_OPTIONS: DisciplineOption[] = [
  {
    id: "electricidad",
    name: "Electricidad",
    icon: faLightbulb,
    role: "Ingeniero Eléctrico",
    description: "Instalaciones, cableado, tableros y seguridad eléctrica",
    gradient: "from-yellow-500 to-orange-600",
    color: "text-yellow-600",
  },
  {
    id: "plomeria",
    name: "Plomería",
    icon: faWrench,
    role: "Ingeniero Hidráulico",
    description: "Sistemas de agua, drenaje, presión y fugas",
    gradient: "from-blue-500 to-cyan-600",
    color: "text-blue-600",
  },
  {
    id: "cctv",
    name: "CCTV y Seguridad",
    icon: faVideo,
    role: "Ingeniero en Sistemas - Especialista en CCTV",
    description: "Cámaras, monitoreo y seguridad electrónica",
    gradient: "from-purple-500 to-indigo-600",
    color: "text-purple-600",
  },
  {
    id: "construccion",
    name: "Construcción/Albañilería",
    icon: faHardHat,
    role: "Arquitecto Constructor",
    description: "Obras, estructuras, acabados y permisos",
    gradient: "from-orange-500 to-red-600",
    color: "text-orange-600",
  },
  {
    id: "jardineria",
    name: "Jardinería",
    icon: faSeedling,
    role: "Especialista en Jardinería y Gardening",
    description: "Diseño paisajístico, plantas, riego y mantenimiento",
    gradient: "from-green-500 to-emerald-600",
    color: "text-green-600",
  },
  {
    id: "aire-acondicionado",
    name: "Aire Acondicionado",
    icon: faThermometerHalf,
    role: "Ingeniero en HVAC",
    description: "Climatización, refrigeración y eficiencia energética",
    gradient: "from-cyan-500 to-teal-600",
    color: "text-cyan-600",
  },
  {
    id: "carpinteria",
    name: "Carpintería",
    icon: faHammer,
    role: "Maestro Carpintero",
    description: "Muebles, estructuras de madera y acabados",
    gradient: "from-amber-500 to-yellow-600",
    color: "text-amber-600",
  },
  {
    id: "pintura",
    name: "Pintura",
    icon: faPaintBrush,
    role: "Arquitecto Especialista en Acabados",
    description: "Pintura, impermeabilización y acabados arquitectónicos",
    gradient: "from-indigo-500 to-purple-600",
    color: "text-indigo-600",
  },
  {
    id: "limpieza",
    name: "Limpieza",
    icon: faBroom,
    role: "Especialista en Limpieza Profesional",
    description: "Limpieza residencial, comercial e industrial",
    gradient: "from-green-400 to-emerald-500",
    color: "text-green-500",
  },
  {
    id: "wifi",
    name: "WiFi/Redes",
    icon: faWifi,
    role: "Ingeniero en Redes y Ciberseguridad",
    description: "Redes, WiFi, seguridad informática y cableado estructurado",
    gradient: "from-pink-500 to-rose-600",
    color: "text-pink-600",
  },
  {
    id: "fumigacion",
    name: "Fumigación",
    icon: faBug,
    role: "Especialista en Control de Plagas",
    description: "Fumigación y control integrado de plagas",
    gradient: "from-red-500 to-orange-600",
    color: "text-red-600",
  },
  {
    id: "tablaroca",
    name: "Tablaroca",
    icon: faCubes,
    role: "Arquitecto Especialista en Construcción en Seco",
    description: "Tablaroca, cielos falsos y divisiones",
    gradient: "from-gray-500 to-slate-600",
    color: "text-gray-600",
  },
  {
    id: "cerrajeria",
    name: "Cerrajería",
    icon: faKey,
    role: "Especialista en Seguridad Física",
    description: "Cerraduras, sistemas de seguridad y control de acceso",
    gradient: "from-gray-600 to-zinc-700",
    color: "text-gray-700",
  },
];

export default function AISumeeAssistant({
  isOpen,
  onClose,
  onLeadCreated,
}: AISumeeAssistantProps) {
  const { user } = useAuth();
  const [selectedDiscipline, setSelectedDiscipline] = useState<DisciplineOption | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [classification, setClassification] = useState<AIClassification | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceLocation, setServiceLocation] = useState<string>("");
  const [serviceLocationCoords, setServiceLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [clientWhatsApp, setClientWhatsApp] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll automático al final del chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mensaje inicial cuando se selecciona una disciplina
  useEffect(() => {
    if (selectedDiscipline && messages.length === 0) {
      const welcomeMessages: Record<string, string> = {
        electricidad: `¡Hola! 👋 Soy tu **${selectedDiscipline.role}** especialista en instalaciones eléctricas, cableado, tableros y seguridad eléctrica. Cuéntame sobre tu proyecto eléctrico y, si tienes una foto, compártela conmigo. Te ayudaré a crear una solicitud precisa para encontrar el técnico perfecto.`,
        plomeria: `¡Hola! 👋 Soy tu **${selectedDiscipline.role}** especialista en sistemas de agua potable, drenaje, presión y calentamiento. Describe tu problema de plomería y, si tienes una foto, compártela. Te ayudaré a crear una solicitud detallada.`,
        cctv: `¡Hola! 👋 Soy tu **${selectedDiscipline.role}** especialista en sistemas de seguridad, cámaras de vigilancia y monitoreo. Cuéntame sobre tu proyecto de seguridad y, si tienes una foto del área, compártela. Te ayudaré a diseñar la solución perfecta.`,
        construccion: `¡Hola! 👋 Soy tu **${selectedDiscipline.role}** especialista en obras, estructuras, acabados y permisos de construcción. Describe tu proyecto y, si tienes planos o fotos, compártelos. Te ayudaré a crear una solicitud profesional.`,
        jardineria: `¡Hola! 👋 Soy tu **${selectedDiscipline.role}** especialista en diseño paisajístico, plantas, riego y mantenimiento de jardines. Cuéntame sobre tu proyecto de jardinería y, si tienes fotos del espacio, compártelas. Te ayudaré a crear una solicitud detallada.`,
        "aire-acondicionado": `¡Hola! 👋 Soy tu **${selectedDiscipline.role}** especialista en climatización, refrigeración y eficiencia energética. Describe tu necesidad de aire acondicionado y, si tienes una foto del equipo o área, compártela. Te ayudaré a encontrar la solución perfecta.`,
        carpinteria: `¡Hola! 👋 Soy tu **${selectedDiscipline.role}** especialista en muebles, estructuras de madera y acabados. Cuéntame sobre tu proyecto de carpintería y, si tienes fotos o diseños, compártelos. Te ayudaré a crear una solicitud precisa.`,
        pintura: `¡Hola! 👋 Soy tu **${selectedDiscipline.role}** especialista en pintura, impermeabilización y acabados arquitectónicos. Describe tu proyecto y, si tienes fotos del área a pintar, compártelas. Te ayudaré a crear una solicitud profesional.`,
        limpieza: `¡Hola! 👋 Soy tu **${selectedDiscipline.role}** especialista en limpieza residencial, comercial e industrial. Cuéntame sobre tus necesidades de limpieza y, si tienes fotos del área, compártelas. Te ayudaré a crear una solicitud detallada.`,
        wifi: `¡Hola! 👋 Soy tu **${selectedDiscipline.role}** especialista en redes, WiFi, seguridad informática y cableado estructurado. Describe tu necesidad de conectividad y, si tienes un plano del área, compártelo. Te ayudaré a diseñar la solución perfecta.`,
        fumigacion: `¡Hola! 👋 Soy tu **${selectedDiscipline.role}** especialista en fumigación y control integrado de plagas. Cuéntame sobre el problema de plagas y, si tienes fotos, compártelas. Te ayudaré a crear una solicitud para el tratamiento adecuado.`,
        tablaroca: `¡Hola! 👋 Soy tu **${selectedDiscipline.role}** especialista en construcción en seco, tablaroca, cielos falsos y divisiones. Describe tu proyecto y, si tienes fotos o planos, compártelos. Te ayudaré a crear una solicitud profesional.`,
        cerrajeria: `¡Hola! 👋 Soy tu **${selectedDiscipline.role}** especialista en cerraduras, sistemas de seguridad y control de acceso. Cuéntame sobre tu necesidad de seguridad y, si tienes fotos, compártelas. Te ayudaré a crear una solicitud detallada.`,
      };

      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: welcomeMessages[selectedDiscipline.id] || `¡Hola! 👋 Soy tu asistente Sumee especializado en ${selectedDiscipline.name}. Cuéntame qué necesitas y, si tienes una foto, compártela conmigo.`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [selectedDiscipline]);

  // Limpiar estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSelectedDiscipline(null);
      setMessages([]);
      setInputText("");
      setSelectedImage(null);
      setImagePreview(null);
      setClassification(null);
      setIsLoading(false);
      setIsSubmitting(false);
      setServiceLocation("");
      setServiceLocationCoords(null);
      setIsGeocoding(false);
      setIsGettingLocation(false);
      setClientWhatsApp("");
    }
  }, [isOpen]);

  // Geocodificar la ubicación cuando el usuario la ingrese (no bloqueante)
  const handleLocationGeocode = async (address: string) => {
    if (!address.trim()) {
      setServiceLocationCoords(null);
      return;
    }

    setIsGeocoding(true);
    try {
      const coords = await geocodeAddress(address);
      if (coords) {
        setServiceLocationCoords({ lat: coords.lat, lng: coords.lng });
        // Actualizar el texto con la dirección completa encontrada
        if (coords.displayName && coords.displayName !== address) {
          setServiceLocation(coords.displayName);
        }
      } else {
        // No establecer coordenadas si falla, pero no mostrar error crítico
        setServiceLocationCoords(null);
      }
    } catch (error) {
      // Error silencioso - el usuario puede continuar sin geocoding
      console.warn("Geocoding no disponible:", error);
      setServiceLocationCoords(null);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Obtener ubicación actual del navegador
  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "⚠️ Tu navegador no soporta geolocalización. Por favor, ingresa la dirección manualmente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setServiceLocationCoords({ lat: latitude, lng: longitude });
        
        // Hacer reverse geocoding para obtener la dirección
        try {
          const { reverseGeocode } = await import("@/lib/geocoding");
          const addressData = await reverseGeocode(latitude, longitude);
          if (addressData) {
            setServiceLocation(addressData.address);
          } else {
            setServiceLocation(`${latitude}, ${longitude}`);
          }
        } catch (error) {
          console.error("Error en reverse geocoding:", error);
          setServiceLocation(`${latitude}, ${longitude}`);
        }
        
        setIsGettingLocation(false);
        
        const successMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "✅ Ubicación obtenida correctamente. Puedes ajustarla si es necesario.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, successMessage]);
      },
      (error) => {
        setIsGettingLocation(false);
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: `⚠️ No se pudo obtener tu ubicación: ${error.message}. Por favor, ingresa la dirección manualmente.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Manejar selección de imagen
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es demasiado grande. Por favor, selecciona una imagen menor a 5MB.");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Subir imagen a Supabase Storage
  const uploadImageToStorage = async (file: File): Promise<string> => {
    if (!user) throw new Error("Usuario no autenticado");

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `problem-photos/${fileName}`;

    const { data, error } = await supabase.storage
      .from("problem-photos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error subiendo imagen:", error);
      throw new Error("Error al subir la imagen");
    }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("problem-photos").getPublicUrl(filePath);

    return publicUrl;
  };

  // Llamar a la Edge Function classify-service
  const callClassifyService = async (
    description: string,
    imageUrl?: string
  ): Promise<AIClassification> => {
    try {
      const { data, error } = await supabase.functions.invoke("classify-service", {
        body: {
          description,
          image_url: imageUrl || null,
          discipline: selectedDiscipline?.id || null, // Enviar disciplina seleccionada
          role: selectedDiscipline?.role || null, // Enviar rol del asistente
        },
      });

      if (error) {
        // Si la función no está disponible, usar clasificación básica local sin mostrar error crítico
        if (error.message?.includes("Failed to send a request") || 
            error.message?.includes("Function not found") ||
            error.name === "FunctionsFetchError") {
          // Solo log de advertencia, no error crítico, ya que tenemos fallback
          console.info("ℹ️ Edge Function no disponible, usando clasificación básica local (esto es normal si la función no está desplegada)");
          return getBasicClassification(description);
        }
        
        // Para otros errores, sí mostrar error
        console.error("Error llamando classify-service:", error);
        throw new Error(error.message || "Error al clasificar el servicio");
      }

      if (!data) {
        throw new Error("No se recibió respuesta de la IA");
      }

      return data as AIClassification;
    } catch (error: any) {
      // Fallback a clasificación básica si hay error de conexión
      if (error.message?.includes("Failed to send") || 
          error.message?.includes("fetch") ||
          error.name === "FunctionsFetchError") {
        // Solo log informativo, no error crítico, ya que tenemos fallback
        console.info("ℹ️ Usando clasificación básica local como fallback (Edge Function no disponible)");
        return getBasicClassification(description);
      }
      
      // Para otros errores, sí mostrar error
      console.error("Error en callClassifyService:", error);
      throw error;
    }
  };

  // Clasificación básica local como fallback (mejorada con disciplina seleccionada)
  const getBasicClassification = (description: string): AIClassification => {
    // Si hay una disciplina seleccionada, usarla directamente
    if (selectedDiscipline) {
      const descLower = description.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      
      // Mapeo de ID de disciplina a nombre de disciplina para la BD
      const disciplineMap: Record<string, string> = {
        "electricidad": "Electricidad",
        "plomeria": "Plomería",
        "cctv": "CCTV y Seguridad",
        "construccion": "Construcción",
        "jardineria": "Jardinería",
        "aire-acondicionado": "HVAC",
        "carpinteria": "Carpintería",
        "pintura": "Pintura",
        "limpieza": "Limpieza",
        "wifi": "Redes WiFi",
        "fumigacion": "Fumigación",
        "tablaroca": "Tablaroca",
        "cerrajeria": "Cerrajería",
      };
      
      const disciplina = disciplineMap[selectedDiscipline.id] || selectedDiscipline.name;
      
      // Diagnóstico específico según disciplina
      let diagnostico = "";
      if (selectedDiscipline.id === "electricidad") {
        if (descLower.includes("instalar") || descLower.includes("instalacion")) {
          diagnostico = "Instalación eléctrica";
        } else if (descLower.includes("reparar") || descLower.includes("reparacion")) {
          diagnostico = "Reparación eléctrica";
        } else {
          diagnostico = "Servicio de electricidad";
        }
      } else {
        diagnostico = `Servicio de ${selectedDiscipline.name}`;
      }
      
      const urgencia = (descLower.includes("urgente") || descLower.includes("emergencia") || descLower.includes("inmediat") || descLower.includes("ya")) ? "8" : "5";
      
      return {
        disciplina,
        urgencia,
        diagnostico,
        descripcion_final: description,
      };
    }
    
    // Si no hay disciplina seleccionada, usar clasificación por palabras clave (fallback)
    const descLower = description.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remover acentos para mejor matching
    
    // Clasificación mejorada basada en palabras clave con prioridad
    let disciplina = "Otros";
    let confidence = 0;
    
    // ELECTRICIDAD - Palabras clave más específicas primero
    const electricidadKeywords = [
      "electricista", "electricidad", "electrico", "electrica",
      "lampara", "lámpara", "lamp", "bombilla", "foco", "led",
      "instalar lampara", "instalar lámpara", "instalacion electrica",
      "cable", "cableado", "cables", "cablear",
      "interruptor", "interruptores", "switch",
      "contacto", "contactos", "enchufe", "enchufes",
      "tablero", "tablero electrico", "breakers", "fusibles",
      "luminaria", "luminarias", "plafon", "plafones",
      "apagador", "apagadores", "luz", "luces",
      "voltaje", "amperaje", "cortocircuito", "corto circuito"
    ];
    
    const electricidadScore = electricidadKeywords.filter(keyword => 
      descLower.includes(keyword)
    ).length;
    
    // PLOMERÍA
    const plomeriaKeywords = [
      "plomero", "plomeria", "plomería",
      "agua", "fuga", "fugas", "gotera", "goteras",
      "llave", "llaves", "grifo", "grifos", "regadera",
      "tuberia", "tubería", "tuberias", "tuberías",
      "drenaje", "desazolve", "desazolve", "coladera",
      "wc", "sanitario", "inodoro", "lavabo", "lavamanos",
      "calentador", "boiler", "tinaco", "cisterna",
      "valvula", "válvula", "valvulas", "válvulas"
    ];
    
    const plomeriaScore = plomeriaKeywords.filter(keyword => 
      descLower.includes(keyword)
    ).length;
    
    // HVAC (Aire Acondicionado)
    const hvacKeywords = [
      "aire acondicionado", "aire acondicionado", "ac", "a/c",
      "clima", "climatizacion", "climatización",
      "refrigeracion", "refrigeración", "refrigerador",
      "minisplit", "mini split", "split",
      "ventilador", "ventiladores", "ventilacion",
      "calefaccion", "calefacción", "calefactor"
    ];
    
    const hvacScore = hvacKeywords.filter(keyword => 
      descLower.includes(keyword)
    ).length;
    
    // CARPINTERÍA
    const carpinteriaKeywords = [
      "carpintero", "carpinteria", "carpintería",
      "madera", "mueble", "muebles", "muebleria",
      "closet", "closets", "ropero", "roperos",
      "puerta", "puertas", "ventana", "ventanas",
      "estante", "estantes", "repisa", "repisas"
    ];
    
    const carpinteriaScore = carpinteriaKeywords.filter(keyword => 
      descLower.includes(keyword)
    ).length;
    
    // PINTURA
    const pinturaKeywords = [
      "pintor", "pintura", "pintar", "pintado",
      "brocha", "brochas", "rodillo", "rodillos",
      "barniz", "barnizar", "esmalte", "esmaltar"
    ];
    
    const pinturaScore = pinturaKeywords.filter(keyword => 
      descLower.includes(keyword)
    ).length;
    
    // Determinar disciplina con mayor score
    const scores = {
      "Electricidad": electricidadScore,
      "Plomería": plomeriaScore,
      "HVAC": hvacScore,
      "Carpintería": carpinteriaScore,
      "Pintura": pinturaScore,
    };
    
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      disciplina = Object.keys(scores).find(key => scores[key as keyof typeof scores] === maxScore) || "Otros";
    }
    
    // Si menciona específicamente "electricista" o "para electricista", forzar Electricidad
    if (descLower.includes("electricista") || descLower.includes("para electricista")) {
      disciplina = "Electricidad";
    }
    
    // Urgencia básica (5 por defecto, 8 si hay palabras de urgencia)
    const urgencia = (descLower.includes("urgente") || descLower.includes("emergencia") || descLower.includes("inmediat") || descLower.includes("ya")) ? "8" : "5";
    
    // Diagnóstico más descriptivo
    let diagnostico = "";
    if (disciplina === "Electricidad") {
      if (descLower.includes("instalar") || descLower.includes("instalacion")) {
        diagnostico = "Instalación eléctrica";
      } else if (descLower.includes("reparar") || descLower.includes("reparacion")) {
        diagnostico = "Reparación eléctrica";
      } else {
        diagnostico = "Servicio de electricidad";
      }
    } else {
      diagnostico = `Servicio de ${disciplina}`;
    }
    
    return {
      disciplina,
      urgencia,
      diagnostico,
      descripcion_final: description,
    };
  };

  // Enviar mensaje con debounce para clasificación progresiva
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
      imageUrl: imagePreview || undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      let imageUrl: string | undefined;

      // Subir imagen si existe
      if (selectedImage) {
        imageUrl = await uploadImageToStorage(selectedImage);
        setSelectedImage(null);
        setImagePreview(null);
      }

      // Llamar a la Edge Function con debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const aiResponse = await callClassifyService(
            userMessage.content,
            imageUrl
          );

          setClassification(aiResponse);

          // Construir respuesta del asistente
          let assistantContent = "";
          if (aiResponse.disciplina) {
            assistantContent += `✅ He clasificado tu solicitud como: **${aiResponse.disciplina}**\n\n`;
          }
          if (aiResponse.diagnostico) {
            assistantContent += `📋 Diagnóstico sugerido: ${aiResponse.diagnostico}\n\n`;
          }
          if (aiResponse.urgencia) {
            assistantContent += `⚡ Urgencia: ${aiResponse.urgencia}/10\n\n`;
          }
          if (aiResponse.descripcion_final) {
            assistantContent += `📝 Descripción final: ${aiResponse.descripcion_final}\n\n`;
          }

          assistantContent +=
            "¿Te parece correcto? Si estás de acuerdo, puedo enviar tu solicitud para que un técnico PRO se ponga en contacto contigo.";

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: assistantContent,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
        } catch (error: any) {
          console.error("Error en clasificación:", error);
          
          // Mensaje más específico según el tipo de error
          let errorContent = "Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.";
          
          if (error.message?.includes("Failed to send") || error.name === "FunctionsFetchError") {
            errorContent = "⚠️ La función de IA no está disponible en este momento. Se está usando una clasificación básica basada en tu descripción. Para usar la IA completa, asegúrate de que la Edge Function esté desplegada en Supabase.";
          } else if (error.message?.includes("subir la imagen")) {
            errorContent = "⚠️ Hubo un error al subir la imagen. Por favor, intenta con otra imagen o continúa solo con texto.";
          }
          
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: errorContent,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
      }, 1000); // Debounce de 1 segundo
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      setIsLoading(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Lo siento, hubo un error. Por favor, intenta nuevamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [inputText, selectedImage, imagePreview, user]);

  // Enviar solicitud final
  const handleSubmitRequest = async () => {
    if (!classification || !user) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "⚠️ Debes estar autenticado para enviar una solicitud. Por favor, inicia sesión.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Validar que haya ubicación del servicio o coordenadas
    if (!serviceLocation.trim() && !serviceLocationCoords) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "⚠️ Por favor, ingresa la ubicación donde necesitas el servicio o usa el botón 'Usar mi ubicación actual' antes de enviar la solicitud.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Validar que haya WhatsApp del cliente
    if (!clientWhatsApp.trim()) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "⚠️ Por favor, ingresa tu número de WhatsApp para que los profesionales puedan contactarte.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Si hay texto pero no coordenadas, intentar geocodificar (pero no bloquear si falla)
    if (serviceLocation.trim() && !serviceLocationCoords) {
      setIsGeocoding(true);
      try {
        const coords = await geocodeAddress(serviceLocation);
        if (coords) {
          setServiceLocationCoords({ lat: coords.lat, lng: coords.lng });
        }
      } catch (error) {
        console.warn("Geocoding falló, continuando con coordenadas por defecto:", error);
      } finally {
        setIsGeocoding(false);
      }
    }

    setIsSubmitting(true);
    try {
      // Obtener perfil completo del cliente (opcional, no bloquear si falla)
      let profile = null;
      try {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, ubicacion_lat, ubicacion_lng, ubicacion_direccion, phone, whatsapp")
          .eq("user_id", user.id)
          .single();
        
        if (profileError) {
          console.warn("No se pudo obtener perfil (continuando):", profileError);
        } else {
          profile = data;
          // Inicializar WhatsApp del cliente si no está en el estado pero sí en el perfil
          if (!clientWhatsApp.trim() && (profile.whatsapp || profile.phone)) {
            setClientWhatsApp(profile.whatsapp || profile.phone || "");
          }
        }
      } catch (error) {
        console.warn("Error obteniendo perfil (continuando):", error);
      }

      // Mapeo de disciplinas para la BD
      const disciplineMap: Record<string, string> = {
        "electricidad": "Electricidad",
        "plomeria": "Plomería",
        "cctv": "CCTV y Seguridad",
        "construccion": "Construcción",
        "jardineria": "Jardinería",
        "aire-acondicionado": "HVAC",
        "carpinteria": "Carpintería",
        "pintura": "Pintura",
        "limpieza": "Limpieza",
        "wifi": "Redes WiFi",
        "fumigacion": "Fumigación",
        "tablaroca": "Tablaroca",
        "cerrajeria": "Cerrajería",
      };
      
      // Usar disciplina seleccionada si existe, sino usar la clasificación de la IA
      const disciplinaFinal = selectedDiscipline 
        ? disciplineMap[selectedDiscipline.id] || selectedDiscipline.name
        : classification.disciplina || "General";
      
      // Usar coordenadas del servicio (prioridad) o del perfil del cliente
      const ubicacionLat = serviceLocationCoords?.lat || profile?.ubicacion_lat || 19.4326; // CDMX por defecto
      const ubicacionLng = serviceLocationCoords?.lng || profile?.ubicacion_lng || -99.1332; // CDMX por defecto
      const ubicacionDireccion = serviceLocation.trim() || profile?.ubicacion_direccion || "Ubicación no especificada";
      
      // Preparar datos para crear el lead según la firma de la función actualizada
      // Orden según la firma: nombre_cliente_in, whatsapp_in, descripcion_proyecto_in, ubicacion_lat_in, ubicacion_lng_in, servicio_in, urgencia_in, ubicacion_direccion_in, imagen_url_in, photos_urls_in, disciplina_ia_in, urgencia_ia_in, diagnostico_ia_in
      const urgenciaValue = classification.urgencia || "5";
      // Usar WhatsApp del cliente capturado en el formulario, o del perfil como fallback
      const whatsappFinal = clientWhatsApp.trim() || profile?.whatsapp || profile?.phone || user.user_metadata?.phone || "";
      
      const leadData = {
        nombre_cliente_in: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Cliente",
        whatsapp_in: whatsappFinal, // Usar WhatsApp capturado en el formulario
        descripcion_proyecto_in: classification.descripcion_final || inputText || "Solicitud de servicio",
        ubicacion_lat_in: Number(ubicacionLat), // Convertir a número explícitamente
        ubicacion_lng_in: Number(ubicacionLng), // Convertir a número explícitamente
        servicio_in: disciplinaFinal,
        urgencia_in: urgenciaValue, // Parámetro para compatibilidad
        ubicacion_direccion_in: ubicacionDireccion,
        imagen_url_in: null, // Por ahora null, se puede agregar después
        photos_urls_in: null, // Por ahora null, se puede agregar después
        disciplina_ia_in: disciplinaFinal,
        urgencia_ia_in: urgenciaValue, // Este es el que realmente se guarda en la BD
        diagnostico_ia_in: classification.diagnostico || `Servicio de ${disciplinaFinal}`,
      };

      console.log("📤 Enviando lead con datos:", leadData);

      // Llamar al RPC create_lead
      const { data, error } = await supabase.rpc("create_lead", leadData);

      if (error) {
        console.error("❌ Error creando lead:", error);
        
        // Extraer mensaje de error de forma más robusta
        let errorMessage = "Error al crear la solicitud";
        
        if (error.message) {
          errorMessage = error.message;
        } else if (error.code) {
          errorMessage = `Error ${error.code}: ${error.message || "Error desconocido"}`;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.details) {
          errorMessage = error.details;
        } else if (error.hint) {
          errorMessage = error.hint;
        }
        
        // Mensaje más amigable para el usuario
        if (errorMessage.includes("urgencia") && errorMessage.includes("does not exist")) {
          errorMessage = "Error en la base de datos: columna de urgencia no encontrada. Por favor, contacta al soporte.";
        } else if (errorMessage.includes("No hay usuario autenticado")) {
          errorMessage = "Debes estar autenticado para crear una solicitud. Por favor, inicia sesión.";
        }
        
        throw new Error(errorMessage);
      }

      console.log("✅ Lead creado exitosamente:", data);

      // Mensaje de éxito
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content:
          `¡Perfecto! ✅ Tu solicitud ha sido enviada exitosamente.\n\n📋 **Resumen:**\n- Disciplina: ${disciplinaFinal}\n- Ubicación: ${ubicacionDireccion || "Coordenadas: " + ubicacionLat + ", " + ubicacionLng}\n- Urgencia: ${classification.urgencia || "5"}/10\n\nUn técnico PRO cercano a tu ubicación se pondrá en contacto contigo pronto.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, successMessage]);
      onLeadCreated?.();

      // Cerrar modal después de 3 segundos
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error: any) {
      console.error("❌ Error enviando solicitud:", error);
      
      // Mensaje de error más descriptivo
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ Error al enviar la solicitud: ${error.message || "Error desconocido"}\n\nPor favor, verifica:\n- Que estés autenticado\n- Que la ubicación sea válida\n- Intenta nuevamente`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Pantalla de selección de disciplinas - Diseño Ultra Compacto
  if (!selectedDiscipline) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-5xl mx-auto px-2 sm:px-3 py-2 sm:py-3">
          {/* Header Compacto - Sin sticky para evitar que tape contenido */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-gray-200/50">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-0.5 leading-tight truncate">
                SUMEE AI te guía
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                Selecciona el servicio que necesitas
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all ml-2 flex-shrink-0"
            >
              <FontAwesomeIcon icon={faTimes} className="text-gray-600 text-xs sm:text-sm" />
            </button>
          </div>

          {/* Grid de Disciplinas - Ultra Compacto */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2 pb-2">
            {DISCIPLINE_OPTIONS.map((discipline) => (
              <button
                key={discipline.id}
                onClick={() => setSelectedDiscipline(discipline)}
                className="group relative bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-2.5 border border-gray-200/60 hover:border-gray-300 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1.5 rounded-lg bg-gradient-to-br ${discipline.gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-all`}>
                  <FontAwesomeIcon icon={discipline.icon} className="text-white text-sm sm:text-base" />
                </div>
                <h3 className={`font-semibold text-[10px] sm:text-[11px] ${discipline.color} mb-0.5 text-center leading-tight line-clamp-1`}>
                  {discipline.name}
                </h3>
                <p className="text-[8px] sm:text-[9px] text-gray-500 text-center line-clamp-2 mb-0.5 leading-tight min-h-[2rem] sm:min-h-[2.25rem]">
                  {discipline.description}
                </p>
                <div className="text-[7px] sm:text-[8px] text-gray-400 text-center leading-tight line-clamp-1">
                  {discipline.role}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Pantalla del chat (cuando ya se seleccionó una disciplina) - Diseño Compacto y Responsive
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative w-full max-w-2xl h-full sm:h-[90vh] sm:max-h-[800px] bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl flex flex-col border border-gray-200/50">
        {/* Header Compacto */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200/50 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${selectedDiscipline.gradient} flex items-center justify-center shadow-sm flex-shrink-0`}>
              <FontAwesomeIcon icon={selectedDiscipline.icon} className="text-white text-sm sm:text-base" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-sm sm:text-base text-gray-900 truncate">{selectedDiscipline.role}</h2>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">{selectedDiscipline.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => setSelectedDiscipline(null)}
              className="px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cambiar disciplina"
            >
              Cambiar
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-gray-600 text-xs sm:text-sm" />
            </button>
          </div>
        </div>

        {/* Chat Area - Compacto */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-white">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${selectedDiscipline ? `bg-gradient-to-br ${selectedDiscipline.gradient} bg-opacity-20` : 'bg-indigo-100'}`}>
                  <FontAwesomeIcon 
                    icon={selectedDiscipline?.icon || faRobot} 
                    className={`text-xs sm:text-sm ${selectedDiscipline?.color || 'text-indigo-600'}`} 
                  />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl sm:rounded-2xl p-3 sm:p-4 ${
                  message.role === "user"
                    ? `bg-gradient-to-br ${selectedDiscipline.gradient} text-white shadow-md`
                    : "bg-gray-50 text-gray-900 border border-gray-200/50"
                }`}
              >
                {message.imageUrl && (
                  <img
                    src={message.imageUrl}
                    alt="Problema"
                    className="w-full max-w-xs rounded-lg mb-2"
                  />
                )}
                <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{message.content}</p>
                <p className="text-[10px] sm:text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.role === "user" && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faUser} className="text-indigo-600 text-xs sm:text-sm" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faRobot} className="text-indigo-600 text-sm" />
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-indigo-600" />
                <span className="ml-2 text-sm text-gray-600">Analizando...</span>
              </div>
            </div>
          )}

          {/* Botón de envío si hay clasificación - Compacto */}
          {classification && !isSubmitting && (
            <div className={`bg-gradient-to-br ${selectedDiscipline.gradient} bg-opacity-10 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-sm`}>
              <div className="flex items-start gap-2 sm:gap-3">
                <FontAwesomeIcon icon={faCheckCircle} className={`${selectedDiscipline.color} mt-0.5 sm:mt-1 text-base sm:text-lg flex-shrink-0`} />
                <div className="flex-1 space-y-3 min-w-0">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1.5 text-xs sm:text-sm leading-tight">
                      ¡Perfecto! Confirmamos un trabajo de{" "}
                      <span className={`${selectedDiscipline.color} font-bold`}>{classification.disciplina}</span> con
                      urgencia <span className={`${selectedDiscipline.color} font-bold`}>{classification.urgencia}/10</span>.
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-700 mb-2">
                      Para asignar el técnico más cercano, necesitamos la ubicación del servicio:
                    </p>
                  </div>
                  
                  {/* Campo de ubicación del servicio - Simplificado */}
                  <div className="space-y-2">
                    <label className="block text-[11px] sm:text-xs font-medium text-gray-700">
                      📍 Ubicación del servicio *
                    </label>
                    
                    {/* Botón de usar ubicación actual */}
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isGettingLocation || isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg sm:rounded-xl transition-colors text-[11px] sm:text-xs font-medium text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGettingLocation ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                          Obteniendo ubicación...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Usar mi ubicación actual
                        </>
                      )}
                    </button>
                    
                    <div className="relative flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={serviceLocation}
                          onChange={(e) => {
                            setServiceLocation(e.target.value);
                            // Geocodificar después de 1 segundo de inactividad
                            if (debounceTimerRef.current) {
                              clearTimeout(debounceTimerRef.current);
                            }
                            debounceTimerRef.current = setTimeout(() => {
                              if (e.target.value.trim()) {
                                handleLocationGeocode(e.target.value);
                              }
                            }, 1000);
                          }}
                          placeholder="O ingresa una dirección (ej: Calle Principal 123, CDMX)"
                          className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-gray-400 transition-colors text-xs sm:text-sm"
                          disabled={isSubmitting || isGeocoding}
                        />
                      </div>
                      {serviceLocationCoords && (
                        <div className="flex-shrink-0">
                          <a
                            href={`https://www.google.com/maps?q=${serviceLocationCoords.lat},${serviceLocationCoords.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg sm:rounded-xl transition-colors"
                            title="Ver en Google Maps"
                          >
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {isGeocoding && (
                      <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[10px]" />
                        Buscando dirección en Google Maps...
                      </p>
                    )}
                    {serviceLocationCoords && !isGeocoding && (
                      <p className="text-[10px] sm:text-xs text-green-600 flex items-center gap-1.5">
                        ✅ Ubicación verificada - {serviceLocationCoords.lat.toFixed(6)}, {serviceLocationCoords.lng.toFixed(6)}
                      </p>
                    )}
                    {serviceLocation && !serviceLocationCoords && !isGeocoding && serviceLocation.length > 5 && (
                      <p className="text-[10px] sm:text-xs text-yellow-600">
                        ⚠️ No se pudo verificar la dirección automáticamente. Puedes continuar o usar "Usar mi ubicación actual" para mayor precisión.
                      </p>
                    )}
                  </div>

                  {/* Campo de WhatsApp del cliente */}
                  <div className="space-y-2">
                    <label className="block text-[11px] sm:text-xs font-medium text-gray-700">
                      📱 WhatsApp de contacto *
                    </label>
                    <input
                      type="tel"
                      value={clientWhatsApp}
                      onChange={(e) => {
                        // Permitir solo números, espacios y guiones
                        const value = e.target.value.replace(/[^\d\s-+]/g, "");
                        setClientWhatsApp(value);
                      }}
                      placeholder="Ej: 55 1234 5678 o +52 55 1234 5678"
                      className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:border-gray-400 transition-colors text-xs sm:text-sm"
                      disabled={isSubmitting}
                      required
                    />
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Este número se compartirá con profesionales verificados para coordinar el servicio por WhatsApp.
                    </p>
                  </div>

                  <button
                    onClick={handleSubmitRequest}
                    disabled={(!serviceLocation.trim() && !serviceLocationCoords) || !clientWhatsApp.trim() || isGeocoding || isSubmitting}
                    className={`w-full bg-gradient-to-r ${selectedDiscipline.gradient} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm transform hover:scale-[1.01] active:scale-[0.99]`}
                  >
                    {isSubmitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs sm:text-sm" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPaperPlane} className="text-xs sm:text-sm" />
                        Enviar Solicitud
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isSubmitting && (
            <div className="flex gap-3 justify-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-600 mr-2" />
                <span className="text-sm text-blue-900">Enviando solicitud...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Compacto */}
        <div className="p-3 sm:p-4 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-b-xl sm:rounded-b-2xl flex-shrink-0">
          {/* Preview de imagen */}
          {imagePreview && (
            <div className="mb-2 sm:mb-3 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl border-2 border-gray-200 shadow-sm"
              />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setSelectedImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600 shadow-md transition-all"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}

          {/* Input compacto */}
          <div className="relative">
            <div className="flex items-center gap-2 sm:gap-3 bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200/50 shadow-md hover:shadow-lg transition-all focus-within:border-gray-300 focus-within:shadow-xl">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 ml-2 sm:ml-3 bg-gray-50 hover:bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center cursor-pointer transition-colors"
              >
                <FontAwesomeIcon icon={faImage} className="text-gray-500 text-sm sm:text-base" />
              </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Describe tu problema o pregunta..."
                className="flex-1 px-2 sm:px-3 py-2.5 sm:py-3 text-sm sm:text-base bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
                disabled={isLoading || isSubmitting}
              />
              <button
                onClick={sendMessage}
                disabled={(!inputText.trim() && !selectedImage) || isLoading || isSubmitting}
                className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 mr-2 sm:mr-3 bg-gradient-to-r ${selectedDiscipline.gradient} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl flex items-center justify-center transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95`}
              >
                {isLoading ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
                ) : (
                  <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
                )}
              </button>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5 ml-2 sm:ml-3">
              Presiona Enter para enviar • Puedes adjuntar una foto
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

