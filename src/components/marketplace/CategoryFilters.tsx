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
import { MARKETPLACE_CATEGORIES, getCategoryById, getSubcategoryById } from "@/lib/marketplace/categories";
import { extractBrandsFromProducts, getAvailableBrands } from "@/lib/marketplace/brands";

interface CategoryFiltersProps {
  filters: MarketplaceFilters;
  onFiltersChange: (filters: MarketplaceFilters) => void;
  availableConditions?: string[];
  priceStats?: { min: number; max: number };
  products?: Array<{ title: string; description?: string }>; // Para extraer marcas disponibles
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
  availableConditions = [],
  priceStats,
  products = [],
}: CategoryFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    subcategory: true,
    condition: true,
    brands: true,
    price: true,
  });
  
  // Extraer marcas disponibles de los productos
  // Si hay productos, extraer marcas de ellos; si no, usar marcas conocidas
  const extractedBrands = products.length > 0
    ? extractBrandsFromProducts(products, filters.categoryId)
    : [];
  
  // Obtener marcas conocidas para la categoría
  const knownBrands = getAvailableBrands(filters.categoryId);
  
  // Combinar marcas extraídas con marcas conocidas (evitar duplicados)
  const availableBrands = Array.from(new Set([...extractedBrands, ...knownBrands])).sort();

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

  const handleSubcategoryChange = (subcategoryId: string | null) => {
    // Si se selecciona una subcategoría, asegurar que la categoría también esté seleccionada
    // Esto es necesario para que se carguen productos de esa categoría
    if (subcategoryId && !filters.categoryId) {
      // Si no hay categoría seleccionada, usar la categoría actual del filtro
      // (esto debería estar siempre presente cuando se muestra este componente)
      console.warn("Se seleccionó subcategoría sin categoría padre");
    }
    
    onFiltersChange({
      ...filters,
      subcategoryId: subcategoryId === filters.subcategoryId ? null : subcategoryId,
      // Asegurar que categoryId esté presente si se selecciona subcategoría
      categoryId: subcategoryId && !filters.categoryId ? currentCategory?.id || filters.categoryId : filters.categoryId,
    });
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    
    onFiltersChange({
      ...filters,
      brands: newBrands,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      conditions: [],
      priceRange: { min: null, max: null },
      subcategoryId: null,
      brands: [],
    });
  };

  const hasActiveFilters =
    filters.conditions.length > 0 ||
    filters.priceRange.min !== null ||
    filters.priceRange.max !== null ||
    filters.subcategoryId !== null ||
    filters.brands.length > 0;

  // Obtener categoría actual y sus subcategorías
  const currentCategory = filters.categoryId ? getCategoryById(filters.categoryId) : null;
  const subcategories = currentCategory?.subcategories || [];

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
        {/* Tipo de Equipo (Subcategorías) */}
        {subcategories.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection("subcategory")}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">Tipo de Equipo</span>
              <FontAwesomeIcon
                icon={expandedSections.subcategory ? faChevronUp : faChevronDown}
                className="text-gray-400 text-xs"
              />
            </button>
            {expandedSections.subcategory && (
              <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
                {subcategories.map((subcategory) => (
                  <label
                    key={subcategory.id}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="subcategory"
                      checked={filters.subcategoryId === subcategory.id}
                      onChange={() => handleSubcategoryChange(subcategory.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span
                      className={`text-sm flex-1 ${
                        filters.subcategoryId === subcategory.id
                          ? "font-semibold text-indigo-600"
                          : "text-gray-700 group-hover:text-gray-900"
                      }`}
                    >
                      {subcategory.name}
                    </span>
                  </label>
                ))}
                {filters.subcategoryId && (
                  <button
                    onClick={() => handleSubcategoryChange(null)}
                    className="w-full mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Ver todos los tipos
                  </button>
                )}
              </div>
            )}
          </div>
        )}

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

        {/* Marcas */}
        {availableBrands.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection("brands")}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900">Marcas</span>
              <FontAwesomeIcon
                icon={expandedSections.brands ? faChevronUp : faChevronDown}
                className="text-gray-400 text-xs"
              />
            </button>
            {expandedSections.brands && (
              <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
                {availableBrands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span
                      className={`text-sm flex-1 ${
                        filters.brands.includes(brand)
                          ? "font-semibold text-indigo-600"
                          : "text-gray-700 group-hover:text-gray-900"
                      }`}
                    >
                      {brand}
                    </span>
                  </label>
                ))}
                {filters.brands.length > 0 && (
                  <button
                    onClick={() => onFiltersChange({ ...filters, brands: [] })}
                    className="w-full mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Limpiar marcas
                  </button>
                )}
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

      </div>
    </div>
  );
}
