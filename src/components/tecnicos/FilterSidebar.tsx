'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faCheckCircle,
  faFilter
} from '@fortawesome/free-solid-svg-icons';

// Categorías de servicios principales
const serviceCategories = [
  { id: 'plomeria', name: 'Plomería', icon: '🔧' },
  { id: 'electricidad', name: 'Electricidad', icon: '⚡' },
  { id: 'carpinteria', name: 'Carpintería', icon: '🔨' },
  { id: 'pintura', name: 'Pintura', icon: '🎨' },
  { id: 'aire_acondicionado', name: 'Aire Acondicionado', icon: '❄️' },
  { id: 'jardineria', name: 'Jardinería', icon: '🌱' },
  { id: 'limpieza', name: 'Limpieza', icon: '🧽' },
  { id: 'fumigacion', name: 'Fumigación', icon: '🐛' },
  { id: 'cctv', name: 'CCTV', icon: '📹' },
  { id: 'wifi', name: 'WiFi', icon: '📶' },
  { id: 'tablaroca', name: 'Tablaroca', icon: '🏗️' },
  { id: 'construccion', name: 'Construcción', icon: '🏗️' }
];

interface FilterSidebarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
  showVerifiedOnly: boolean;
  onShowVerifiedOnlyChange: (show: boolean) => void;
  onClearFilters: () => void;
  resultCount: number;
}

export default function FilterSidebar({
  searchTerm,
  onSearchChange,
  selectedCategories,
  onCategoriesChange,
  minRating,
  onMinRatingChange,
  showVerifiedOnly,
  onShowVerifiedOnlyChange,
  onClearFilters,
  resultCount
}: FilterSidebarProps) {
  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(c => c !== categoryId));
    } else {
      onCategoriesChange([...selectedCategories, categoryId]);
    }
  };

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || minRating > 0 || showVerifiedOnly;

  return (
    <aside className="bg-white rounded-xl shadow-lg p-6 sticky top-24 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <FontAwesomeIcon icon={faFilter} className="mr-2 text-blue-600" />
          Filtros
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Resultados */}
      {resultCount > 0 && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-900">
            {resultCount} profesional{resultCount !== 1 ? 'es' : ''} encontrado{resultCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Buscador */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar por nombre o palabra clave
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: Juan Pérez, fugas de gas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Filtro por Categoría */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Especialidad
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {serviceCategories.map((category) => (
            <label
              key={category.id}
              className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Filtro por Calificación Mínima */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Calificación Mínima
        </label>
        <div className="space-y-2">
          {[4, 3, 2, 1, 0].map((rating) => (
            <label
              key={rating}
              className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
            >
              <input
                type="radio"
                name="minRating"
                checked={minRating === rating}
                onChange={() => onMinRatingChange(rating)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                {rating === 0 ? (
                  'Todas las calificaciones'
                ) : (
                  <>
                    {Array(rating).fill(0).map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                    {Array(5 - rating).fill(0).map((_, i) => (
                      <span key={i} className="text-gray-300">★</span>
                    ))}{' '}
                    y más
                  </>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Toggle Solo Verificados */}
      <div className="mb-6">
        <label className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer group">
          <input
            type="checkbox"
            checked={showVerifiedOnly}
            onChange={(e) => onShowVerifiedOnlyChange(e.target.checked)}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">
                Solo Verificados por Sumee
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Profesionales que han pasado nuestro proceso de verificación
            </p>
          </div>
        </label>
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Info adicional */}
      <div className="text-xs text-gray-500 space-y-2">
        <p>💡 Tip: Usa múltiples filtros para encontrar el profesional perfecto</p>
        <p>🔒 Los perfiles completos están disponibles con un plan Premium</p>
      </div>
    </aside>
  );
}

