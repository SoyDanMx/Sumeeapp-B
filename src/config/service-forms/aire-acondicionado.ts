import {
  faThermometerHalf,
  faTools,
  faInfoCircle,
  faBolt,
  faSnowflake,
  faFan,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import { ServiceConfig } from "@/components/services/ServiceFormBase";

export const AIRE_ACONDICIONADO_SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  "instalacion-de-minisplits": {
    name: "Instalación de Minisplits",
    icon: faSnowflake,
    discipline: "aire-acondicionado",
    questions: {
      action: true,
      quantity: true,
      hasMaterials: true,
      hasExistingInfrastructure: true,
      additionalInfo: true,
    },
    serviceNameMatch: "Instalación de Minisplit",
    actionOptions: [
      {
        value: "instalar",
        label: "Instalar Minisplit",
        icon: faBolt,
        description: "Nueva instalación",
        color: "from-blue-500 to-cyan-500",
      },
      {
        value: "reemplazar",
        label: "Reemplazar Minisplit",
        icon: faTools,
        description: "Cambiar equipo existente",
        color: "from-purple-500 to-pink-500",
      },
    ],
    warningMessage: "Al ser una nueva instalación, el costo puede variar según la integración de tubería de cobre, drenaje, conexiones eléctricas y soportes necesarios. El técnico evaluará en sitio y confirmará el costo final antes de iniciar el trabajo.",
  },
  "mantenimiento-preventivo": {
    name: "Mantenimiento Preventivo",
    icon: faFan,
    discipline: "aire-acondicionado",
    questions: {
      action: true,
      quantity: true,
      hasMaterials: false,
      additionalInfo: true,
    },
    serviceNameMatch: "Mantenimiento Preventivo Aire Acondicionado",
    actionOptions: [
      {
        value: "visita",
        label: "Mantenimiento",
        icon: faTools,
        description: "Limpieza y revisión",
        color: "from-green-500 to-emerald-500",
      },
    ],
  },
  "reparacion-de-compresores": {
    name: "Reparación de Compresores",
    icon: faWrench,
    discipline: "aire-acondicionado",
    questions: {
      action: true,
      quantity: false,
      hasMaterials: false,
      additionalInfo: true,
    },
    serviceNameMatch: "Reparación de Compresor",
    actionOptions: [
      {
        value: "reparar",
        label: "Reparar Compresor",
        icon: faWrench,
        description: "Solución técnica",
        color: "from-red-500 to-pink-500",
      },
      {
        value: "visita",
        label: "Diagnóstico",
        icon: faInfoCircle,
        description: "Evaluación del problema",
        color: "from-amber-500 to-orange-500",
      },
    ],
  },
  "limpieza-de-filtros": {
    name: "Limpieza de Filtros",
    icon: faFan,
    discipline: "aire-acondicionado",
    questions: {
      action: true,
      quantity: true,
      hasMaterials: false,
      additionalInfo: true,
    },
    serviceNameMatch: "Limpieza de Filtros",
    actionOptions: [
      {
        value: "visita",
        label: "Limpieza",
        icon: faTools,
        description: "Limpieza profesional",
        color: "from-green-500 to-emerald-500",
      },
    ],
  },
  "recarga-de-gas": {
    name: "Recarga de Gas",
    icon: faSnowflake,
    discipline: "aire-acondicionado",
    questions: {
      action: true,
      quantity: false,
      hasMaterials: false,
      additionalInfo: true,
    },
    serviceNameMatch: "Recarga de Gas Refrigerante",
    actionOptions: [
      {
        value: "reparar",
        label: "Recargar Gas",
        icon: faWrench,
        description: "Recarga de refrigerante",
        color: "from-blue-500 to-cyan-500",
      },
      {
        value: "visita",
        label: "Diagnóstico",
        icon: faInfoCircle,
        description: "Evaluación de fuga",
        color: "from-amber-500 to-orange-500",
      },
    ],
  },
  "instalacion-de-ductos": {
    name: "Instalación de Ductos",
    icon: faFan,
    discipline: "aire-acondicionado",
    questions: {
      action: true,
      quantity: false,
      hasMaterials: true,
      hasExistingInfrastructure: true,
      additionalInfo: true,
    },
    serviceNameMatch: "Instalación de Ductos",
    actionOptions: [
      {
        value: "instalar",
        label: "Instalar Ductos",
        icon: faBolt,
        description: "Nueva instalación",
        color: "from-blue-500 to-cyan-500",
      },
    ],
    warningMessage: "Al ser una nueva instalación, el costo puede variar según la integración de ductos, conexiones y accesorios necesarios. El técnico evaluará en sitio y confirmará el costo final antes de iniciar el trabajo.",
  },
};

