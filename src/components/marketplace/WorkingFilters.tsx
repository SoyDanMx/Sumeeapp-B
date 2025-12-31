"use client";

import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faTimes,
  faSearch,
  faFilter,
  faCheck,
  faTimesCircle,
  faAngleRight,
} from "@fortawesome/free-solid-svg-icons";
import { MarketplaceProduct } from "@/types/supabase";
import { 
  getHierarchyByCategory, 
  HierarchyLevel1,
} from "@/lib/marketplace/hierarchy";

interface WorkingFiltersProps {
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

// Marcas comunes
const MARCAS_COMUNES = [
  "HIKVISION", "DAHUA", "TP-LINK", "CISCO", "ASUS", "APPLE", "SAMSUNG", "LG", "SONY",
  "DELL", "HP", "LENOVO", "ACER", "MSI", "GIGABYTE", "INTEL", "AMD", "NVIDIA",
  "WESTERN DIGITAL", "SEAGATE", "KINGSTON", "CORSAIR", "LOGITECH", "RAZER",
  "ARLO", "RING", "NEST", "ECOBEE", "PHILIPS HUE", "SMART THINGS",
  "SCHNEIDER", "SIEMENS", "ABB", "LEGRAND", "PANDUIT", "BELDEN",
  "AXIS", "VIVOTEK", "BOSCH", "HONEYWELL", "JOHNSON CONTROLS", "AUFIT", "AX PRO", "CONDUMEX", "AMAZON",
  "VICTRON", "SUNGROW", "GOODWE", "SOLAREDGE", "ENPHASE",
];

function extractBrands(products: MarketplaceProduct[]): string[] {
  const brandsFound = new Set<string>();
  
  if (!products || products.length === 0) return [];
  
  products.forEach((product) => {
    const title = (product.title || "").toUpperCase();
    const description = (product.description || "").toUpperCase();
    const text = `${title} ${description}`;
    
    MARCAS_COMUNES.forEach((brand) => {
      const brandUpper = brand.toUpperCase();
      const brandRegex = new RegExp(`\\b${brandUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      
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

export default function WorkingFilters({
  products,
  categoryId,
  filters,
  onFiltersChange,
  onClearFilters,
}: WorkingFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hierarchy: true,
    condition: false,
    brands: false,
    price: false,
  });
  
  const [brandSearchQuery, setBrandSearchQuery] = useState("");

  // Obtener jerarquía
  const hierarchy = useMemo(() => {
    const h = getHierarchyByCategory(categoryId);
    return h as HierarchyLevel1 | null;
  }, [categoryId]);

  // Rama actual
  const currentRama = useMemo(() => {
    if (!filters.rama || !hierarchy) return null;
    return hierarchy.ramas.find((r) => r.id === filters.rama) || null;
  }, [filters.rama, hierarchy]);

  // Extraer marcas disponibles
  const availableBrands = useMemo(() => {
    return extractBrands(products);
  }, [products]);

  // Filtrar marcas por búsqueda
  const filteredBrands = useMemo(() => {
    if (!brandSearchQuery) return availableBrands;
    const query = brandSearchQuery.toUpperCase();
    return availableBrands.filter(brand => brand.toUpperCase().includes(query));
  }, [availableBrands, brandSearchQuery]);

  // Calcular estadísticas de precio
  const priceStats = useMemo(() => {
    const prices = products
      .filter(p => p.price > 0)
      .map(p => p.price)
      .sort((a, b) => a - b);
    
    if (prices.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }
    
    return {
      min: prices[0],
      max: prices[prices.length - 1],
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
    };
  }, [products]);

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.rama) count++;
    if (filters.subrama) count++;
    if (filters.condition.length > 0) count += filters.condition.length;
    if (filters.brands.length > 0) count += filters.brands.length;
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) count++;
    return count;
  }, [filters]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleRamaClick = (ramaId: string) => {
    console.log('🔵 [FILTROS] Click en rama:', ramaId);
    if (filters.rama === ramaId) {
      onFiltersChange({ ...filters, rama: null, subrama: null });
    } else {
      onFiltersChange({ ...filters, rama: ramaId, subrama: null });
    }
  };

  const handleSubramaClick = (subramaId: string) => {
    console.log('🔵 [FILTROS] Click en subrama:', subramaId);
    if (filters.subrama === subramaId) {
      onFiltersChange({ ...filters, subrama: null });
    } else {
      onFiltersChange({ ...filters, subrama: subramaId });
    }
  };

  const handleConditionToggle = (condition: string) => {
    console.log('🔵 [FILTROS] Toggle condición:', condition);
    const newConditions = filters.condition.includes(condition)
      ? filters.condition.filter(c => c !== condition)
      : [...filters.condition, condition];
    onFiltersChange({ ...filters, condition: newConditions });
  };

  const handleBrandToggle = (brand: string) => {
    console.log('🔵 [FILTROS] Toggle marca:', brand);
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    console.log('🔵 [FILTROS] Cambio precio:', type, value);
    const numValue = value === '' ? null : parseInt(value);
    onFiltersChange({
      ...filters,
      priceRange: {
        ...filters.priceRange,
        [type]: numValue,
      },
    });
  };

  // Chips de filtros activos
  const activeFilterChips = useMemo(() => {
    const chips: Array<{ label: string; onRemove: () => void }> = [];
    
    if (filters.rama && hierarchy) {
      const rama = hierarchy.ramas.find(r => r.id === filters.rama);
      if (rama) {
        chips.push({
          label: rama.name,
          onRemove: () => {
            console.log('🔵 [FILTROS] Remover rama:', filters.rama);
            onFiltersChange({ ...filters, rama: null, subrama: null });
          },
        });
      }
    }
    
    if (filters.subrama && currentRama) {
      const subrama = currentRama.subramas?.find(sr => sr.id === filters.subrama);
      if (subrama) {
        chips.push({
          label: subrama.name,
          onRemove: () => {
            console.log('🔵 [FILTROS] Remover subrama:', filters.subrama);
            onFiltersChange({ ...filters, subrama: null });
          },
        });
      }
    }
    
    filters.condition.forEach(cond => {
      chips.push({
        label: cond === 'nuevo' ? 'Nuevo' : cond,
        onRemove: () => handleConditionToggle(cond),
      });
    });
    
    filters.brands.forEach(brand => {
      chips.push({
        label: brand,
        onRemove: () => handleBrandToggle(brand),
      });
    });
    
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
      const min = filters.priceRange.min || priceStats.min;
      const max = filters.priceRange.max || priceStats.max;
      chips.push({
        label: `$${min.toLocaleString('es-MX')} - $${max.toLocaleString('es-MX')}`,
        onRemove: () => {
          console.log('🔵 [FILTROS] Remover precio');
          onFiltersChange({ ...filters, priceRange: { min: null, max: null } });
        },
      });
    }
    
    return chips;
  }, [filters, hierarchy, currentRama, priceStats]);

  if (!hierarchy) {
    return null;
  }

  return (
    <div className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm lg:sticky lg:top-24">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faFilter} className="text-gray-600 text-sm" />
              <h3 className="font-semibold text-gray-900 text-sm">Filtros</h3>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  console.log('🔵 [FILTROS] Limpiar todos los filtros');
                  onClearFilters();
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                title="Limpiar todos los filtros"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Chips de filtros activos */}
        {activeFilterChips.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {activeFilterChips.map((chip, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                >
                  <span>{chip.label}</span>
                  <button
                    onClick={chip.onRemove}
                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    title="Eliminar filtro"
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-200">
          {/* Categorías (Jerarquía) */}
          <div>
            <button
              onClick={() => toggleSection("hierarchy")}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 text-sm">Categorías</span>
              <FontAwesomeIcon
                icon={expandedSections.hierarchy ? faChevronUp : faChevronDown}
                className="text-gray-400 text-xs"
              />
            </button>
            
            {expandedSections.hierarchy && (
              <div className="px-4 pb-4 space-y-1">
                {!filters.rama ? (
                  // Mostrar todas las ramas
                  hierarchy.ramas.map((rama) => (
                    <button
                      key={rama.id}
                      onClick={() => handleRamaClick(rama.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md transition-colors group"
                    >
                      <span>{rama.name}</span>
                      <FontAwesomeIcon icon={faAngleRight} className="text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))
                ) : filters.subrama ? (
                  // Mostrar subramas con selección
                  <>
                    <button
                      onClick={() => {
                        console.log('🔵 [FILTROS] Volver a ramas');
                        onFiltersChange({ ...filters, rama: null, subrama: null });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors mb-2"
                    >
                      <FontAwesomeIcon icon={faAngleRight} className="text-xs rotate-180" />
                      <span>Volver</span>
                    </button>
                    {currentRama?.subramas?.map((subrama) => (
                      <label
                        key={subrama.id}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.subrama === subrama.id}
                          onChange={() => handleSubramaClick(subrama.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="flex-1">{subrama.name}</span>
                        {filters.subrama === subrama.id && (
                          <FontAwesomeIcon icon={faCheck} className="text-blue-600 text-xs" />
                        )}
                      </label>
                    ))}
                  </>
                ) : (
                  // Mostrar subramas de la rama seleccionada
                  <>
                    <button
                      onClick={() => {
                        console.log('🔵 [FILTROS] Volver a ramas');
                        onFiltersChange({ ...filters, rama: null, subrama: null });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors mb-2"
                    >
                      <FontAwesomeIcon icon={faAngleRight} className="text-xs rotate-180" />
                      <span>Volver</span>
                    </button>
                    {currentRama?.subramas?.map((subrama) => (
                      <button
                        key={subrama.id}
                        onClick={() => handleSubramaClick(subrama.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-md transition-colors group"
                      >
                        <span>{subrama.name}</span>
                        <FontAwesomeIcon icon={faAngleRight} className="text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Condición */}
          <div>
            <button
              onClick={() => toggleSection("condition")}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 text-sm">Condición</span>
              <FontAwesomeIcon
                icon={expandedSections.condition ? faChevronUp : faChevronDown}
                className="text-gray-400 text-xs"
              />
            </button>
            
            {expandedSections.condition && (
              <div className="px-4 pb-4">
                <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.condition.includes("nuevo")}
                    onChange={() => handleConditionToggle("nuevo")}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="flex-1">Nuevo</span>
                  {filters.condition.includes("nuevo") && (
                    <FontAwesomeIcon icon={faCheck} className="text-blue-600 text-xs" />
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Marcas */}
          <div>
            <button
              onClick={() => toggleSection("brands")}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 text-sm">Marcas</span>
                {filters.brands.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {filters.brands.length}
                  </span>
                )}
              </div>
              <FontAwesomeIcon
                icon={expandedSections.brands ? faChevronUp : faChevronDown}
                className="text-gray-400 text-xs"
              />
            </button>
            
            {expandedSections.brands && (
              <div className="px-4 pb-4">
                {availableBrands.length > 0 ? (
                  <>
                    {/* Búsqueda de marcas */}
                    <div className="relative mb-3">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Buscar marca..."
                        value={brandSearchQuery}
                        onChange={(e) => setBrandSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* Lista de marcas */}
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {filteredBrands.length > 0 ? (
                        filteredBrands.map((brand) => (
                          <label
                            key={brand}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filters.brands.includes(brand)}
                              onChange={() => handleBrandToggle(brand)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="flex-1 text-xs">{brand}</span>
                            {filters.brands.includes(brand) && (
                              <FontAwesomeIcon icon={faCheck} className="text-blue-600 text-xs" />
                            )}
                          </label>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 text-center py-2">
                          No se encontraron marcas
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 text-center py-2">
                    No hay marcas disponibles
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Precio */}
          <div>
            <button
              onClick={() => toggleSection("price")}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 text-sm">Precio</span>
              <FontAwesomeIcon
                icon={expandedSections.price ? faChevronUp : faChevronDown}
                className="text-gray-400 text-xs"
              />
            </button>
            
            {expandedSections.price && (
              <div className="px-4 pb-4 space-y-3">
                {priceStats.max > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                        <input
                          type="number"
                          placeholder="Mín"
                          value={filters.priceRange.min || ''}
                          onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                          min={priceStats.min}
                          max={priceStats.max}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                        <input
                          type="number"
                          placeholder="Máx"
                          value={filters.priceRange.max || ''}
                          onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                          min={priceStats.min}
                          max={priceStats.max}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 text-center">
                      Rango: ${priceStats.min.toLocaleString('es-MX')} - ${priceStats.max.toLocaleString('es-MX')}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 text-center py-2">
                    No hay productos con precio
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

