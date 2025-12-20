import {
  faVideo,
  faTools,
  faInfoCircle,
  faBolt,
  faShieldAlt,
  faLock,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { ServiceConfig } from "@/components/services/ServiceFormBase";

export const CCTV_SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  "instalacion-de-camaras": {
    name: "Instalación de Cámaras",
    icon: faVideo,
    discipline: "cctv",
    questions: {
      action: true,
      quantity: true,
      hasMaterials: true,
      hasExistingInfrastructure: true,
      additionalInfo: true,
    },
    serviceNameMatch: "Instalación de Cámara CCTV",
    actionOptions: [
      {
        value: "instalar",
        label: "Instalar Cámaras",
        icon: faBolt,
        description: "Nueva instalación",
        color: "from-blue-500 to-cyan-500",
      },
      {
        value: "reemplazar",
        label: "Reemplazar Cámaras",
        icon: faTools,
        description: "Cambiar cámaras existentes",
        color: "from-purple-500 to-pink-500",
      },
    ],
    warningMessage: "Al ser una nueva instalación, el costo puede variar según la integración de cableado, conectores, fuente de alimentación y accesorios necesarios. El técnico evaluará en sitio y confirmará el costo final antes de iniciar el trabajo.",
  },
  "sistemas-de-alarma": {
    name: "Sistemas de Alarma",
    icon: faShieldAlt,
    discipline: "cctv",
    questions: {
      action: true,
      quantity: false,
      hasMaterials: true,
      hasExistingInfrastructure: true,
      additionalInfo: true,
    },
    serviceNameMatch: "Instalación de Sistema de Alarma",
    actionOptions: [
      {
        value: "instalar",
        label: "Instalar Alarma",
        icon: faBolt,
        description: "Nueva instalación",
        color: "from-blue-500 to-cyan-500",
      },
      {
        value: "reemplazar",
        label: "Reemplazar Alarma",
        icon: faTools,
        description: "Cambiar sistema existente",
        color: "from-purple-500 to-pink-500",
      },
    ],
    warningMessage: "Al ser una nueva instalación, el costo puede variar según la integración de sensores, panel de control, cableado y accesorios necesarios. El técnico evaluará en sitio y confirmará el costo final antes de iniciar el trabajo.",
  },
  "monitoreo-24-7": {
    name: "Monitoreo 24/7",
    icon: faEye,
    discipline: "cctv",
    questions: {
      action: true,
      quantity: false,
      hasMaterials: false,
      additionalInfo: true,
    },
    serviceNameMatch: "Monitoreo 24/7",
    actionOptions: [
      {
        value: "instalar",
        label: "Contratar Monitoreo",
        icon: faBolt,
        description: "Servicio de monitoreo",
        color: "from-blue-500 to-cyan-500",
      },
    ],
  },
  "control-de-acceso": {
    name: "Control de Acceso",
    icon: faLock,
    discipline: "cctv",
    questions: {
      action: true,
      quantity: true,
      hasMaterials: true,
      hasExistingInfrastructure: true,
      additionalInfo: true,
    },
    serviceNameMatch: "Instalación de Control de Acceso",
    actionOptions: [
      {
        value: "instalar",
        label: "Instalar Control de Acceso",
        icon: faBolt,
        description: "Nueva instalación",
        color: "from-blue-500 to-cyan-500",
      },
    ],
    warningMessage: "Al ser una nueva instalación, el costo puede variar según la integración de lectores, controladores, cableado y accesorios necesarios. El técnico evaluará en sitio y confirmará el costo final antes de iniciar el trabajo.",
  },
  "dvr-y-nvr": {
    name: "DVR y NVR",
    icon: faVideo,
    discipline: "cctv",
    questions: {
      action: true,
      quantity: false,
      hasMaterials: true,
      hasExistingInfrastructure: true,
      additionalInfo: true,
    },
    serviceNameMatch: "Instalación de DVR/NVR",
    actionOptions: [
      {
        value: "instalar",
        label: "Instalar DVR/NVR",
        icon: faBolt,
        description: "Nueva instalación",
        color: "from-blue-500 to-cyan-500",
      },
      {
        value: "reemplazar",
        label: "Reemplazar DVR/NVR",
        icon: faTools,
        description: "Cambiar equipo existente",
        color: "from-purple-500 to-pink-500",
      },
    ],
  },
  "vigilancia-remota": {
    name: "Vigilancia Remota",
    icon: faEye,
    discipline: "cctv",
    questions: {
      action: true,
      quantity: false,
      hasMaterials: false,
      additionalInfo: true,
    },
    serviceNameMatch: "Configuración de Vigilancia Remota",
    actionOptions: [
      {
        value: "instalar",
        label: "Configurar Vigilancia Remota",
        icon: faBolt,
        description: "Configuración de acceso remoto",
        color: "from-blue-500 to-cyan-500",
      },
    ],
  },
};


