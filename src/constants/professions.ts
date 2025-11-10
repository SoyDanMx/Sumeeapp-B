const SERVICE_BASED_PROFESSIONS = [
  "Electricista",
  "Plomero",
  "Técnico en Aire Acondicionado",
  "Especialista en CCTV y Seguridad",
  "Carpintero",
  "Pintor",
  "Especialista en Limpieza",
  "Jardinero",
  "Especialista en Redes y WiFi",
  "Especialista en Fumigación",
  "Especialista en Tablaroca",
  "Especialista en Construcción",
  "Arquitecto",
  "Ingeniero",
];

const ADDITIONAL_PROFESSIONS = [
  "Ayudante Eléctrico",
  "Técnico en Refrigeración",
  "Soldador",
  "Herrero",
  "Técnico en Seguridad",
  "Instalador de Pisos",
  "Técnico en Gas",
  "Otro",
];

export const PROFESSIONAL_PROFESSIONS = (() => {
  const unique = new Set<string>([...SERVICE_BASED_PROFESSIONS, ...ADDITIONAL_PROFESSIONS]);
  const sorted = Array.from(unique)
    .filter((option) => option !== "Otro")
    .sort((a, b) => a.localeCompare(b, "es"));

  if (unique.has("Otro")) {
    sorted.push("Otro");
  }

  return sorted;
})();
