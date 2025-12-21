"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { CategoryFilters } from "./CategoryFilters";
import { MarketplaceFilters } from "@/lib/marketplace/filters";

interface MobileFiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MarketplaceFilters;
  onFiltersChange: (filters: MarketplaceFilters) => void;
  availableConditions?: string[];
  priceStats?: { min: number; max: number };
  products?: Array<{ title: string; description?: string }>; // Para extraer marcas disponibles
}

export function MobileFiltersDrawer({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableConditions,
  priceStats,
  products = [],
}: MobileFiltersDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar filtros"
          >
            <FontAwesomeIcon icon={faTimes} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-73px)] px-4 py-4">
          <CategoryFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            availableConditions={availableConditions}
            priceStats={priceStats}
            products={products}
          />
        </div>

        {/* Footer con botón aplicar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </>
  );
}

