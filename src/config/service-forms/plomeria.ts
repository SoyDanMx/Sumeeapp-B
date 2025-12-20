import {
  faWrench,
  faTools,
  faInfoCircle,
  faBolt,
  faTint,
  faWater,
  faShower,
  faFaucet,
} from "@fortawesome/free-solid-svg-icons";
import { ServiceConfig } from "@/components/services/ServiceFormBase";

export const PLOMERIA_SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  "reparacion-de-fugas": {
    name: "Reparación de Fugas",
    icon: faTint,
    discipline: "plomeria",
    questions: {
      action: true,
      quantity: true,
      hasMaterials: true,
      additionalInfo: true,
    },
    serviceNameMatch: "Reparación de Fuga de Agua",
    actionOptions: [
      {
        value: "reparar",
        label: "Reparar Fuga",
        icon: faWrench,
        description: "Solución inmediata",
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
  "instalacion-de-tinacos": {
    name: "Instalación de Tinacos",
    icon: faWater,
    discipline: "plomeria",
    questions: {
      action: true,
      quantity: true,
      hasMaterials: true,
      hasExistingInfrastructure: true,
      additionalInfo: true,
    },
    serviceNameMatch: "Instalación de Tinaco",
    actionOptions: [
      {
        value: "instalar",
        label: "Instalar Tinaco",
        icon: faBolt,
        description: "Nueva instalación",
        color: "from-blue-500 to-cyan-500",
      },
      {
        value: "reemplazar",
        label: "Reemplazar Tinaco",
        icon: faTools,
        description: "Cambiar tinaco existente",
        color: "from-purple-500 to-pink-500",
      },
    ],
    warningMessage: "Al ser una nueva instalación, el costo puede variar según la integración de tubería, conexiones y accesorios necesarios. El técnico evaluará en sitio y confirmará el costo final antes de iniciar el trabajo.",
  },
  "desazolve-de-drenajes": {
    name: "Desazolve de Drenajes",
    icon: faShower,
    discipline: "plomeria",
    questions: {
      action: true,
      quantity: false,
      hasMaterials: false,
      additionalInfo: true,
    },
    serviceNameMatch: "Desazolve de Drenaje",
    actionOptions: [
      {
        value: "reparar",
        label: "Desazolve",
        icon: faWrench,
        description: "Limpieza y desazolve",
        color: "from-red-500 to-pink-500",
      },
      {
        value: "visita",
        label: "Inspección",
        icon: faInfoCircle,
        description: "Evaluación del drenaje",
        color: "from-amber-500 to-orange-500",
      },
    ],
  },
  "instalacion-de-calentadores": {
    name: "Instalación de Calentadores",
    icon: faFaucet,
    discipline: "plomeria",
    questions: {
      action: true,
      quantity: true,
      hasMaterials: true,
      hasExistingInfrastructure: true,
      additionalInfo: true,
    },
    serviceNameMatch: "Instalación de Calentador",
    actionOptions: [
      {
        value: "instalar",
        label: "Instalar Calentador",
        icon: faBolt,
        description: "Nueva instalación",
        color: "from-blue-500 to-cyan-500",
      },
      {
        value: "reemplazar",
        label: "Reemplazar Calentador",
        icon: faTools,
        description: "Cambiar calentador existente",
        color: "from-purple-500 to-pink-500",
      },
    ],
    warningMessage: "Al ser una nueva instalación, el costo puede variar según la integración de tubería, conexiones de gas/eléctricas y accesorios necesarios. El técnico evaluará en sitio y confirmará el costo final antes de iniciar el trabajo.",
  },
  "reparacion-de-llaves": {
    name: "Reparación de Llaves",
    icon: faFaucet,
    discipline: "plomeria",
    questions: {
      action: true,
      quantity: true,
      hasMaterials: true,
      additionalInfo: true,
    },
    serviceNameMatch: "Reparación de Llave",
    actionOptions: [
      {
        value: "reparar",
        label: "Reparar Llave",
        icon: faWrench,
        description: "Solución inmediata",
        color: "from-red-500 to-pink-500",
      },
      {
        value: "reemplazar",
        label: "Reemplazar Llave",
        icon: faTools,
        description: "Cambiar llave completa",
        color: "from-purple-500 to-pink-500",
      },
    ],
  },
  "instalacion-de-sanitarios": {
    name: "Instalación de Sanitarios",
    icon: faShower,
    discipline: "plomeria",
    questions: {
      action: true,
      quantity: true,
      hasMaterials: true,
      hasExistingInfrastructure: true,
      additionalInfo: true,
    },
    serviceNameMatch: "Instalación de Sanitario",
    actionOptions: [
      {
        value: "instalar",
        label: "Instalar Sanitario",
        icon: faBolt,
        description: "Nueva instalación",
        color: "from-blue-500 to-cyan-500",
      },
      {
        value: "reemplazar",
        label: "Reemplazar Sanitario",
        icon: faTools,
        description: "Cambiar sanitario existente",
        color: "from-purple-500 to-pink-500",
      },
    ],
    warningMessage: "Al ser una nueva instalación, el costo puede variar según la integración de tubería, conexiones y accesorios necesarios. El técnico evaluará en sitio y confirmará el costo final antes de iniciar el trabajo.",
  },
};


