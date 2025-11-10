"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faSearch,
  faStar,
  faSliders,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

interface TecnicosFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  professionalCount: number;
}

export interface FilterState {
  searchTerm: string;
  profession: string | null;
  minRating: number;
  radius: number;
  verified: boolean;
}

const PROFESSIONS = [
  "Todos",
  "Electricista",
  "Plomero",
  "Técnico en Aire Acondicionado",
  "Especialista en CCTV y Seguridad",
  "Carpintero",
  "Pintor",
  "Especialista en Limpieza",
  "Jardinero",
  "Técnico en WiFi",
  "Especialista en Tablaroca",
];

const RADIUS_OPTIONS = [5, 10, 15, 25, 50];

export default function TecnicosFilters({
  onFilterChange,
  professionalCount,
}: TecnicosFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    profession: null,
    minRating: 0,
    radius: 15,
    verified: false,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      searchTerm: "",
      profession: null,
      minRating: 0,
      radius: 15,
      verified: false,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.profession ||
    filters.minRating > 0 ||
    filters.radius !== 15 ||
    filters.verified;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Main Filters */}
      <div className="px-4 py-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar por nombre o palabra clave..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
          />
        </div>

        {/* Profession Pills - Horizontal Scroll */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {PROFESSIONS.map((prof) => {
              const isActive =
                (prof === "Todos" && !filters.profession) ||
                filters.profession === prof;
              return (
                <button
                  key={prof}
                  onClick={() =>
                    updateFilters({
                      profession: prof === "Todos" ? null : prof,
                    })
                  }
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {prof}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
          >
            <FontAwesomeIcon icon={faSliders} />
            <span>
              {showAdvanced ? "Ocultar" : "Más"} filtros
            </span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold text-sm"
            >
              <FontAwesomeIcon icon={faTimes} />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calificación Mínima
              </label>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => updateFilters({ minRating: rating })}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.minRating === rating
                        ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-400"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                    <span>{rating === 0 ? "Todas" : `${rating}+`}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Radius Slider */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Radio de Búsqueda: {filters.radius} km
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={filters.radius}
                onChange={(e) =>
                  updateFilters({ radius: parseInt(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>

            {/* Verified Only */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="verified"
                checked={filters.verified}
                onChange={(e) => updateFilters({ verified: e.target.checked })}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="verified"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Solo profesionales verificados por Sumee
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results Count Bar */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            <span className="font-bold text-indigo-600">
              {professionalCount}
            </span>{" "}
            {professionalCount === 1
              ? "profesional encontrado"
              : "profesionales encontrados"}
          </p>
          <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}

