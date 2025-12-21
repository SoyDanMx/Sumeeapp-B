/**
 * Estructura jerárquica de categorías para filtros
 * Formato: categoria > rama > subrama
 * Ejemplo: sistemas > videovigilancia > camaras
 */

export interface HierarchyLevel3 {
  id: string;
  name: string;
  keywords: string[];
}

export interface HierarchyLevel2 {
  id: string;
  name: string;
  subramas: HierarchyLevel3[];
  keywords: string[];
}

export interface HierarchyLevel1 {
  id: string;
  name: string;
  ramas: HierarchyLevel2[];
}

// Estructura jerárquica para categoría "sistemas"
export const SISTEMAS_HIERARCHY: HierarchyLevel1 = {
  id: "sistemas",
  name: "Sistemas",
  ramas: [
    {
      id: "videovigilancia",
      name: "Videovigilancia",
      keywords: ["cámara", "cctv", "dvr", "nvr", "videovigilancia", "seguridad", "ip camera", "cámara ip", "grabador", "monitor"],
      subramas: [
        {
          id: "camaras",
          name: "Cámaras",
          keywords: ["cámara", "camera", "ip camera", "cámara ip", "cámara cctv", "cámara seguridad", "hikvision", "dahua", "axis", "vivotek"],
        },
        {
          id: "grabadores",
          name: "Grabadores",
          keywords: ["dvr", "nvr", "grabador", "recorder", "dvr cctv", "nvr ip", "grabador digital"],
        },
        {
          id: "monitores",
          name: "Monitores",
          keywords: ["monitor", "pantalla", "display", "monitor cctv", "monitor seguridad"],
        },
        {
          id: "accesorios-video",
          name: "Accesorios de Video",
          keywords: ["cable", "conector", "fuente", "lente", "carcasa", "soporte", "cable utp", "conector bnc"],
        },
      ],
    },
    {
      id: "redes",
      name: "Redes e Infraestructura",
      keywords: ["router", "switch", "access point", "red", "networking", "wifi", "ethernet", "cable utp", "patch panel", "rack"],
      subramas: [
        {
          id: "switches",
          name: "Switches",
          keywords: ["switch", "switches", "switch ethernet", "switch poe", "switch managed", "switch unmanaged"],
        },
        {
          id: "routers",
          name: "Routers",
          keywords: ["router", "routers", "router wifi", "router inalámbrico", "router cisco", "router tp-link"],
        },
        {
          id: "access-points",
          name: "Access Points",
          keywords: ["access point", "ap", "wifi", "wireless", "access point wifi", "ap inalámbrico"],
        },
        {
          id: "cableado",
          name: "Cableado",
          keywords: ["cable utp", "cable ethernet", "cable cat5", "cable cat6", "patch panel", "rack", "conector rj45"],
        },
      ],
    },
    {
      id: "energia",
      name: "Energía",
      keywords: ["energía", "energia", "solar", "fotovoltaico", "panel solar", "inversor", "batería", "ups"],
      subramas: [
        {
          id: "paneles-solares",
          name: "Paneles Solares",
          keywords: ["panel solar", "solar panel", "fotovoltaico", "pv", "módulo solar", "panel fotovoltaico"],
        },
        {
          id: "inversores",
          name: "Inversores",
          keywords: ["inversor", "inverter", "inversor solar", "inversor fotovoltaico", "microinversor"],
        },
        {
          id: "baterias",
          name: "Baterías",
          keywords: ["batería", "bateria", "battery", "batería solar", "batería litio", "batería plomo"],
        },
        {
          id: "ups",
          name: "UPS y Reguladores",
          keywords: ["ups", "regulador", "protector", "no break", "regulador de voltaje", "protector de sobretensión"],
        },
      ],
    },
    {
      id: "climatizacion",
      name: "Climatización",
      keywords: ["minisplit", "mini split", "aire acondicionado", "climatización", "aufit", "inverter", "seer", "btu", "r32", "r410"],
      subramas: [
        {
          id: "minisplits",
          name: "Minisplits",
          keywords: ["minisplit", "mini split", "split", "aire acondicionado", "ac", "inverter", "aufit"],
        },
        {
          id: "accesorios-clima",
          name: "Accesorios de Climatización",
          keywords: ["instalación", "tubería", "cobre", "aislamiento", "drenaje", "soporte"],
        },
      ],
    },
    {
      id: "computo",
      name: "Equipos de Cómputo",
      keywords: ["computadora", "laptop", "servidor", "workstation", "pc", "notebook", "desktop"],
      subramas: [
        {
          id: "laptops",
          name: "Laptops",
          keywords: ["laptop", "notebook", "portátil", "computadora portátil"],
        },
        {
          id: "servidores",
          name: "Servidores",
          keywords: ["servidor", "server", "rack server", "torre server"],
        },
        {
          id: "workstations",
          name: "Workstations",
          keywords: ["workstation", "estación de trabajo", "estacion de trabajo"],
        },
      ],
    },
    {
      id: "almacenamiento",
      name: "Almacenamiento",
      keywords: ["disco duro", "hdd", "ssd", "nas", "storage", "almacenamiento", "raid", "backup"],
      subramas: [
        {
          id: "discos-duros",
          name: "Discos Duros",
          keywords: ["disco duro", "hdd", "hard drive", "disco interno", "disco externo"],
        },
        {
          id: "ssd",
          name: "SSD",
          keywords: ["ssd", "solid state", "disco sólido", "nvme", "m.2"],
        },
        {
          id: "nas",
          name: "NAS",
          keywords: ["nas", "network attached storage", "almacenamiento en red"],
        },
      ],
    },
  ],
};

/**
 * Obtiene la estructura jerárquica por categoría
 */
export function getHierarchyByCategory(categoryId: string): HierarchyLevel1 | null {
  if (categoryId === "sistemas") {
    return SISTEMAS_HIERARCHY;
  }
  return null;
}

/**
 * Obtiene una rama por ID
 */
export function getRamaById(categoryId: string, ramaId: string): HierarchyLevel2 | null {
  const hierarchy = getHierarchyByCategory(categoryId);
  if (!hierarchy) return null;
  return hierarchy.ramas.find((r) => r.id === ramaId) || null;
}

/**
 * Obtiene una subrama por ID
 */
export function getSubramaById(categoryId: string, ramaId: string, subramaId: string): HierarchyLevel3 | null {
  const rama = getRamaById(categoryId, ramaId);
  if (!rama) return null;
  return rama.subramas.find((sr) => sr.id === subramaId) || null;
}

/**
 * Genera breadcrumb path
 */
export function getBreadcrumbPath(categoryId: string, ramaId?: string, subramaId?: string): Array<{ id: string; name: string }> {
  const path: Array<{ id: string; name: string }> = [];
  
  const hierarchy = getHierarchyByCategory(categoryId);
  if (!hierarchy) return path;
  
  path.push({ id: categoryId, name: hierarchy.name });
  
  if (ramaId) {
    const rama = getRamaById(categoryId, ramaId);
    if (rama) {
      path.push({ id: ramaId, name: rama.name });
      
      if (subramaId) {
        const subrama = getSubramaById(categoryId, ramaId, subramaId);
        if (subrama) {
          path.push({ id: subramaId, name: subrama.name });
        }
      }
    }
  }
  
  return path;
}

