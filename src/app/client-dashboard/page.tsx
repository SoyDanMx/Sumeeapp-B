"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Profesional } from "@/types/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faUser,
  faCrown,
  faFilter,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faTimes,
  faStar,
  faClock,
  faShieldAlt,
  faArrowRight,
  faUsers,
  faThumbsUp,
  faPhone,
  faZap,
} from "@fortawesome/free-solid-svg-icons";
import ProfessionalVerificationID from "@/components/ProfessionalVerificationID";

// Carga dinámica del mapa para clientes
const DynamicClientMapComponent = dynamic(
  () => import("@/components/ClientMapComponent"),
  {
    loading: () => (
      <div className="p-8 text-center text-gray-500">Cargando mapa...</div>
    ),
    ssr: false,
  }
);

export default function ClientDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [selectedProfesional, setSelectedProfesional] =
    useState<Profesional | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userMembership, setUserMembership] = useState<string>("free");
  const [selectedService, setSelectedService] = useState<string>("Todos");

  // Servicios disponibles para filtrar - Lista completa
  const services = [
    "Todos",
    "Electricistas",
    "CCTV y Alarmas",
    "Redes WiFi",
    "Plomeros",
    "Pintores",
    "Aire Acondicionado",
    "Limpieza",
    "Jardinería",
    "Carpintería",
    "Construcción",
    "Tablaroca",
    "Fumigación",
  ];

  useEffect(() => {
    const fetchUserAndProfessionals = async () => {
      try {
        // Obtener usuario actual
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        setUser(user);

        // Verificar membresía del usuario desde la base de datos
        if (user) {
          try {
            // Para usuarios de prueba, permitir acceso premium automáticamente
            const testEmails = [
              "cliente@sumeeapp.com",
              "test@sumeeapp.com",
              "demo@sumeeapp.com",
            ];
            const isTestUser = testEmails.includes(user.email || "");

            if (isTestUser) {
              setUserMembership("premium");
            } else {
              // Intentar obtener el perfil desde la base de datos
              const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("membership_status, role")
                .eq("user_id", user.id)
                .single();

              if (profileError) {
                console.warn(
                  "Profile not found or error:",
                  profileError.message
                );
                setUserMembership("free");
              } else {
                setUserMembership(
                  profile?.membership_status === "premium" ? "premium" : "free"
                );
              }
            }
          } catch (profileErr: any) {
            // Si hay error al obtener el perfil, usar configuración por defecto
            console.warn(
              "Error getting profile:",
              profileErr?.message || profileErr
            );
            setUserMembership("free");
          }
        } else {
          setUserMembership("free");
        }

        if (user) {
          try {
            // Obtener profesionales verificados - intentar primero desde 'profesionales' y luego desde 'profiles'
            let profesionalesData = null;
            let profesionalesError = null;

            // Intentar desde tabla 'profesionales' primero
            const profesionalesResult = await supabase
              .from("profesionales")
              .select("*")
              .eq("activo", true)
              .not("ubicacion_lat", "is", null)
              .not("ubicacion_lng", "is", null);

            if (profesionalesResult.error) {
              console.warn(
                "Error loading from profesionales table, trying profiles:",
                profesionalesResult.error.message
              );

              // Fallback a tabla 'profiles' si 'profesionales' falla
              const profilesResult = await supabase
                .from("profiles")
                .select("*")
                .eq("role", "profesional")
                .not("ubicacion_lat", "is", null)
                .not("ubicacion_lng", "is", null);

              if (profilesResult.error) {
                console.warn(
                  "Error loading from profiles table too:",
                  profilesResult.error.message
                );
                setProfesionales([]);
              } else {
                setProfesionales(profilesResult.data || []);
              }
            } else {
              setProfesionales(profesionalesResult.data || []);
            }
          } catch (profErr: any) {
            console.warn(
              "Error in professionals query:",
              profErr?.message || profErr
            );
            setProfesionales([]);
          }
        }
      } catch (err: any) {
        console.error("Main error in fetchUserAndProfessionals:", {
          message: err?.message || "Unknown error",
          error: err,
          stack: err?.stack,
        });
        setError(err?.message || "Error al cargar los datos del dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndProfessionals();
  }, []);

  // Función para normalizar nombres de servicios
  const normalizeServiceName = (name: string) => {
    const mappings: { [key: string]: string[] } = {
      Electricistas: ["electricista", "electricidad"],
      "CCTV y Alarmas": ["cctv", "alarma", "seguridad"],
      "Redes WiFi": ["wifi", "red", "redes"],
      Plomeros: ["plomero", "plomería"],
      Pintores: ["pintor", "pintura"],
      "Aire Acondicionado": ["aire", "a.c.", "hvac", "clima"],
      Limpieza: ["limpieza", "limpiador"],
      Jardinería: ["jardinería", "jardín"],
      Carpintería: ["carpintería", "carpintero"],
      Construcción: ["construcción", "constructor"],
      Tablaroca: ["tablaroca", "drywall"],
      Fumigación: ["fumigación", "fumigador", "plaga"],
    };

    return mappings[name] || [name.toLowerCase()];
  };

  const filteredProfesionales =
    selectedService === "Todos"
      ? profesionales
      : profesionales.filter((p) => {
          const serviceKeywords = normalizeServiceName(selectedService);

          // Buscar en profession
          const professionMatch =
            p.profession &&
            serviceKeywords.some((keyword) =>
              p.profession!.toLowerCase().includes(keyword)
            );

          // Buscar en areas_servicio
          const areasMatch = p.areas_servicio?.some((area) =>
            serviceKeywords.some((keyword) =>
              area.toLowerCase().includes(keyword)
            )
          );

          return professionMatch || areasMatch;
        });

  // Calcular promedio de calificación
  const averageRating =
    profesionales.length > 0
      ? profesionales.reduce(
          (sum, p) => sum + (p.calificacion_promedio || 5),
          0
        ) / profesionales.length
      : 5;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-5xl text-blue-600 mb-4"
            />
            <div className="absolute inset-0 bg-blue-200 rounded-full blur-xl opacity-50"></div>
          </div>
          <p className="text-gray-700 font-medium mt-4">
            Cargando tu dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-3xl text-red-600"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Oops, algo salió mal
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faUser} className="text-4xl text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Acceso Restringido
          </h1>
          <p className="text-gray-600 mb-8">
            Necesitas iniciar sesión para acceder al dashboard de clientes
            premium.
          </p>
          <Link
            href="/login"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (userMembership === "free") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30"></div>

          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FontAwesomeIcon icon={faCrown} className="text-5xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              ¡Desbloquea tu Acceso Premium!
            </h1>
            <p className="text-gray-700 mb-2 text-lg">
              Accede a profesionales verificados y de alta calidad
            </p>
            <div className="flex flex-col space-y-2 mb-8 text-left bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-500"
                />
                <span className="text-gray-700">
                  Acceso ilimitado a profesionales
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-500"
                />
                <span className="text-gray-700">
                  Contacto directo con técnicos
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-green-500"
                />
                <span className="text-gray-700">
                  Garantía de calidad verificada
                </span>
              </div>
            </div>
            <Link
              href="/pago-de-servicios"
              className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            >
              Configurar Método de Pago
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header Mejorado con Gradiente */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">Dashboard Premium</h1>
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                  <FontAwesomeIcon icon={faCrown} />
                  <span>PREMIUM</span>
                </div>
              </div>
              <p className="text-white/90 text-lg">
                Encuentra profesionales verificados cerca de ti
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Badge de Confianza */}
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon
                    icon={faShieldAlt}
                    className="text-yellow-300"
                  />
                  <span className="text-sm font-medium">100% Verificados</span>
                </div>
              </div>
              {/* Botón de Ayuda */}
              <Link
                href="/help"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 transition-all"
              >
                <FontAwesomeIcon icon={faPhone} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Mejoradas con Animaciones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Profesionales Disponibles */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="text-white text-xl"
                  />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">
                    {filteredProfesionales.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    disponibles ahora
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">
                Profesionales Disponibles
              </p>
            </div>
          </div>

          {/* Calificación Promedio */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon
                    icon={faStar}
                    className="text-white text-xl"
                  />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                  </p>
                  <div className="flex items-center space-x-1 mt-1 justify-end">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesomeIcon
                        key={star}
                        icon={faStar}
                        className={`text-xs ${
                          star <= Math.round(averageRating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">
                Calificación Promedio
              </p>
            </div>
          </div>

          {/* Todos Verificados */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-white text-xl"
                  />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">100%</p>
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    ✓ Verificados
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">
                Profesionales Verificados
              </p>
            </div>
          </div>

          {/* Respuesta Rápida */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-200 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon
                    icon={faZap}
                    className="text-white text-xl"
                  />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">&lt;2h</p>
                  <p className="text-xs text-purple-600 font-semibold mt-1">
                    Tiempo respuesta
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">
                Respuesta Rápida
              </p>
            </div>
          </div>
        </div>

        {/* Banner de Confianza */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center space-x-2">
                <FontAwesomeIcon icon={faShieldAlt} />
                <span>Garantía de Calidad Sumee</span>
              </h3>
              <p className="text-white/90">
                Todos nuestros profesionales están verificados y cuentan con
                experiencia comprobada
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-xs text-white/80">Satisfacción</div>
              </div>
              <div className="h-12 w-px bg-white/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-xs text-white/80">Trabajos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Mejorados */}
        <div className="bg-white rounded-xl shadow-lg mb-6 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faFilter} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Filtrar por Servicio
                </h3>
                <p className="text-sm text-gray-600">
                  Encuentra el profesional perfecto para tu necesidad
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2 md:gap-3">
              {services.map((service) => (
                <button
                  key={service}
                  onClick={() => setSelectedService(service)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    selectedService === service
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Mostrando{" "}
                <span className="font-bold text-gray-900">
                  {filteredProfesionales.length}
                </span>{" "}
                profesional{filteredProfesionales.length !== 1 ? "es" : ""}
                {selectedService !== "Todos" && (
                  <span>
                    {" "}
                    en{" "}
                    <span className="font-bold text-blue-600">
                      {selectedService}
                    </span>
                  </span>
                )}
              </p>
              {filteredProfesionales.length > 0 && (
                <Link
                  href="/solicitudes/nueva"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                >
                  <span>Crear solicitud</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mapa Mejorado */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-white"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Mapa de Profesionales
                  </h3>
                  <p className="text-sm text-gray-600">
                    Haz clic en un marcador para ver detalles
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-[500px] md:h-[600px] relative">
            <DynamicClientMapComponent
              profesionales={filteredProfesionales}
              selectedProfesional={selectedProfesional}
              onProfesionalClick={setSelectedProfesional}
            />
          </div>
        </div>
      </div>

      {/* Sidebar para mostrar detalles del profesional seleccionado */}
      {selectedProfesional && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedProfesional(null)}
          />

          {/* Sidebar mejorado */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="h-full flex flex-col">
              {/* Header del sidebar mejorado */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <h3 className="text-lg font-bold">Verificación ID</h3>
                </div>
                <button
                  onClick={() => setSelectedProfesional(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-white" />
                </button>
              </div>

              {/* Contenido del sidebar */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                <ProfessionalVerificationID profesional={selectedProfesional} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
