"use client";

import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface MarketplaceBreadcrumbsProps {
  searchQuery?: string;
  productCount?: number;
  hasFilters?: boolean;
}

export function MarketplaceBreadcrumbs({
  searchQuery,
  productCount,
  hasFilters,
}: MarketplaceBreadcrumbsProps) {
  return (
    <nav
      className="bg-white border-b border-gray-200 py-3 px-4 sticky top-0 z-30"
      aria-label="Breadcrumb"
    >
      <div className="container mx-auto">
        <ol className="flex items-center space-x-2 text-sm flex-wrap">
          <li>
            <Link
              href="/marketplace"
              className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faHome} className="text-xs" />
              <span>Marketplace</span>
            </Link>
          </li>

          {searchQuery && (
            <>
              <li>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="text-gray-400 text-xs"
                />
              </li>
              <li className="text-gray-900 font-semibold truncate max-w-xs">
                Búsqueda: "{searchQuery}"
              </li>
            </>
          )}

          {hasFilters && !searchQuery && (
            <>
              <li>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="text-gray-400 text-xs"
                />
              </li>
              <li className="text-gray-700">Filtros activos</li>
            </>
          )}

          {productCount !== undefined && (
            <li className="ml-auto text-gray-500 text-xs">
              {productCount.toLocaleString()} {productCount === 1 ? "resultado" : "resultados"}
            </li>
          )}
        </ol>
      </div>
    </nav>
  );
}

