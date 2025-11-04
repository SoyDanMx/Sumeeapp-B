"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPaperPlane,
  faSpinner,
  faRobot,
  faCheckCircle,
  faDollarSign,
  faArrowRight,
  faExclamationTriangle,
  faWrench,
  faQuestionCircle,
  faShieldAlt,
  faImage,
  faVolumeUp,
  faVolumeMute,
  faX,
} from "@fortawesome/free-solid-svg-icons";

interface AIResponse {
  service_id: string;
  service_name: string;
  diagnosis_summary: string;
  cost_estimate_range: string;
  next_step_cta: string;
  technical_diagnosis?: {
    diagnosis: string;
    questions: string[];
    solutions: string[];
    warnings: string[];
    costEstimate: string;
    professionalType: string;
  };
}

interface AIDiagnosisChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIDiagnosisChatbot: React.FC<AIDiagnosisChatbotProps> = ({
  isOpen,
  onClose,
}) => {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false); // Desactivado por defecto

  // Función para convertir texto a voz (voz de mujer)
  const speakText = (text: string) => {
    if (!isVoiceEnabled) return;

    // Detener cualquier audio anterior
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Configurar voz de mujer en español
    const voices = window.speechSynthesis.getVoices();
    const womanVoice =
      voices.find(
        (voice) =>
          voice.lang.includes("es") &&
          (voice.name.toLowerCase().includes("female") ||
            voice.name.toLowerCase().includes("mujer") ||
            voice.name.toLowerCase().includes("zira") ||
            voice.name.toLowerCase().includes("helena"))
      ) ||
      voices.find((voice) => voice.lang.includes("es-ES")) ||
      voices[0];

    utterance.voice = womanVoice;
    utterance.lang = "es-MX";
    utterance.rate = 0.95; // Velocidad natural
    utterance.pitch = 1.1; // Tono ligeramente más alto (más femenino)
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Cargar voces cuando estén disponibles
  React.useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Manejar selección de imagen
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        setError("Por favor selecciona una imagen válida");
        return;
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("La imagen no debe exceder 10MB");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Convertir imagen a base64
  const imageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Función mejorada para llamar al API real con soporte de imágenes
  const callAIAssistant = async (
    description: string,
    imageBase64?: string
  ): Promise<AIResponse> => {
    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: description,
          image: imageBase64, // Enviar imagen si existe
        }),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await response.json();

      // Convertir respuesta del API a formato del chatbot
      return {
        service_id:
          data.service_category.replace(/\s+/g, "_").toUpperCase() + "_001",
        service_name: data.technical_info.title,
        diagnosis_summary: data.technical_diagnosis.diagnosis,
        cost_estimate_range: data.technical_diagnosis.costEstimate,
        next_step_cta: `Ver ${data.technical_diagnosis.professionalType}s Verificados`,
        technical_diagnosis: data.technical_diagnosis,
      };
    } catch (error) {
      console.error("Error calling AI assistant:", error);
      // Fallback a respuesta básica si falla el API
      return {
        service_id: "GENERAL_001",
        service_name: "Servicio General de Mantenimiento",
        diagnosis_summary:
          "Requiere evaluación técnica presencial para determinar el alcance exacto del problema y solución más adecuada.",
        cost_estimate_range:
          "$300 MXN - $1,000 MXN (Consulta inicial y evaluación)",
        next_step_cta: "Ver Técnicos Verificados para este Servicio",
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() && !selectedImage) {
      setError("Por favor describe tu problema o sube una imagen");
      return;
    }

    setLoading(true);
    setResponse(null);
    setError("");

    try {
      let imageBase64: string | undefined;
      if (selectedImage) {
        imageBase64 = await imageToBase64(selectedImage);
      }

      const aiResponse = await callAIAssistant(
        userInput.trim() ||
          "Analiza esta imagen y dime qué problema técnico tiene",
        imageBase64
      );

      setResponse(aiResponse);

      // Voz desactivada - solo texto
      // if (isVoiceEnabled && aiResponse.diagnosis_summary) {
      //   speakText(aiResponse.diagnosis_summary);
      // }

      // Limpiar imagen después de enviar
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err) {
      setError("Error al procesar tu consulta. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUserInput("");
    setResponse(null);
    setError("");
    setSelectedImage(null);
    setImagePreview(null);
    window.speechSynthesis.cancel(); // Detener cualquier audio
    setIsSpeaking(false);
    onClose();
  };

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faRobot} className="text-2xl" />
            <div>
              <h2 className="text-xl font-bold">SumeeBot</h2>
              <p className="text-blue-100 text-sm">
                Asistente de Diagnóstico IA con Visión
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Botón de voz - oculto/deshabilitado */}
            {/* <button
              onClick={toggleVoice}
              className={`p-2 rounded-lg transition-colors ${
                isVoiceEnabled 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : 'bg-white/10 hover:bg-white/20 opacity-50'
              }`}
              title={isVoiceEnabled ? 'Desactivar voz' : 'Activar voz'}
            >
              <FontAwesomeIcon 
                icon={isVoiceEnabled ? faVolumeUp : faVolumeMute} 
                className="text-lg" 
              />
            </button> */}
            <button
              onClick={handleClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Bot Message */}
          <div className="mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon
                  icon={faRobot}
                  className="text-blue-600 text-sm"
                />
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-w-[80%]">
                <p className="text-gray-800">
                  ¡Hola! Soy SumeeBot. Para ayudarte a encontrar al mejor
                  profesional, cuéntame:
                  <strong> ¿Cuál es exactamente el problema?</strong>
                </p>
                <p className="text-sm text-gray-600 mt-2 italic">
                  Ej: 'Mi lavabo gotea mucho' o 'La luz de la cocina parpadea'
                </p>
              </div>
            </div>
          </div>

          {/* Vista previa de imagen */}
          {imagePreview && (
            <div className="mb-4 relative inline-block">
              <div className="relative rounded-lg overflow-hidden border-2 border-blue-200 shadow-md">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="max-w-xs max-h-48 object-contain"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  type="button"
                >
                  <FontAwesomeIcon icon={faX} className="text-xs" />
                </button>
              </div>
            </div>
          )}

          {/* User Input Form */}
          {!response && (
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500">
                {/* Botón para subir imagen */}
                <label className="cursor-pointer p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
                  <FontAwesomeIcon icon={faImage} className="text-lg" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={loading}
                  />
                </label>

                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={
                    selectedImage
                      ? "Describe el problema o deja que la IA analice la imagen..."
                      : "Describe tu problema aquí..."
                  }
                  className="flex-1 border-none focus:ring-0 text-gray-800 placeholder-gray-500"
                  disabled={loading}
                />

                <button
                  type="submit"
                  disabled={loading || (!userInput.trim() && !selectedImage)}
                  className="bg-blue-600 text-white rounded-md p-2 ml-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors hover:bg-blue-700"
                >
                  {loading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <FontAwesomeIcon icon={faPaperPlane} />
                  )}
                </button>
              </div>
              {selectedImage && (
                <p className="text-xs text-gray-500 mt-2">
                  📸 Imagen seleccionada. La IA analizará la imagen
                  automáticamente.
                </p>
              )}
            </form>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    className="text-blue-600 text-sm"
                  />
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-w-[80%]">
                  <p className="text-gray-800">
                    Analizando tu problema y buscando la mejor solución...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* AI Response */}
          {response && (
            <div className="space-y-4">
              {/* Bot Response Mejorado */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-white text-sm"
                  />
                </div>
                <div className="bg-white border-2 border-blue-100 rounded-xl p-5 max-w-[85%] shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {response.service_name}
                    </h3>
                    {/* Botón de voz deshabilitado - solo texto */}
                    {/* {isVoiceEnabled && !isSpeaking && (
                      <button
                        onClick={() => speakText(response.diagnosis_summary)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Escuchar respuesta"
                      >
                        <FontAwesomeIcon icon={faVolumeUp} className="text-sm" />
                      </button>
                    )}
                    {isSpeaking && (
                      <div className="p-2 text-blue-600">
                        <FontAwesomeIcon icon={faVolumeUp} className="text-sm animate-pulse" />
                      </div>
                    )} */}
                  </div>

                  {/* Diagnóstico mejorado con formato */}
                  <div className="prose prose-sm max-w-none mb-4">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {response.diagnosis_summary}
                    </div>
                  </div>

                  {/* Información de Costo Mejorada */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon
                        icon={faDollarSign}
                        className="text-green-600 text-lg"
                      />
                      <span className="font-bold text-green-800 text-base">
                        💵 Inversión Estimada:
                      </span>
                    </div>
                    <p className="text-green-700 font-semibold text-base leading-relaxed whitespace-pre-line">
                      {response.cost_estimate_range}
                    </p>
                    <p className="text-green-600 text-xs mt-2">
                      💡 La tarifa de revisión es deducible del servicio final
                    </p>
                  </div>
                </div>
              </div>

              {/* Información Técnica Detallada */}
              {response.technical_diagnosis && (
                <div className="space-y-4">
                  {/* Preguntas de Diagnóstico */}
                  {response.technical_diagnosis.questions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <FontAwesomeIcon
                          icon={faQuestionCircle}
                          className="text-blue-600"
                        />
                        <span className="font-semibold text-blue-800">
                          Preguntas de Diagnóstico:
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {response.technical_diagnosis.questions.map(
                          (question, index) => (
                            <li
                              key={index}
                              className="text-blue-700 text-sm flex items-start space-x-2"
                            >
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{question}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Soluciones Técnicas */}
                  {response.technical_diagnosis.solutions.length > 0 && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <FontAwesomeIcon
                          icon={faWrench}
                          className="text-indigo-600"
                        />
                        <span className="font-semibold text-indigo-800">
                          Soluciones Técnicas:
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {response.technical_diagnosis.solutions.map(
                          (solution, index) => (
                            <li
                              key={index}
                              className="text-indigo-700 text-sm flex items-start space-x-2"
                            >
                              <span className="text-indigo-500 mt-1">•</span>
                              <span>{solution}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Advertencias de Seguridad */}
                  {response.technical_diagnosis.warnings.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <FontAwesomeIcon
                          icon={faExclamationTriangle}
                          className="text-red-600"
                        />
                        <span className="font-semibold text-red-800">
                          ⚠️ Advertencias de Seguridad:
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {response.technical_diagnosis.warnings.map(
                          (warning, index) => (
                            <li
                              key={index}
                              className="text-red-700 text-sm flex items-start space-x-2"
                            >
                              <span className="text-red-500 mt-1">•</span>
                              <span className="font-medium">{warning}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Tipo de Profesional Requerido */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FontAwesomeIcon
                        icon={faShieldAlt}
                        className="text-gray-600"
                      />
                      <span className="font-semibold text-gray-800">
                        Profesional Recomendado:
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      {response.technical_diagnosis.professionalType}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Mejorado con CTA más convincente */}
        {response && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-5 border-t border-gray-200">
            <div className="mb-4 p-4 bg-white rounded-xl border-2 border-blue-200 shadow-sm">
              <div className="flex items-start space-x-3">
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="text-blue-600 text-xl mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">
                    ✅ Garantía de Calidad Sumee
                  </h4>
                  <p className="text-sm text-gray-600">
                    Conecta con técnicos verificados y certificados. Todos
                    nuestros profesionales están asegurados y ofrecen garantía
                    en sus trabajos.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                // Navegar al flujo de contratación o página de técnicos
                window.location.href = `/servicios?service_id=${response.service_id}`;
              }}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 hover:scale-[1.02]"
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>{response.next_step_cta}</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </button>

            <p className="text-center text-xs text-gray-500 mt-3">
              ⚡ Respuesta garantizada en menos de 2 horas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
