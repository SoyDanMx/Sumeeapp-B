"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faTh,
  faList,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { SortOption, ViewMode, getSortLabel } from "@/lib/marketplace/filters";

interface SortAndViewControlsProps {
  sortBy: SortOption;
  viewMode: ViewMode;
  onSortChange: (sort: SortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  productCount: number;
}

const SORT_OPTIONS: SortOption[] = [
  "relevance",
  "price_asc",
  "price_desc",
  "newest",
  "most_viewed",
  "most_liked",
];

export function SortAndViewControls({
  sortBy,
  viewMode,
  onSortChange,
  onViewModeChange,
  productCount,
}: SortAndViewControlsProps) {
  const [showSortDropdown, setShowSortDropdown] = React.useState(false);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Contador de resultados */}
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{productCount.toLocaleString()}</span>{" "}
          {productCount === 1 ? "resultado" : "resultados"}
        </div>

        {/* Controles */}
        <div className="flex items-center gap-4">
          {/* Ordenamiento */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
            >
              <FontAwesomeIcon icon={faSort} className="text-xs" />
              <span>{getSortLabel(sortBy)}</span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`text-xs transition-transform ${
                  showSortDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showSortDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        onSortChange(option);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        sortBy === option
                          ? "text-indigo-600 font-medium bg-indigo-50"
                          : "text-gray-700"
                      }`}
                    >
                      {getSortLabel(option)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Vista Grid/List */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              aria-label="Vista de cuadrícula"
            >
              <FontAwesomeIcon icon={faTh} className="text-sm" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              aria-label="Vista de lista"
            >
              <FontAwesomeIcon icon={faList} className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

