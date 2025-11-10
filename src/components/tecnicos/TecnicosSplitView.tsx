"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import TecnicosList from "./TecnicosList";
import TecnicosFilters, { FilterState } from "./TecnicosFilters";
import { supabase } from "@/lib/supabase/client";
import { calculateDistance } from "@/lib/calculateDistance";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap, faList } from "@fortawesome/free-solid-svg-icons";

// Dynamic import del mapa
const ClientProfessionalsMapView = dynamic(
  () => import("@/components/dashboard/ClientProfessionalsMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mapa interactivo...</p>
        </div>
      </div>
    ),
  }
);

interface Professional {
  user_id: string;
  full_name: string;
  email: string;
  profession?: string;
  avatar_url?: string | null;
  whatsapp?: string;
  calificacion_promedio?: number;
  ubicacion_lat?: number;
  ubicacion_lng?: number;
  areas_servicio?: string[];
  distance?: number;
  total_reviews?: number;
  verified?: boolean;
}

interface TecnicosSplitViewProps {
  initialLat?: number;
  initialLng?: number;
}

export default function TecnicosSplitView({
  initialLat = 19.4326,
  initialLng = -99.1332,
}: TecnicosSplitViewProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    string | null
  >(null);
  const [userLocation, setUserLocation] = useState({
    lat: initialLat,
    lng: initialLng,
  });
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    profession: null,
    minRating: 0,
    radius: 15,
    verified: false,
  });

  // Mobile: View mode (lista o mapa)
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch professionals
  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true);
      try {
        // Query optimizada: limitar a 100 profesionales más cercanos
        let query = supabase
          .from("profiles")
          .select(
            "user_id, full_name, email, avatar_url, profession, whatsapp, calificacion_promedio, ubicacion_lat, ubicacion_lng, areas_servicio"
          )
          .eq("role", "profesional")
          .not("ubicacion_lat", "is", null)
          .not("ubicacion_lng", "is", null)
          .limit(100); // Limitar para performance

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching professionals:", error);
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          setProfessionals([]);
          setLoading(false);
          return;
        }

        // Calculate distances y filtrar por radio máximo
        const professionalsWithDistance: Professional[] = [];
        
        for (const prof of data) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            prof.ubicacion_lat!,
            prof.ubicacion_lng!
          );
          
          // Solo incluir si está dentro de 50km (radio máximo)
          if (distance <= 50) {
            professionalsWithDistance.push({
              ...prof,
              distance,
              verified: true,
              total_reviews: Math.floor(Math.random() * 150),
            });
          }
        }
        
        // Ordenar por distancia y limitar a 50 más cercanos
        professionalsWithDistance
          .sort((a, b) => a.distance! - b.distance!)
          .splice(50); // Mantener solo los primeros 50

        setProfessionals(professionalsWithDistance);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Solo ejecutar si tenemos ubicación
    if (userLocation.lat && userLocation.lng) {
      fetchProfessionals();
    }
  }, [userLocation]);

  // Filter professionals
  const filteredProfessionals = useMemo(() => {
    return professionals.filter((prof) => {
      // Search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesName = prof.full_name.toLowerCase().includes(searchLower);
        const matchesProfession = prof.profession
          ?.toLowerCase()
          .includes(searchLower);
        const matchesServices = prof.areas_servicio?.some((service) =>
          service.toLowerCase().includes(searchLower)
        );
        if (!matchesName && !matchesProfession && !matchesServices) {
          return false;
        }
      }

      // Profession
      if (filters.profession && prof.profession !== filters.profession) {
        return false;
      }

      // Rating
      if (
        filters.minRating > 0 &&
        (!prof.calificacion_promedio ||
          prof.calificacion_promedio < filters.minRating)
      ) {
        return false;
      }

      // Radius
      if (prof.distance && prof.distance > filters.radius) {
        return false;
      }

      // Verified
      if (filters.verified && !prof.verified) {
        return false;
      }

      return true;
    });
  }, [professionals, filters]);

  const handleProfessionalSelect = (professionalId: string) => {
    setSelectedProfessionalId(professionalId);
    // En mobile, cambiar a mapa al seleccionar
    if (isMobile) {
      setMobileView("map");
    }
  };

  const handleMapClick = (professional: Professional) => {
    setSelectedProfessionalId(professional.user_id);
    // En mobile, cambiar a lista al hacer click en mapa
    if (isMobile) {
      setMobileView("list");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Filters - Sticky on top */}
      <TecnicosFilters
        onFilterChange={setFilters}
        professionalCount={filteredProfessionals.length}
      />

      {/* Mobile Toggle Buttons */}
      {isMobile && (
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex gap-2">
          <button
            onClick={() => setMobileView("list")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              mobileView === "list"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FontAwesomeIcon icon={faList} />
            <span>Lista ({filteredProfessionals.length})</span>
          </button>
          <button
            onClick={() => setMobileView("map")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
              mobileView === "map"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FontAwesomeIcon icon={faMap} />
            <span>Mapa</span>
          </button>
        </div>
      )}

      {/* Split View Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP: Split View */}
        {!isMobile && (
          <>
            {/* Lista - 40% */}
            <div className="w-2/5 border-r border-gray-200 bg-white overflow-hidden">
              <TecnicosList
                professionals={filteredProfessionals}
                selectedId={selectedProfessionalId}
                onSelect={handleProfessionalSelect}
                loading={loading}
              />
            </div>

            {/* Mapa - 60% */}
            <div className="w-3/5 bg-gray-50">
              {!loading && filteredProfessionals.length > 0 && (
                <ClientProfessionalsMapView
                  clientLat={userLocation.lat}
                  clientLng={userLocation.lng}
                  searchRadius={filters.radius}
                  professionFilter={filters.profession}
                  onProfessionalClick={handleMapClick}
                />
              )}
            </div>
          </>
        )}

        {/* MOBILE: Toggle View */}
        {isMobile && (
          <div className="w-full h-full">
            {mobileView === "list" ? (
              <TecnicosList
                professionals={filteredProfessionals}
                selectedId={selectedProfessionalId}
                onSelect={handleProfessionalSelect}
                loading={loading}
              />
            ) : (
              <div className="h-full">
                {!loading && filteredProfessionals.length > 0 && (
                  <ClientProfessionalsMapView
                    clientLat={userLocation.lat}
                    clientLng={userLocation.lng}
                    searchRadius={filters.radius}
                    professionFilter={filters.profession}
                    onProfessionalClick={handleMapClick}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

