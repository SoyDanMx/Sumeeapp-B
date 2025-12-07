"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faChevronDown,
  faChevronUp,
  faTimes,
  faDollarSign,
} from "@fortawesome/free-solid-svg-icons";
import { MarketplaceFilters, PriceRange } from "@/lib/marketplace/filters";

interface CategoryFiltersProps {
  filters: MarketplaceFilters;
  onFiltersChange: (filters: MarketplaceFilters) => void;
  showPowerType?: boolean;
  availableConditions?: string[];
  priceStats?: { min: number; max: number };
}

const CONDITION_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  usado_excelente: "Usado - Excelente",
  usado_bueno: "Usado - Bueno",
  usado_regular: "Usado - Regular",
  para_reparar: "Para Reparar",
};

const CONDITION_COLORS: Record<string, string> = {
  nuevo: "bg-green-100 text-green-700 border-green-200",
  usado_excelente: "bg-blue-100 text-blue-700 border-blue-200",
  usado_bueno: "bg-yellow-100 text-yellow-700 border-yellow-200",
  usado_regular: "bg-orange-100 text-orange-700 border-orange-200",
  para_reparar: "bg-red-100 text-red-700 border-red-200",
};

export function CategoryFilters({
  filters,
  onFiltersChange,
  showPowerType = false,
  availableConditions = [],
  priceStats,
}: CategoryFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    condition: true,
    price: true,
    powerType: showPowerType,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleConditionToggle = (condition: string) => {
    const newConditions = filters.conditions.includes(condition)
      ? filters.conditions.filter((c) => c !== condition)
      : [...filters.conditions, condition];
    
    onFiltersChange({
      ...filters,
      conditions: newConditions,
    });
  };

  const handlePriceRangeChange = (field: "min" | "max", value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    onFiltersChange({
      ...filters,
      priceRange: {
        ...filters.priceRange,
        [field]: numValue,
      },
    });
  };

  const handlePowerTypeChange = (powerType: string | null) => {
    onFiltersChange({
      ...filters,
      powerType: powerType === filters.powerType ? null : powerType,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      conditions: [],
      priceRange: { min: null, max: null },
      powerType: null,
    });
  };

  const hasActiveFilters =
    filters.conditions.length > 0 ||
    filters.priceRange.min !== null ||
    filters.priceRange.max !== null ||
    filters.powerType !== null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faFilter} className="text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xs" />
            Limpiar
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {/* Condición */}
        {availableConditions.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection("condition")}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">Condición</span>
              <FontAwesomeIcon
                icon={expandedSections.condition ? faChevronUp : faChevronDown}
                className="text-gray-400 text-xs"
              />
            </button>
            {expandedSections.condition && (
              <div className="px-4 pb-4 space-y-2">
                {availableConditions.map((condition) => (
                  <label
                    key={condition}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters.conditions.includes(condition)}
                      onChange={() => handleConditionToggle(condition)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border ${
                        filters.conditions.includes(condition)
                          ? CONDITION_COLORS[condition] || "bg-gray-100 text-gray-700"
                          : "bg-gray-50 text-gray-600 border-gray-200 group-hover:bg-gray-100"
                      }`}
                    >
                      {CONDITION_LABELS[condition] || condition}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Precio */}
        {priceStats && (
          <div>
            <button
              onClick={() => toggleSection("price")}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faDollarSign} className="text-gray-500 text-sm" />
                <span className="font-medium text-gray-900">Precio</span>
              </div>
              <FontAwesomeIcon
                icon={expandedSections.price ? faChevronUp : faChevronDown}
                className="text-gray-400 text-xs"
              />
            </button>
            {expandedSections.price && (
              <div className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                    <input
                      type="number"
                      placeholder={`$${priceStats.min.toLocaleString()}`}
                      value={filters.priceRange.min || ""}
                      onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                    <input
                      type="number"
                      placeholder={`$${priceStats.max.toLocaleString()}`}
                      value={filters.priceRange.max || ""}
                      onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Rango: ${priceStats.min.toLocaleString()} - ${priceStats.max.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tipo de Energía */}
        {showPowerType && (
          <div>
            <button
              onClick={() => toggleSection("powerType")}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">Tipo de Energía</span>
              <FontAwesomeIcon
                icon={expandedSections.powerType ? faChevronUp : faChevronDown}
                className="text-gray-400 text-xs"
              />
            </button>
            {expandedSections.powerType && (
              <div className="px-4 pb-4 space-y-2">
                {[
                  { value: "electric", label: "Eléctrica" },
                  { value: "cordless", label: "Inalámbrica" },
                  { value: "electric_all", label: "Todas las eléctricas" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="powerType"
                      checked={filters.powerType === option.value}
                      onChange={() => handlePowerTypeChange(option.value)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

