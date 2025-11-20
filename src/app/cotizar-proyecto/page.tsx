"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faFileAlt,
  faDollarSign,
  faUpload,
  faSpinner,
  faCheckCircle,
  faArrowLeft,
  faImages,
} from "@fortawesome/free-solid-svg-icons";
import { submitLead } from "@/lib/supabase/data";
import Link from "next/link";

const PROJECT_TYPES = [
  "Remodelación Integral",
  "Construcción desde Cero",
  "Ampliación",
  "Rehabilitación",
  "Diseño y Construcción",
  "Supervisión de Proyecto",
  "Otro",
];

const BUDGET_RANGES = [
  "$50,000 - $200,000",
  "$200,000 - $500,000",
  "$500,000 - $1,000,000",
  "$1,000,000 - $2,500,000",
  "$2,500,000+",
  "Prefiero discutirlo",
];

export default function CotizarProyectoPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tipoProyecto: "",
    descripcion: "",
    presupuesto: "",
    archivos: [] as File[],
    nombre: "",
    whatsapp: "",
    ubicacion: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Limitar a 5 archivos máximo
      const limitedFiles = files.slice(0, 5);
      setFormData((prev) => ({
        ...prev,
        archivos: [...prev.archivos, ...limitedFiles],
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      archivos: prev.archivos.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    // Validaciones por paso
    if (currentStep === 1) {
      if (!formData.tipoProyecto) {
        setError("Por favor selecciona un tipo de proyecto");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.descripcion.trim() || formData.descripcion.length < 50) {
        setError(
          "Por favor proporciona una descripción detallada (mínimo 50 caracteres)"
        );
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.presupuesto) {
        setError("Por favor selecciona un rango de presupuesto");
        return;
      }
    } else if (currentStep === 4) {
      if (!formData.nombre.trim()) {
        setError("Por favor ingresa tu nombre");
        return;
      }
      if (!formData.whatsapp.trim()) {
        setError("Por favor ingresa tu número de WhatsApp");
        return;
      }
    }

    setError("");
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      // Crear descripción completa con todos los detalles
      const descripcionCompleta = `PROYECTO GRANDE - ${formData.tipoProyecto}
      
DESCRIPCIÓN:
${formData.descripcion}

PRESUPUESTO ESTIMADO: ${formData.presupuesto}
UBICACIÓN: ${formData.ubicacion || "No especificada"}

ARCHIVOS: ${formData.archivos.length} archivo(s) adjunto(s)`;

      // Crear el lead con estado especial para proyectos grandes
      const result = await submitLead({
        servicio: "proyectos",
        ubicacion: formData.ubicacion || "No especificada",
        whatsapp: formData.whatsapp,
        nombre_cliente: formData.nombre,
        descripcion_proyecto: descripcionCompleta, // Descripción detallada del proyecto
      });

      if (result.success && result.leadId) {
        setSubmittedLeadId(result.leadId);
        setSuccess(true);

        // TODO: Aquí se podría implementar la subida de archivos a Supabase Storage
        // Por ahora, el lead se crea sin archivos
        // Los archivos podrían subirse a: projects/${result.leadId}/planos/

        // Redirigir a WhatsApp después de 2 segundos
        setTimeout(() => {
          const whatsappPhone = "525636741156"; // Número de soporte de Sumee App
          // @ts-ignore - Supabase type inference issue
          const leadIdStr = String(result.leadId || '');
          const message = encodeURIComponent(
            `Hola, acabo de solicitar una cotización para mi proyecto: ${formData.tipoProyecto}. ` +
              `Presupuesto estimado: ${formData.presupuesto}. ` +
              `Mi solicitud ID: ${leadIdStr.substring(0, 8)}`
          );
          const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${message}`;
          window.open(whatsappUrl, "_blank");
        }, 2000);
      } else {
        throw new Error("No se recibió el ID del lead creado");
      }
    } catch (error: any) {
      console.error("Error al cotizar proyecto:", error);
      setError(
        error.message ||
          "Error al enviar tu cotización. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paso 1: Tipo de Proyecto
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tipo de Proyecto *
        </label>
        <select
          name="tipoProyecto"
          value={formData.tipoProyecto}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Selecciona un tipo de proyecto</option>
          {PROJECT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // Paso 2: Descripción Detallada
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Descripción Detallada del Proyecto *
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleInputChange}
          rows={8}
          placeholder="Describe tu proyecto en detalle: dimensiones, necesidades específicas, materiales deseados, estilo arquitectónico, fechas importantes, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Mínimo 50 caracteres. Mientras más detalles proporciones, mejor
          podremos cotizar tu proyecto.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Caracteres: {formData.descripcion.length}
        </p>
      </div>
    </div>
  );

  // Paso 3: Presupuesto Estimado
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Presupuesto Estimado *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BUDGET_RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, presupuesto: range }))
              }
              className={`px-4 py-3 border-2 rounded-lg text-left transition-all ${
                formData.presupuesto === range
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                  : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Paso 4: Archivos (Planos/Fotos)
  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Archivos Adjuntos (Planos, Fotos, etc.)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*,.pdf,.dwg,.dxf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <FontAwesomeIcon
              icon={faUpload}
              className="text-4xl text-gray-400 mb-3"
            />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Haz clic para subir archivos
            </p>
            <p className="text-xs text-gray-500">
              Formatos: JPG, PNG, PDF, DWG, DXF (máximo 5 archivos)
            </p>
          </label>
        </div>

        {/* Lista de archivos seleccionados */}
        {formData.archivos.length > 0 && (
          <div className="mt-4 space-y-2">
            {formData.archivos.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faFileAlt} className="text-blue-500" />
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="rotate-45" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Paso 5: Información de Contacto
  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nombre Completo *
        </label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleInputChange}
          placeholder="Juan Pérez"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Número de WhatsApp *
        </label>
        <input
          type="tel"
          name="whatsapp"
          value={formData.whatsapp}
          onChange={handleInputChange}
          placeholder="5512345678"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ubicación del Proyecto
        </label>
        <input
          type="text"
          name="ubicacion"
          value={formData.ubicacion}
          onChange={handleInputChange}
          placeholder="Colonia, Delegación/Alcaldía, CDMX"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const steps = [
    { title: "Tipo de Proyecto", icon: faBuilding },
    { title: "Descripción", icon: faFileAlt },
    { title: "Presupuesto", icon: faDollarSign },
    { title: "Archivos", icon: faImages },
    { title: "Contacto", icon: faFileAlt },
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-5xl text-green-600"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Cotización Enviada!
          </h2>
          <p className="text-gray-600 mb-6">
            Hemos recibido tu solicitud de cotización. Nuestro equipo se pondrá
            en contacto contigo en menos de 24 horas para discutir los detalles
            de tu proyecto.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            ID de solicitud:{" "}
            <span className="font-mono font-semibold">
              {submittedLeadId?.substring(0, 8)}
            </span>
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/servicios/proyectos"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Volver
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Cotizar mi Proyecto
          </h1>
          <p className="text-gray-600">
            Completa el siguiente formulario para recibir una cotización
            personalizada
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 flex items-center ${
                  index < steps.length - 1 ? "mr-2" : ""
                }`}
              >
                <div
                  className={`flex-1 h-2 rounded-full ${
                    index + 1 <= currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col items-center ${
                  index + 1 <= currentStep ? "text-blue-600 font-semibold" : ""
                }`}
              >
                <FontAwesomeIcon
                  icon={step.icon}
                  className={`mb-1 ${
                    index + 1 === currentStep ? "text-lg" : "text-sm"
                  }`}
                />
                <span className="hidden md:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Step Content */}
          <div className="mb-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Anterior
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin mr-2"
                    />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                    Enviar Cotización
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
