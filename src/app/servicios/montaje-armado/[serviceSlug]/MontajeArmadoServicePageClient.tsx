"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ServiceFormBase, { ServiceFormData } from "@/components/services/ServiceFormBase";
import { faTools, faTv, faCouch, faHammer, faImage, faWindowMaximize } from "@fortawesome/free-solid-svg-icons";

interface MontajeArmadoServicePageClientProps {
  serviceSlug: string;
  serviceName: string;
  serviceData: any;
}

// Configuración compacta de servicios
const SERVICE_CONFIGS: Record<string, any> = {
  "montar-tv-pared": {
    name: "Montar TV en Pared",
    icon: faTv,
    questions: { action: true, quantity: false, hasMaterials: true, additionalInfo: true },
    actionOptions: [
      { value: "instalar", label: "Montar TV", icon: faTv, description: "Instalación profesional", color: "from-blue-500 to-cyan-500" },
    ],
  },
  "armar-mueble-ikea-estandar": {
    name: "Armar Muebles IKEA",
    icon: faCouch,
    questions: { action: true, quantity: true, hasMaterials: true, additionalInfo: true },
    actionOptions: [
      { value: "instalar", label: "Armar Mueble", icon: faCouch, description: "Armado completo", color: "from-purple-500 to-pink-500" },
    ],
  },
  "montar-estantes": {
    name: "Montar Estantes",
    icon: faHammer,
    questions: { action: true, quantity: true, hasMaterials: true, additionalInfo: true },
    actionOptions: [
      { value: "instalar", label: "Montar Estantes", icon: faHammer, description: "Instalación en pared", color: "from-amber-500 to-orange-500" },
    ],
  },
  "colgar-cuadros-hasta-3": {
    name: "Colgar Cuadros",
    icon: faImage,
    questions: { action: true, quantity: true, hasMaterials: true, additionalInfo: true },
    actionOptions: [
      { value: "instalar", label: "Colgar Cuadros", icon: faImage, description: "Colgado profesional", color: "from-pink-500 to-rose-500" },
    ],
  },
  "instalar-cortinas-hasta-3": {
    name: "Instalar Cortinas",
    icon: faWindowMaximize,
    questions: { action: true, quantity: true, hasMaterials: true, additionalInfo: true },
    actionOptions: [
      { value: "instalar", label: "Instalar Cortinas", icon: faWindowMaximize, description: "Instalación completa", color: "from-indigo-500 to-purple-500" },
    ],
  },
};

export default function MontajeArmadoServicePageClient({ serviceSlug, serviceName, serviceData }: MontajeArmadoServicePageClientProps) {
  const router = useRouter();
  const serviceConfig = SERVICE_CONFIGS[serviceSlug] || {
    name: serviceName,
    icon: faTools,
    questions: { action: true, quantity: false, hasMaterials: true, additionalInfo: true },
    actionOptions: [
      { value: "instalar", label: "Servicio de Montaje", icon: faTools, description: "Instalación profesional", color: "from-gray-500 to-gray-600" },
    ],
  };

  const handleContinue = (formData: ServiceFormData, priceEstimate: any) => {
    const actionText = serviceConfig.actionOptions?.find((opt: any) => opt.value === formData.action)?.label || "Servicio";
    const quantityText = serviceConfig.questions.quantity && formData.quantity ? ` de ${formData.quantity} ${formData.quantity === 1 ? "unidad" : "unidades"}` : "";
    const materialsText = serviceConfig.questions.hasMaterials
      ? formData.hasMaterials ? "Cliente proporciona los materiales." : "Necesario cotizar materiales por separado."
      : "";
    const priceText = priceEstimate ? `Precio estimado: $${priceEstimate.totalPrice.toLocaleString("es-MX")} MXN.` : "";
    const description = `${actionText}${quantityText} de ${serviceConfig.name.toLowerCase()}. ${materialsText} ${formData.additionalInfo ? `Información adicional: ${formData.additionalInfo}.` : ""} ${priceText}`.trim();

    const params = new URLSearchParams({
      service: serviceConfig.name,
      discipline: "montaje-armado",
      description,
      step: "2",
    });

    router.push(`/dashboard/client?${params.toString()}`);
  };

  return (
    <ServiceFormBase
      config={{
        ...serviceConfig,
        discipline: "montaje-armado",
        serviceNameMatch: serviceName,
      }}
      onContinue={handleContinue}
    />
  );
}

