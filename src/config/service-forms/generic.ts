import {
  faPaintRoller,
  faBroom,
  faLeaf,
  faBug,
  faWifi,
  faSquare,
  faHardHat,
  faBuilding,
  faHammer,
  faBolt,
  faSun,
  faTools,
  faInfoCircle,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import { ServiceConfig } from "@/components/services/ServiceFormBase";

// Configuraciones genéricas para disciplinas que aún no tienen configuraciones específicas
export const GENERIC_SERVICE_CONFIGS: Record<string, Record<string, ServiceConfig>> = {
  pintura: {
    "pintura-interior": {
      name: "Pintura Interior",
      icon: faPaintRoller,
      discipline: "pintura",
      questions: {
        action: true,
        quantity: false,
        hasMaterials: true,
        additionalInfo: true,
      },
      serviceNameMatch: "Pintura Interior",
      actionOptions: [
        {
          value: "instalar",
          label: "Pintar Interior",
          icon: faPaintRoller,
          description: "Servicio de pintura",
          color: "from-blue-500 to-cyan-500",
        },
      ],
    },
  },
  limpieza: {
    "limpieza-residencial": {
      name: "Limpieza Residencial",
      icon: faBroom,
      discipline: "limpieza",
      questions: {
        action: true,
        quantity: false,
        hasMaterials: false,
        additionalInfo: true,
      },
      serviceNameMatch: "Limpieza Residencial Básica",
      actionOptions: [
        {
          value: "instalar",
          label: "Limpieza Residencial",
          icon: faBroom,
          description: "Servicio de limpieza",
          color: "from-green-500 to-emerald-500",
        },
      ],
    },
  },
  jardineria: {
    "poda-de-arboles": {
      name: "Poda de Árboles",
      icon: faLeaf,
      discipline: "jardineria",
      questions: {
        action: true,
        quantity: false,
        hasMaterials: false,
        additionalInfo: true,
      },
      serviceNameMatch: "Poda de Árboles",
      actionOptions: [
        {
          value: "instalar",
          label: "Poda de Árboles",
          icon: faLeaf,
          description: "Servicio de poda",
          color: "from-green-500 to-emerald-500",
        },
      ],
    },
  },
  fumigacion: {
    "fumigacion-residencial": {
      name: "Fumigación Residencial",
      icon: faBug,
      discipline: "fumigacion",
      questions: {
        action: true,
        quantity: false,
        hasMaterials: false,
        additionalInfo: true,
      },
      serviceNameMatch: "Fumigación Residencial",
      actionOptions: [
        {
          value: "instalar",
          label: "Fumigación",
          icon: faBug,
          description: "Servicio de fumigación",
          color: "from-red-500 to-pink-500",
        },
      ],
    },
  },
  wifi: {
    "instalacion-de-wifi": {
      name: "Instalación de WiFi",
      icon: faWifi,
      discipline: "wifi",
      questions: {
        action: true,
        quantity: false,
        hasMaterials: true,
        hasExistingInfrastructure: true,
        additionalInfo: true,
      },
      serviceNameMatch: "Instalación de WiFi",
      actionOptions: [
        {
          value: "instalar",
          label: "Instalar WiFi",
          icon: faBolt,
          description: "Nueva instalación",
          color: "from-blue-500 to-cyan-500",
        },
      ],
      warningMessage: "Al ser una nueva instalación, el costo puede variar según la integración de cableado, routers, puntos de acceso y accesorios necesarios. El técnico evaluará en sitio y confirmará el costo final antes de iniciar el trabajo.",
    },
  },
  tablaroca: {
    "instalacion-de-tablaroca": {
      name: "Instalación de Tablaroca",
      icon: faSquare,
      discipline: "tablaroca",
      questions: {
        action: true,
        quantity: false,
        hasMaterials: true,
        additionalInfo: true,
      },
      serviceNameMatch: "Instalación de Tablaroca",
      actionOptions: [
        {
          value: "instalar",
          label: "Instalar Tablaroca",
          icon: faBolt,
          description: "Nueva instalación",
          color: "from-blue-500 to-cyan-500",
        },
      ],
    },
  },
  construccion: {
    "construccion-residencial": {
      name: "Construcción Residencial",
      icon: faHardHat,
      discipline: "construccion",
      questions: {
        action: true,
        quantity: false,
        hasMaterials: true,
        additionalInfo: true,
      },
      serviceNameMatch: "Construcción Residencial",
      actionOptions: [
        {
          value: "instalar",
          label: "Construcción",
          icon: faHardHat,
          description: "Servicio de construcción",
          color: "from-orange-500 to-red-500",
        },
      ],
    },
  },
  carpinteria: {
    "fabricacion-de-muebles": {
      name: "Fabricación de Muebles",
      icon: faHammer,
      discipline: "carpinteria",
      questions: {
        action: true,
        quantity: false,
        hasMaterials: true,
        additionalInfo: true,
      },
      serviceNameMatch: "Fabricación de Muebles",
      actionOptions: [
        {
          value: "instalar",
          label: "Fabricar Muebles",
          icon: faHammer,
          description: "Servicio de carpintería",
          color: "from-amber-500 to-orange-500",
        },
      ],
    },
  },
  "cargadores-electricos": {
    "instalacion-cargador-nivel-1-120v": {
      name: "Instalación Cargador Nivel 1 (120V)",
      icon: faBolt,
      discipline: "cargadores-electricos",
      questions: {
        action: true,
        quantity: false,
        hasMaterials: true,
        hasExistingInfrastructure: true,
        additionalInfo: true,
      },
      serviceNameMatch: "Instalación cargador Nivel 1 (120V)",
      actionOptions: [
        {
          value: "instalar",
          label: "Instalar Cargador",
          icon: faBolt,
          description: "Nueva instalación",
          color: "from-green-500 to-emerald-500",
        },
      ],
      warningMessage: "Al ser una nueva instalación, el costo puede variar según la integración de cableado, conexiones eléctricas, interruptor dedicado y accesorios necesarios. El técnico evaluará en sitio y confirmará el costo final antes de iniciar el trabajo.",
    },
  },
  "paneles-solares": {
    "sistemas-solares-residenciales": {
      name: "Sistemas Solares Residenciales",
      icon: faSun,
      discipline: "paneles-solares",
      questions: {
        action: true,
        quantity: false,
        hasMaterials: true,
        hasExistingInfrastructure: true,
        additionalInfo: true,
      },
      serviceNameMatch: "Sistemas solares residenciales",
      actionOptions: [
        {
          value: "instalar",
          label: "Instalar Paneles Solares",
          icon: faSun,
          description: "Nueva instalación",
          color: "from-yellow-400 to-orange-500",
        },
      ],
      warningMessage: "Al ser una nueva instalación, el costo puede variar según la integración de paneles, inversores, cableado, estructura de soporte y conexión a CFE necesarios. El técnico evaluará en sitio y confirmará el costo final antes de iniciar el trabajo.",
    },
  },
};


