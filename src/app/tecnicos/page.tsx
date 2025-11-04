"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Profesional } from "@/types/supabase";
import { useMembership } from "@/context/MembershipContext";
import FilterSidebar from "@/components/tecnicos/FilterSidebar";
import ProfessionalCard from "@/components/tecnicos/ProfessionalCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faSort,
  faUsers,
  faStar,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

// Opciones de ordenamiento
const sortOptions = [
  { value: "relevancia", label: "Más Relevantes" },
  { value: "calificacion", label: "Mejor Calificados" },
  { value: "reseñas", label: "Más Reseñas" },
  { value: "nombre", label: "Nombre A-Z" },
];

export default function TecnicosPage() {
  // Contexto de membresía
  const { permissions, isFreeUser, upgradeUrl } = useMembership();

  // Estados principales
  const [professionals, setProfessionals] = useState<Profesional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<
    Profesional[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevancia");

  // Estados de UI
  const [showFilters, setShowFilters] = useState(false);

  // Función para obtener profesionales
  const fetchProfessionals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from("profiles")
        .select("*")
        .eq("role", "profesional")
        .not("full_name", "is", null);

      // Solo aplicar filtro de onboarding_status si el campo existe
      // Intentamos filtrar por status aprobado, pero si falla, seguimos sin ese filtro
      try {
        // Verificar si el campo existe antes de filtrar
        const testQuery = await supabase
          .from("profiles")
          .select("onboarding_status")
          .limit(1);

        // Si la query funciona, aplicar el filtro
        if (!testQuery.error) {
          query = query.eq("onboarding_status", "approved");
        }
      } catch (e) {
        // Si el campo no existe, continuamos sin ese filtro
        console.log(
          "Campo onboarding_status no disponible, continuando sin filtro"
        );
      }

      // Filtro de ciudad es opcional (solo si hay resultados, aplicamos filtro de CDMX)
      // Comentado para permitir profesionales de todas las ciudades
      // query = query.eq("city", "Ciudad de México");

      // Aplicar filtro de búsqueda
      if (searchTerm) {
        query = query.ilike("full_name", `%${searchTerm}%`);
      }

      // Aplicar filtro de categorías
      if (selectedCategories.length > 0) {
        query = query.overlaps("areas_servicio", selectedCategories);
      }

      // Aplicar filtro de calificación mínima
      if (minRating > 0) {
        query = query.gte("calificacion_promedio", minRating);
      }

      // Aplicar filtro de verificación (asumimos que todos están verificados, pero mantendremos la lógica)
      if (showVerifiedOnly) {
        // En el futuro, cuando tengamos el campo is_verified:
        // query = query.eq('is_verified', true);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        console.error("Error fetching professionals:", supabaseError);

        // Mensaje de error más específico según el tipo de error
        let errorMessage =
          "Error al cargar profesionales. Por favor, intenta de nuevo.";

        if (supabaseError.code === "PGRST116") {
          errorMessage =
            "No hay profesionales disponibles en este momento. Intenta más tarde o ajusta tus filtros.";
        } else if (supabaseError.code === "42501") {
          errorMessage =
            "No tienes permisos para ver profesionales. Por favor, inicia sesión.";
        } else if (supabaseError.message?.includes("row-level security")) {
          errorMessage =
            "Problema de permisos. Por favor, contacta a soporte si el problema persiste.";
        }

        setError(errorMessage);
        return;
      }

      // Si no hay resultados, mostrar mensaje informativo en lugar de error
      if (!data || data.length === 0) {
        setProfessionals([]);
        // No establecer error si simplemente no hay resultados (solo aplicar filtros muy restrictivos)
        if (selectedCategories.length > 0 || minRating > 0) {
          // Si hay filtros aplicados, es normal que no haya resultados
          console.log(
            "No se encontraron profesionales con los filtros aplicados"
          );
        }
        return;
      }

      setProfessionals(data || []);
    } catch (err: any) {
      console.error("Error in fetchProfessionals:", err);

      // Mensaje de error más amigable
      let errorMessage =
        "Error al cargar profesionales. Por favor, intenta de nuevo.";

      if (
        err?.message?.includes("network") ||
        err?.message?.includes("fetch")
      ) {
        errorMessage =
          "Problema de conexión. Verifica tu internet e intenta de nuevo.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategories, minRating, showVerifiedOnly]);

  // Efecto para cargar profesionales
  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  // Efecto para filtrar y ordenar profesionales
  useEffect(() => {
    let filtered = [...professionals];

    // Ordenamiento
    switch (sortBy) {
      case "calificacion":
        filtered.sort(
          (a, b) =>
            (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0)
        );
        break;
      case "reseñas":
        filtered.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
        break;
      case "nombre":
        filtered.sort((a, b) =>
          (a.full_name || "").localeCompare(b.full_name || "")
        );
        break;
      case "relevancia":
      default:
        // Ordenar por relevancia: primero mejor calificados, luego más reseñas
        filtered.sort((a, b) => {
          const ratingDiff =
            (b.calificacion_promedio || 0) - (a.calificacion_promedio || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return (b.review_count || 0) - (a.review_count || 0);
        });
        break;
    }

    setFilteredProfessionals(filtered);
  }, [professionals, sortBy]);

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setMinRating(0);
    setShowVerifiedOnly(false);
  };

  // Contar resultados
  const resultCount = filteredProfessionals.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section más compacto */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
              Directorio de Profesionales
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6">
              Encuentra técnicos verificados y de confianza en tu zona
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
                <FontAwesomeIcon
                  icon={faStar}
                  className="mr-1.5 sm:mr-2 text-yellow-300 text-xs sm:text-sm"
                />
                <span>Técnicos Verificados</span>
              </div>
              <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="mr-1.5 sm:mr-2 text-xs sm:text-sm"
                />
                <span>+{resultCount} Profesionales</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Barra Lateral de Filtros */}
          <div className="lg:col-span-1">
            {/* Botón de Filtros para Móvil */}
            <div className="lg:hidden mb-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 px-3 py-2.5 rounded-lg font-medium flex items-center justify-between shadow-sm border border-gray-200 text-sm"
              >
                <span className="flex items-center">
                  <FontAwesomeIcon icon={faSort} className="mr-2 text-xs" />
                  {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                </span>
                <FontAwesomeIcon
                  icon={showFilters ? faChevronUp : faChevronDown}
                  className="text-xs"
                />
              </button>
            </div>

            {/* Sidebar de Filtros */}
            <div className={`${showFilters ? "block" : "hidden lg:block"}`}>
              <FilterSidebar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                minRating={minRating}
                onMinRatingChange={setMinRating}
                showVerifiedOnly={showVerifiedOnly}
                onShowVerifiedOnlyChange={setShowVerifiedOnly}
                onClearFilters={handleClearFilters}
                resultCount={resultCount}
              />
            </div>
          </div>

          {/* Área de Resultados */}
          <div className="lg:col-span-3">
            {/* Header de Resultados más compacto */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 mb-4 sm:mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">
                    {resultCount > 0 ? (
                      <>
                        Encontramos {resultCount} profesional
                        {resultCount !== 1 ? "es" : ""}
                      </>
                    ) : (
                      "No se encontraron profesionales"
                    )}
                  </h2>
                  {selectedCategories.length > 0 && (
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      Filtrando por: {selectedCategories.join(", ")}
                    </p>
                  )}
                </div>

                {/* Dropdown de Ordenamiento más compacto */}
                {resultCount > 0 && (
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <FontAwesomeIcon
                      icon={faSort}
                      className="text-gray-400 text-xs sm:text-sm hidden sm:block"
                    />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-xs sm:text-sm flex-1 sm:flex-none"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Banner de Feature Gating más compacto */}
            {isFreeUser && resultCount > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg p-4 sm:p-5 mb-4 sm:mb-5 shadow-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FontAwesomeIcon
                      icon={faStar}
                      className="text-yellow-500 text-xl sm:text-2xl"
                    />
                  </div>
                  <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">
                      Desbloquea todos los profesionales
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
                      Con un plan Premium puedes ver los perfiles completos y
                      contactar a los técnicos mejor calificados de forma
                      inmediata.
                    </p>
                    <Link
                      href="/membresia"
                      className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md text-xs sm:text-sm"
                    >
                      Ver Planes Premium
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12 sm:py-16">
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  size="2x"
                  className="text-blue-600 mb-3 sm:mb-4"
                />
                <p className="text-gray-700 text-sm sm:text-base">
                  Cargando profesionales...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-5 mb-4 sm:mb-5">
                <p className="text-red-800 font-semibold mb-2 text-sm sm:text-base">
                  Error
                </p>
                <p className="text-red-700 mb-3 sm:mb-4 text-xs sm:text-sm">
                  {error}
                </p>
                <button
                  onClick={fetchProfessionals}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm"
                >
                  Intentar de nuevo
                </button>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !error && resultCount === 0 && (
              <div className="text-center py-12 sm:py-16 bg-white rounded-lg shadow-sm">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-gray-400 text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4"
                />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  No se encontraron profesionales
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                  Intenta ajustar tus filtros o realizar una búsqueda diferente.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}

            {/* Grid de Resultados optimizado para móvil */}
            {!isLoading && !error && resultCount > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {filteredProfessionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.user_id}
                    professional={professional}
                  />
                ))}
              </div>
            )}

            {/* Mensaje de Límite de Resultados */}
            {resultCount >= 50 && (
              <div className="mt-6 sm:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-center">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>
                    Mostrando los primeros {resultCount} resultados.
                  </strong>{" "}
                  Usa los filtros para refinar tu búsqueda y encontrar el
                  profesional perfecto.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
