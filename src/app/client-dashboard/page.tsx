'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase/client';
import { Profesional } from '@/types/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faUser, 
  faCrown, 
  faFilter,
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import ProfessionalVerificationID from '@/components/ProfessionalVerificationID';

// Carga dinámica del mapa para clientes
const DynamicClientMapComponent = dynamic(
  () => import('@/components/ClientMapComponent'), 
  { 
    loading: () => <div className="p-8 text-center text-gray-500">Cargando mapa...</div>,
    ssr: false 
  }
);

export default function ClientDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [selectedProfesional, setSelectedProfesional] = useState<Profesional | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userMembership, setUserMembership] = useState<string>('free');
  const [selectedService, setSelectedService] = useState<string>('Todos');

  // Servicios disponibles para filtrar
  const services = ['Todos', 'Plomería', 'Electricidad', 'HVAC', 'Pintura', 'Carpintería', 'Jardinería'];

  useEffect(() => {
    const fetchUserAndProfessionals = async () => {
      try {
        // Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        setUser(user);
        
        // Verificar membresía del usuario desde la base de datos
        if (user) {
          try {
            // Para usuarios de prueba, permitir acceso premium automáticamente
            const testEmails = ['cliente@sumeeapp.com', 'test@sumeeapp.com', 'demo@sumeeapp.com'];
            const isTestUser = testEmails.includes(user.email || '');
            
            if (isTestUser) {
              setUserMembership('premium');
            } else {
              // Intentar obtener el perfil desde la base de datos
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('membership_status, role')
                .eq('user_id', user.id)
                .single();
                
              if (profileError) {
                console.warn('Profile not found or error:', profileError.message);
                setUserMembership('free');
              } else {
                setUserMembership(profile?.membership_status === 'premium' ? 'premium' : 'free');
              }
            }
          } catch (profileErr: any) {
            // Si hay error al obtener el perfil, usar configuración por defecto
            console.warn('Error getting profile:', profileErr?.message || profileErr);
            setUserMembership('free');
          }
        } else {
          setUserMembership('free');
        }

        if (user) {
          try {
            // Obtener profesionales verificados - intentar primero desde 'profesionales' y luego desde 'profiles'
            let profesionalesData = null;
            let profesionalesError = null;

            // Intentar desde tabla 'profesionales' primero
            const profesionalesResult = await supabase
              .from('profesionales')
              .select('*')
              .eq('activo', true)
              .not('ubicacion_lat', 'is', null)
              .not('ubicacion_lng', 'is', null);

            if (profesionalesResult.error) {
              console.warn('Error loading from profesionales table, trying profiles:', profesionalesResult.error.message);
              
              // Fallback a tabla 'profiles' si 'profesionales' falla
              const profilesResult = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'profesional')
                .not('ubicacion_lat', 'is', null)
                .not('ubicacion_lng', 'is', null);

              if (profilesResult.error) {
                console.warn('Error loading from profiles table too:', profilesResult.error.message);
                setProfesionales([]);
              } else {
                setProfesionales(profilesResult.data || []);
              }
            } else {
              setProfesionales(profesionalesResult.data || []);
            }
          } catch (profErr: any) {
            console.warn('Error in professionals query:', profErr?.message || profErr);
            setProfesionales([]);
          }
        }
      } catch (err: any) {
        console.error('Main error in fetchUserAndProfessionals:', {
          message: err?.message || 'Unknown error',
          error: err,
          stack: err?.stack
        });
        setError(err?.message || 'Error al cargar los datos del dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndProfessionals();
  }, []);

  const filteredProfesionales = selectedService === 'Todos' 
    ? profesionales 
    : profesionales.filter(p => 
        p.areas_servicio?.some(area => 
          area.toLowerCase().includes(selectedService.toLowerCase())
        )
      );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-red-600 mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <FontAwesomeIcon icon={faUser} className="text-6xl text-gray-400 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h1>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para acceder al dashboard de clientes.
          </p>
          <a 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  if (userMembership === 'free') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <FontAwesomeIcon icon={faCrown} className="text-6xl text-yellow-500 mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Membresía Requerida</h1>
          <p className="text-gray-600 mb-6">
            Necesitas una membresía premium para acceder a los profesionales verificados.
          </p>
          <a 
            href="/membresia" 
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Obtener Membresía
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Cliente Premium</h1>
              <p className="text-gray-600">Encuentra profesionales verificados cerca de ti</p>
            </div>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faCrown} className="text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Membresía Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FontAwesomeIcon icon={faUser} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profesionales Disponibles</p>
                <p className="text-2xl font-bold text-gray-900">{filteredProfesionales.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Todos Verificados</p>
                <p className="text-2xl font-bold text-gray-900">100%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cobertura</p>
                <p className="text-2xl font-bold text-gray-900">CDMX</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Filtrar por Servicio</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {services.map(service => (
                <button
                  key={service}
                  onClick={() => setSelectedService(service)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedService === service
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 h-[600px]">
        <DynamicClientMapComponent 
          profesionales={filteredProfesionales}
          selectedProfesional={selectedProfesional}
          onProfesionalClick={setSelectedProfesional}
        />
      </div>

      {/* Sidebar para mostrar detalles del profesional seleccionado */}
      {selectedProfesional && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSelectedProfesional(null)}
          />
          
          {/* Sidebar con tarjeta de verificación */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="h-full flex flex-col">
              {/* Header del sidebar */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Verificación ID</h3>
                <button
                  onClick={() => setSelectedProfesional(null)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
                </button>
              </div>
              
              {/* Contenido del sidebar */}
              <div className="flex-1 overflow-y-auto">
                <ProfessionalVerificationID profesional={selectedProfesional} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
