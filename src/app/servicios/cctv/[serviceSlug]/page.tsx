"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import ServiceFormBase, { ServiceFormData } from "@/components/services/ServiceFormBase";
import { CCTV_SERVICE_CONFIGS } from "@/config/service-forms/cctv";

export default function CCTVServicePage() {
  const router = useRouter();
  const params = useParams();
  let serviceSlug = params?.serviceSlug as string;

  const serviceConfig = CCTV_SERVICE_CONFIGS[serviceSlug];

  if (!serviceConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Servicio no encontrado</h1>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const handleContinue = (formData: ServiceFormData, priceEstimate: any) => {
    const actionText = serviceConfig.actionOptions?.find(opt => opt.value === formData.action)?.label || "Servicio";
    
    const quantityText = serviceConfig.questions.quantity && formData.quantity
      ? ` de ${formData.quantity} ${formData.quantity === 1 ? "unidad" : "unidades"}`
      : "";
    
    let materialsText = "";
    if (serviceConfig.questions.hasMaterials) {
      materialsText = formData.hasMaterials ? "Cliente proporciona los materiales." : "Necesario cotizar materiales por separado.";
    }
    
    const infrastructureText = serviceConfig.questions.hasExistingInfrastructure
      ? formData.hasExistingInfrastructure ? "Ya existe la infraestructura necesaria." : "No existe infraestructura, es una nueva instalación."
      : "";
    
    let warningText = "";
    if (serviceConfig.questions.hasExistingInfrastructure && formData.hasExistingInfrastructure === false && serviceConfig.warningMessage) {
      warningText = serviceConfig.warningMessage;
    }
    
    let descriptionParts = [
      `Me interesa: ${actionText}${quantityText} de ${serviceConfig.name.toLowerCase()}.`
    ];
    
    if (materialsText) {
      descriptionParts.push(materialsText);
    }
    
    if (infrastructureText) {
      descriptionParts.push(infrastructureText);
    }
    
    if (warningText) {
      descriptionParts.push(warningText);
    }
    
    if (formData.additionalInfo && formData.additionalInfo.trim()) {
      descriptionParts.push(`Información adicional: ${formData.additionalInfo.trim()}`);
    }
    
    if (priceEstimate) {
      descriptionParts.push(
        `Precio estimado: Mano de obra $${priceEstimate.laborPrice.toLocaleString("es-MX")}${priceEstimate.materialsPrice > 0 ? ` + Materiales $${priceEstimate.materialsPrice.toLocaleString("es-MX")}` : ""} = Total $${priceEstimate.totalPrice.toLocaleString("es-MX")}.`
      );
    }
    
    const description = descriptionParts.join(" ");

    const params = new URLSearchParams({
      service: serviceConfig.name,
      discipline: "cctv",
      description: description,
      step: "2",
    });

    router.push(`/dashboard/client?${params.toString()}`);
  };

  return <ServiceFormBase config={serviceConfig} onContinue={handleContinue} />;
}


