"use client";

import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faChevronUp,
  faChevronDown,
  faDollarSign,
  faChevronRight,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import { MarketplaceProduct } from "@/types/supabase";
import {
  getHierarchyByCategory,
  getBreadcrumbPath,
  HierarchyLevel1,
  HierarchyLevel2,
  HierarchyLevel3,
} from "@/lib/marketplace/hierarchy";

interface FilterSidebarProps {
  products: MarketplaceProduct[];
  categoryId: string;
  filters: {
    rama: string | null;
    subrama: string | null;
    condition: string[];
    brands: string[];
    priceRange: { min: number | null; max: number | null };
  };
  onFiltersChange: (filters: {
    rama: string | null;
    subrama: string | null;
    condition: string[];
    brands: string[];
    priceRange: { min: number | null; max: number | null };
  }) => void;
  onClearFilters: () => void;
}

// Marcas comunes (se extraerán dinámicamente también)
const MARCAS_COMUNES = [
  "HIKVISION", "DAHUA", "TP-LINK", "CISCO", "ASUS", "APPLE", "SAMSUNG", "LG", "SONY",
  "DELL", "HP", "LENOVO", "ACER", "MSI", "GIGABYTE", "INTEL", "AMD", "NVIDIA",
  "WESTERN DIGITAL", "SEAGATE", "KINGSTON", "CORSAIR", "LOGITECH", "RAZER",
  "ARLO", "RING", "NEST", "ECOBEE", "PHILIPS HUE", "SMART THINGS",
  "SCHNEIDER", "SIEMENS", "ABB", "LEGRAND", "PANDUIT", "BELDEN",
  "AXIS", "VIVOTEK", "BOSCH", "HONEYWELL", "JOHNSON CONTROLS", "AUFIT", "AX PRO", "CONDUMEX", "AMAZON"
];

// Extraer marcas únicas de los productos
// IMPORTANTE: Solo extrae marcas de productos que realmente están disponibles
function extractBrands(products: MarketplaceProduct[]): string[] {
  const brandsFound = new Set<string>();
  
  if (!products || products.length === 0) {
    return [];
  }
  
  products.forEach((product) => {
    const title = (product.title || "").toUpperCase();
    const description = (product.description || "").toUpperCase();
    const text = `${title} ${description}`;
    
    // Buscar marcas de forma más precisa
    MARCAS_COMUNES.forEach((brand) => {
      const brandUpper = brand.toUpperCase();
      
      // Buscar marca como palabra completa (no como substring dentro de otra palabra)
      // Ejemplo: "HIKVISION" debe coincidir, pero no "HIKVISION123" como parte de otra palabra
      const brandRegex = new RegExp(`\\b${brandUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      
      // También buscar marca al inicio o final del título/descripción
      if (
        brandRegex.test(text) ||
        title.startsWith(brandUpper) ||
        title.includes(` ${brandUpper} `) ||
        title.endsWith(` ${brandUpper}`) ||
        description.includes(brandUpper)
      ) {
        brandsFound.add(brand);
      }
    });
  });
  
  return Array.from(brandsFound).sort();
}

export default function FilterSidebar({
  products,
  categoryId,
  filters,
  onFiltersChange,
  onClearFilters,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hierarchy: true,
    condition: true,
    brands: true, // Asegurar que marcas esté expandido por defecto
    price: true,
  });

  // Obtener jerarquía de la categoría
  const hierarchy = useMemo(() => getHierarchyByCategory(categoryId), [categoryId]);
  
  // Breadcrumb path
  const breadcrumbPath = useMemo(() => {
    return getBreadcrumbPath(categoryId, filters.rama || undefined, filters.subrama || undefined);
  }, [categoryId, filters.rama, filters.subrama]);

  // Obtener rama actual si está seleccionada
  const currentRama = useMemo(() => {
    if (!filters.rama || !hierarchy) return null;
    return hierarchy.ramas.find((r) => r.id === filters.rama) || null;
  }, [filters.rama, hierarchy]);

  // Extraer marcas disponibles de los productos
  const availableBrands = useMemo(() => {
    const brands = extractBrands(products);
    // Debug en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🏷️ [FILTROS] Marcas extraídas:', brands.length, brands);
    }
    return brands;
  }, [products]);

  // Calcular rango de precios
  const priceStats = useMemo(() => {
    const prices = products
      .map((p) => p.price)
      .filter((p) => p > 0)
      .sort((a, b) => a - b);
    
    if (prices.length === 0) {
      return { min: 0, max: 0 };
    }
    
    return {
      min: Math.floor(prices[0]),
      max: Math.ceil(prices[prices.length - 1]),
    };
  }, [products]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleRamaClick = (ramaId: string) => {
    // Si ya está seleccionada, deseleccionar
    if (filters.rama === ramaId) {
      onFiltersChange({
        ...filters,
        rama: null,
        subrama: null,
      });
    } else {
      // Seleccionar nueva rama y limpiar subrama
      onFiltersChange({
        ...filters,
        rama: ramaId,
        subrama: null,
      });
    }
  };

  const handleSubramaClick = (subramaId: string) => {
    // Si ya está seleccionada, deseleccionar
    if (filters.subrama === subramaId) {
      onFiltersChange({
        ...filters,
        subrama: null,
      });
    } else {
      // Seleccionar nueva subrama
      onFiltersChange({
        ...filters,
        subrama: subramaId,
      });
    }
  };

  const handleBreadcrumbClick = (level: number) => {
    if (level === 0) {
      // Volver al inicio
      onFiltersChange({
        ...filters,
        rama: null,
        subrama: null,
      });
    } else if (level === 1) {
      // Volver a ramas (mantener rama, limpiar subrama)
      onFiltersChange({
        ...filters,
        subrama: null,
      });
    }
  };

  const handleConditionChange = (condition: string) => {
    const newConditions = filters.condition.includes(condition)
      ? filters.condition.filter((c) => c !== condition)
      : [...filters.condition, condition];
    
    onFiltersChange({
      ...filters,
      condition: newConditions,
    });
  };

  const handleBrandChange = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    
    onFiltersChange({
      ...filters,
      brands: newBrands,
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

  const hasActiveFilters = useMemo(() => {
    return (
      filters.rama !== null ||
      filters.subrama !== null ||
      filters.condition.length > 0 ||
      filters.brands.length > 0 ||
      filters.priceRange.min !== null ||
      filters.priceRange.max !== null
    );
  }, [filters]);

  if (!hierarchy) {
    return null; // No hay jerarquía para esta categoría
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto h-full">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Breadcrumb Navigation */}
        {breadcrumbPath.length > 1 && (
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-3 pb-3 border-b border-gray-200">
            <button
              onClick={() => handleBreadcrumbClick(0)}
              className="hover:text-indigo-600 flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faHome} className="text-xs" />
              <span>{breadcrumbPath[0].name}</span>
            </button>
            {breadcrumbPath.slice(1).map((item, index) => (
              <React.Fragment key={item.id}>
                <FontAwesomeIcon icon={faChevronRight} className="text-xs text-gray-400" />
                <button
                  onClick={() => handleBreadcrumbClick(index + 1)}
                  className={`hover:text-indigo-600 ${
                    index === breadcrumbPath.length - 2 ? "font-semibold text-gray-900" : ""
                  }`}
                >
                  {item.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Navegación Jerárquica */}
        <div>
          <button
            onClick={() => toggleSection("hierarchy")}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <span className="font-semibold text-gray-900">
              {filters.subrama ? "Subrama" : filters.rama ? "Rama" : "Categorías"}
            </span>
            <FontAwesomeIcon
              icon={expandedSections.hierarchy ? faChevronUp : faChevronDown}
              className="text-gray-400 text-xs"
            />
          </button>
          
          {expandedSections.hierarchy && (
            <div className="space-y-1">
              {!filters.rama ? (
                // Nivel 1: Mostrar todas las ramas
                hierarchy.ramas.map((rama) => (
                  <button
                    key={rama.id}
                    onClick={() => handleRamaClick(rama.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      filters.rama === rama.id
                        ? "bg-indigo-50 text-indigo-700 font-medium border border-indigo-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{rama.name}</span>
                      <FontAwesomeIcon icon={faChevronRight} className="text-xs text-gray-400" />
                    </div>
                  </button>
                ))
              ) : currentRama && !filters.subrama ? (
                // Nivel 2: Mostrar subramas de la rama seleccionada
                <>
                  <button
                    onClick={() => handleRamaClick(currentRama.id)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 mb-2 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faChevronRight} className="text-xs rotate-180" />
                    <span>Volver</span>
                  </button>
                  {currentRama.subramas.map((subrama) => (
                    <button
                      key={subrama.id}
                      onClick={() => handleSubramaClick(subrama.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.subrama === subrama.id
                          ? "bg-indigo-50 text-indigo-700 font-medium border border-indigo-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {subrama.name}
                    </button>
                  ))}
                </>
              ) : (
                // Nivel 3: Mostrar subrama seleccionada
                <>
                  <button
                    onClick={() => handleSubramaClick(filters.subrama!)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 mb-2 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faChevronRight} className="text-xs rotate-180" />
                    <span>Volver</span>
                  </button>
                  {currentRama && (
                    <div className="px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-200">
                      <p className="text-sm font-medium text-indigo-700">
                        {currentRama.subramas.find((sr) => sr.id === filters.subrama)?.name}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Filtro activo</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Condición */}
        <div>
          <button
            onClick={() => toggleSection("condition")}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <span className="font-semibold text-gray-900">Condición</span>
            <FontAwesomeIcon
              icon={expandedSections.condition ? faChevronUp : faChevronDown}
              className="text-gray-400 text-xs"
            />
          </button>
          
          {expandedSections.condition && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={filters.condition.includes("nuevo")}
                  onChange={() => handleConditionChange("nuevo")}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Nuevo</span>
              </label>
            </div>
          )}
        </div>

        {/* Marcas */}
        <div>
          <button
            onClick={() => toggleSection("brands")}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">Marcas</span>
              {availableBrands.length > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {availableBrands.length}
                </span>
              )}
            </div>
            <FontAwesomeIcon
              icon={expandedSections.brands ? faChevronUp : faChevronDown}
              className="text-gray-400 text-xs"
            />
          </button>
          
          {expandedSections.brands && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableBrands.length > 0 ? (
                <>
                  {availableBrands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                  <p className="text-xs text-gray-400 mt-2 px-2">
                    {availableBrands.length} marca{availableBrands.length !== 1 ? 's' : ''} disponible{availableBrands.length !== 1 ? 's' : ''}
                  </p>
                </>
              ) : (
                <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                  <p className="mb-1">No se encontraron marcas en los productos actuales.</p>
                  <p className="text-xs text-gray-400">
                    Las marcas se detectan automáticamente del título y descripción.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Precio */}
        <div>
          <button
            onClick={() => toggleSection("price")}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faDollarSign} className="text-gray-600" />
              <span className="font-semibold text-gray-900">Precio</span>
            </div>
            <FontAwesomeIcon
              icon={expandedSections.price ? faChevronUp : faChevronDown}
              className="text-gray-400 text-xs"
            />
          </button>
          
          {expandedSections.price && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 w-16">Mínimo</label>
                <input
                  type="number"
                  placeholder="$0"
                  value={filters.priceRange.min || ""}
                  onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 w-16">Máximo</label>
                <input
                  type="number"
                  placeholder="$0"
                  value={filters.priceRange.max || ""}
                  onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                />
              </div>
              {priceStats.min > 0 && priceStats.max > 0 && (
                <p className="text-xs text-gray-500">
                  Rango: ${priceStats.min.toLocaleString()} - ${priceStats.max.toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
