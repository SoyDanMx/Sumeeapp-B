"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTh,
  faTimes,
  faCamera,
  faBell,
  faMicrochip,
  faLock,
  faExclamationTriangle,
  faBolt,
  faBox,
  faBroadcastTower,
  faNetworkWired,
  faRobot,
  faVideo,
  faBolt as faLightning,
  faWrench,
  faHammer,
  faTools,
  faPaintRoller,
  faTree,
  faServer,
} from "@fortawesome/free-solid-svg-icons";
import { MARKETPLACE_CATEGORIES, MarketplaceCategory } from "@/lib/marketplace/categories";

interface CategorySidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

// Mapeo de íconos para categorías (similar a Syscom)
const CATEGORY_ICONS: Record<string, any> = {
  sistemas: faServer,
  electricidad: faBolt,
  plomeria: faWrench,
  construccion: faHammer,
  carpinteria: faTools,
  pintura: faPaintRoller,
  jardineria: faTree,
  // Íconos específicos para subcategorías de sistemas (como Syscom)
  videovigilancia: faVideo,
  redes: faNetworkWired,
  energia: faLightning,
  automatizacion: faBell,
  cableado: faMicrochip,
  control_acceso: faLock,
  deteccion_fuego: faExclamationTriangle,
  iot: faBox,
  radiocomunicacion: faBroadcastTower,
  robots: faRobot,
  audio_video: faCamera,
};

export function CategorySidebar({ isOpen = true, onClose, className = "" }: CategorySidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"modern" | "classic">("modern");

  // Filtrar categorías según búsqueda
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return MARKETPLACE_CATEGORIES;
    }

    const query = searchQuery.toLowerCase();
    return MARKETPLACE_CATEGORIES.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.namePlural.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query) ||
        cat.subcategories.some((sub) =>
          sub.name.toLowerCase().includes(query)
        )
    );
  }, [searchQuery]);

  // Determinar categoría activa
  const activeCategorySlug = useMemo(() => {
    const match = pathname?.match(/\/marketplace\/categoria\/([^/]+)/);
    return match ? match[1] : null;
  }, [pathname]);

  const handleCategoryClick = () => {
    // Cerrar sidebar en móvil cuando se selecciona una categoría
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <aside
      className={`
        ${className}
        ${isOpen ? "block" : "hidden lg:block"}
        bg-white border-r border-gray-200
        ${onClose ? "fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-80 lg:w-64" : "w-64"}
        overflow-y-auto
        flex flex-col
      `}
    >
      {/* Header con búsqueda y botón clásico */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-4">
        {/* Botón cerrar en móvil */}
        {onClose && (
          <div className="flex items-center justify-between mb-3 lg:hidden">
            <h2 className="text-lg font-bold text-gray-900">Categorías</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
            </button>
          </div>
        )}

        {/* Buscador */}
        <div className="relative mb-3">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
          />
          <input
            type="text"
            placeholder="Buscar en el menú"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
        </div>

        {/* Botón Clásico */}
        <button
          onClick={() => setViewMode(viewMode === "modern" ? "classic" : "modern")}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
        >
          <FontAwesomeIcon icon={faTh} className="text-gray-500" />
          <span>{viewMode === "modern" ? "Clásico" : "Moderno"}</span>
        </button>
      </div>

      {/* Lista de categorías */}
      <div className="flex-1 p-4">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              No se encontraron categorías
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <nav className="space-y-1">
            {filteredCategories.map((category) => {
              const isActive = activeCategorySlug === category.slug;
              const icon = CATEGORY_ICONS[category.slug] || category.icon;

              return (
                <Link
                  key={category.id}
                  href={`/marketplace/categoria/${category.slug}`}
                  onClick={handleCategoryClick}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  {/* Ícono */}
                  <div
                    className={`
                      w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0
                      ${
                        isActive
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-gray-100 text-gray-600"
                      }
                    `}
                  >
                    <FontAwesomeIcon icon={icon} className="text-sm" />
                  </div>

                  {/* Nombre de categoría */}
                  <span className="flex-1 text-sm font-medium truncate">
                    {category.name}
                  </span>

                  {/* Indicador de activo */}
                  {isActive && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Footer con información adicional (opcional) */}
      {viewMode === "classic" && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {MARKETPLACE_CATEGORIES.length} categorías disponibles
          </p>
        </div>
      )}
    </aside>
  );
}

// Overlay para móvil
export function CategorySidebarOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 lg:hidden"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

