'use client';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilter,
  faTimes,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { MarketplaceProduct } from '@/types/supabase';
import { ProductCard } from './ProductCard';
import { MARKETPLACE_CATEGORIES } from '@/lib/marketplace/categories';

interface MarketplaceGridProps {
  products: MarketplaceProduct[];
  onProductClick?: (product: MarketplaceProduct) => void;
}

interface Filters {
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  condition: string | null;
}

export function MarketplaceGrid({ products, onProductClick, exchangeRate }: MarketplaceGridProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: null,
    minPrice: null,
    maxPrice: null,
    condition: null,
  });

  // Filtrar productos según los filtros activos
  const filteredProducts = products.filter((product) => {
    if (filters.category && product.category_id !== filters.category) {
      return false;
    }
    if (filters.minPrice !== null && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== null && product.price > filters.maxPrice) {
      return false;
    }
    if (filters.condition && product.condition !== filters.condition) {
      return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilters({
      category: null,
      minPrice: null,
      maxPrice: null,
      condition: null,
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== null);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar de Filtros */}
      <aside
        className={`
          ${isFilterOpen ? 'fixed inset-0 z-50 lg:relative lg:z-auto' : 'hidden lg:block'}
          bg-white lg:bg-transparent
        `}
      >
        {/* Overlay móvil */}
        {isFilterOpen && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden"
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        {/* Panel de filtros */}
        <div
          className={`
            fixed left-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto z-50
            lg:relative lg:shadow-none lg:w-64 lg:h-auto
            transform transition-transform duration-300
            ${isFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="p-6">
            {/* Header del sidebar */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            {/* Botón limpiar filtros */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full mb-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold"
              >
                Limpiar filtros
              </button>
            )}

            {/* Filtro por Categoría */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Categoría</h3>
              <div className="space-y-2">
                {MARKETPLACE_CATEGORIES.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.id}
                      checked={filters.category === category.id}
                      onChange={(e) =>
                        setFilters({ ...filters, category: e.target.value || null })
                      }
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={filters.category === null}
                    onChange={() => setFilters({ ...filters, category: null })}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Todas las categorías</span>
                </label>
              </div>
            </div>

            {/* Filtro por Rango de Precio */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Rango de Precio</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Precio mínimo</label>
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.minPrice || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minPrice: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Precio máximo</label>
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxPrice: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Filtro por Condición */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Condición</h3>
              <div className="space-y-2">
                {[
                  { value: 'nuevo', label: 'Nuevo' },
                  { value: 'usado_excelente', label: 'Usado - Excelente' },
                  { value: 'usado_bueno', label: 'Usado - Bueno' },
                  { value: 'usado_regular', label: 'Usado - Regular' },
                  { value: 'para_reparar', label: 'Para Reparar' },
                ].map((condition) => (
                  <label
                    key={condition.value}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={condition.value}
                      checked={filters.condition === condition.value}
                      onChange={(e) =>
                        setFilters({ ...filters, condition: e.target.value || null })
                      }
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{condition.label}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="condition"
                    value=""
                    checked={filters.condition === null}
                    onChange={() => setFilters({ ...filters, condition: null })}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Todas las condiciones</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1">
        {/* Botón de filtros móvil */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FontAwesomeIcon icon={faFilter} />
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {Object.values(filters).filter((v) => v !== null).length}
              </span>
            )}
          </button>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 mb-4">No se encontraron productos con estos filtros</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={onProductClick}
              />
            ))
          )}
        </div>

        {/* Contador de resultados */}
        {filteredProducts.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Mostrando {filteredProducts.length} de {products.length} productos
          </div>
        )}
      </div>
    </div>
  );
}


