"use client";

import React, { useState, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faTimes,
  faSearch,
  faFilter,
  faCheck,
  faSlidersH,
  faBars,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { MarketplaceProduct } from "@/types/supabase";
import { MarketplaceFilters } from "@/lib/marketplace/filters";
import { 
  getHierarchyByCategory, 
  getBreadcrumbPath,
  HierarchyLevel1,
} from "@/lib/marketplace/hierarchy";

interface AdvancedFiltersProps {
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

// Marcas comunes para detección
const MARCAS_COMUNES = [
  "HIKVISION", "DAHUA", "TP-LINK", "CISCO", "ASUS", "APPLE", "SAMSUNG", "LG", "SONY",
  "DELL", "HP", "LENOVO", "ACER", "MSI", "GIGABYTE", "INTEL", "AMD", "NVIDIA",
  "WESTERN DIGITAL", "SEAGATE", "KINGSTON", "CORSAIR", "LOGITECH", "RAZER",
  "ARLO", "RING", "NEST", "ECOBEE", "PHILIPS HUE", "SMART THINGS",
  "SCHNEIDER", "SIEMENS", "ABB", "LEGRAND", "PANDUIT", "BELDEN",
  "AXIS", "VIVOTEK", "BOSCH", "HONEYWELL", "JOHNSON CONTROLS", "AUFIT", "AX PRO", "CONDUMEX", "AMAZON",
  "VICTRON", "SUNGROW", "GOODWE", "SOLAREDGE", "ENPHASE",
];

// Extraer marcas de productos filtrados
function extractBrands(products: MarketplaceProduct[]): string[] {
  const brandsFound = new Set<string>();
  
  if (!products || products.length === 0) {
    return [];
  }
  
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

export default function AdvancedFilters({
  products,
  categoryId,
  filters,
  onFiltersChange,
  onClearFilters,
}: AdvancedFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hierarchy: true,
    condition: true,
    brands: true,
    price: true,
  });
  
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Obtener jerarquía
  const hierarchy = useMemo(() => getHierarchyByCategory(categoryId), [categoryId]);
  
  // Breadcrumb path
  const breadcrumbPath = useMemo(() => {
    return getBreadcrumbPath(categoryId, filters.rama || undefined, filters.subrama || undefined);
  }, [categoryId, filters.rama, filters.subrama]);

  // Rama actual
  const currentRama = useMemo(() => {
    if (!filters.rama || !hierarchy) return null;
    return hierarchy.ramas.find((r) => r.id === filters.rama) || null;
  }, [filters.rama, hierarchy]);

  // Extraer marcas disponibles
  const availableBrands = useMemo(() => {
    const brands = extractBrands(products);
    if (process.env.NODE_ENV === 'development') {
      console.log('🏷️ [FILTROS AVANZADOS] Marcas extraídas:', brands.length, brands);
    }
    return brands;
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
    if (filters.rama === ramaId) {
      onFiltersChange({ ...filters, rama: null, subrama: null });
    } else {
      onFiltersChange({ ...filters, rama: ramaId, subrama: null });
    }
  };

  const handleSubramaClick = (subramaId: string) => {
    if (filters.subrama === subramaId) {
      onFiltersChange({ ...filters, subrama: null });
    } else {
      onFiltersChange({ ...filters, subrama: subramaId });
    }
  };

  const handleConditionToggle = (condition: string) => {
    const newConditions = filters.condition.includes(condition)
      ? filters.condition.filter(c => c !== condition)
      : [...filters.condition, condition];
    onFiltersChange({ ...filters, condition: newConditions });
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    onFiltersChange({ ...filters, brands: newBrands });
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: number) => {
    onFiltersChange({
      ...filters,
      priceRange: {
        ...filters.priceRange,
        [type]: value,
      },
    });
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      onFiltersChange({ ...filters, rama: null, subrama: null });
    } else if (index === 1 && filters.rama) {
      onFiltersChange({ ...filters, subrama: null });
    }
  };

  const FilterSection = ({ 
    title, 
    sectionKey, 
    count, 
    children 
  }: { 
    title: string; 
    sectionKey: string; 
    count?: number;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <FontAwesomeIcon
          icon={expandedSections[sectionKey] ? faChevronUp : faChevronDown}
          className="text-gray-400 text-xs"
        />
      </button>
      {expandedSections[sectionKey] && (
        <div className="pb-4">
          {children}
        </div>
      )}
    </div>
  );

  const FilterContent = (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header con contador de filtros activos */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faSlidersH} className="text-indigo-600" />
            <span className="font-semibold text-gray-900">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faTimesCircle} className="text-xs" />
              Limpiar todo
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Breadcrumb Navigation */}
        {breadcrumbPath.length > 1 && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-1 text-xs text-gray-600 flex-wrap">
              {breadcrumbPath.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && (
                    <FontAwesomeIcon icon={faChevronDown} className="text-xs text-gray-400 rotate-[-90deg]" />
                  )}
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className={`hover:text-indigo-600 transition-colors ${
                      index === breadcrumbPath.length - 1 ? "font-semibold text-gray-900" : ""
                    }`}
                  >
                    {item.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Jerarquía */}
        <FilterSection title="Categorías" sectionKey="hierarchy" count={filters.rama ? 1 : 0}>
          {!filters.rama ? (
            <div className="space-y-1">
              {hierarchy.ramas.map((rama) => (
                <button
                  key={rama.id}
                  onClick={() => handleRamaClick(rama.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-indigo-50 text-gray-700"
                >
                  {rama.name}
                </button>
              ))}
            </div>
          ) : filters.subrama ? (
            <div className="space-y-1">
              {currentRama?.subramas?.map((subrama) => (
                <button
                  key={subrama.id}
                  onClick={() => handleSubramaClick(subrama.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    filters.subrama === subrama.id
                      ? "bg-indigo-100 text-indigo-700 font-medium border border-indigo-200"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{subrama.name}</span>
                    {filters.subrama === subrama.id && (
                      <FontAwesomeIcon icon={faCheck} className="text-indigo-600 text-xs" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {currentRama?.subramas?.map((subrama) => (
                <button
                  key={subrama.id}
                  onClick={() => handleSubramaClick(subrama.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-indigo-50 text-gray-700"
                >
                  {subrama.name}
                </button>
              ))}
            </div>
          )}
        </FilterSection>

        {/* Condición */}
        <FilterSection title="Condición" sectionKey="condition" count={filters.condition.length}>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={filters.condition.includes("nuevo")}
                onChange={() => handleConditionToggle("nuevo")}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 flex-1">Nuevo</span>
              {filters.condition.includes("nuevo") && (
                <FontAwesomeIcon icon={faCheck} className="text-indigo-600 text-xs" />
              )}
            </label>
          </div>
        </FilterSection>

        {/* Marcas */}
        <FilterSection title="Marcas" sectionKey="brands" count={filters.brands.length}>
          {availableBrands.length > 0 ? (
            <>
              {/* Búsqueda de marcas */}
              <div className="mb-3 relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"
                />
                <input
                  type="text"
                  placeholder="Buscar marca..."
                  value={brandSearchQuery}
                  onChange={(e) => setBrandSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              {/* Lista de marcas */}
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 flex-1">{brand}</span>
                      {filters.brands.includes(brand) && (
                        <FontAwesomeIcon icon={faCheck} className="text-indigo-600 text-xs" />
                      )}
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No se encontraron marcas con "{brandSearchQuery}"
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-medium mb-1">No se encontraron marcas</p>
              <p className="text-xs text-gray-400">
                Las marcas se detectan automáticamente del título y descripción de los productos.
              </p>
            </div>
          )}
        </FilterSection>

        {/* Precio */}
        <FilterSection title="Precio" sectionKey="price">
          {priceStats.max > 0 ? (
            <div className="space-y-4">
              {/* Slider de precio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Mínimo: ${filters.priceRange.min?.toLocaleString('es-MX') || priceStats.min.toLocaleString('es-MX')}</span>
                  <span>Máximo: ${filters.priceRange.max?.toLocaleString('es-MX') || priceStats.max.toLocaleString('es-MX')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={filters.priceRange.min || ''}
                    onChange={(e) => handlePriceRangeChange('min', e.target.value ? parseInt(e.target.value) : 0)}
                    min={priceStats.min}
                    max={priceStats.max}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={filters.priceRange.max || ''}
                    onChange={(e) => handlePriceRangeChange('max', e.target.value ? parseInt(e.target.value) : 0)}
                    min={priceStats.min}
                    max={priceStats.max}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {/* Rango visual */}
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute h-2 bg-indigo-600 rounded-full"
                    style={{
                      left: `${((filters.priceRange.min || priceStats.min) / priceStats.max) * 100}%`,
                      width: `${((filters.priceRange.max || priceStats.max) - (filters.priceRange.min || priceStats.min)) / priceStats.max * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay productos con precio disponible</p>
          )}
        </FilterSection>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        {FilterContent}
      </div>

      {/* Mobile */}
      <div className="lg:hidden">
        {/* Botón para abrir filtros móviles */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg mb-4"
        >
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-indigo-600" />
            <span className="font-semibold text-gray-900">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <FontAwesomeIcon icon={faChevronDown} className="text-gray-400" />
        </button>

        {/* Overlay móvil */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute inset-y-0 left-0 w-80 bg-white overflow-y-auto shadow-xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
                <span className="font-semibold text-gray-900">Filtros</span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              {FilterContent}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

