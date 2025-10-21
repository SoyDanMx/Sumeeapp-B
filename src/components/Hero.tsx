// src/components/Hero.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faSpinner, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Coyoacán, CDMX');
  const [selectedService, setSelectedService] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Datos mockup para servicios y ubicaciones
  const services = [
    'Electricista', 'Plomero', 'HVAC', 'Pintor', 'Carpintero', 'CCTV'
  ];
  
  const locations = [
    'Coyoacán, CDMX', 'Roma Norte, CDMX', 'Polanco, CDMX', 
    'Condesa, CDMX', 'Santa Fe, CDMX', 'Del Valle, CDMX'
  ];

  useEffect(() => {
    const fetchUserAndMembership = async () => {
      setIsLoadingUser(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoadingUser(false);
    };

    fetchUserAndMembership();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = async () => {
    setIsLoadingUser(true);
    
    if (!searchQuery.trim()) {
      alert('Por favor, describe el servicio que necesitas.');
      setIsLoadingUser(false);
      return;
    }

    if (!user) {
      alert('Por favor, regístrate o inicia sesión para solicitar un servicio.');
      router.push('/login?redirect=/professionals');
    } else {
      const userMembershipStatus = user.user_metadata?.membership_s || 'free';
      
      if (userMembershipStatus === 'free') {
        alert('Necesitas una membresía premium para acceder a los técnicos.');
        router.push('/membresia');
      } else {
        router.push(`/professionals?query=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(selectedLocation)}`);
      }
    }
    setIsLoadingUser(false);
  };

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setSearchQuery(service);
    setIsDropdownOpen(false);
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setIsDropdownOpen(false);
  };

  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center bg-gray-800">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent z-10"></div>
        <img 
          src="https://readdy.ai/api/search-image?query=Professional%20home%20service%20workers%20in%20Latin%20America%20working%20on%20house%20repairs%2C%20plumbing%2C%20and%20electrical%20work.%20A%20diverse%20team%20of%20skilled%20professionals%20with%20tools%2C%20helping%20homeowners.%20Clean%2C%20modern%20homes%20with%20warm%20lighting%20and%20natural%20elements.%20Professional%2C%20trustworthy%20appearance&width=1440&height=600&seq=hero1&orientation=landscape"
          alt="Profesionales de servicios para el hogar trabajando en CDMX"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-20">
        <div className="max-w-4xl text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Plomeros, Electricistas y Más Verificados en CDMX
          </h1>
          <p className="text-lg sm:text-xl mb-8">
            Encuentra técnicos profesionales de confianza para tu hogar en Ciudad de México. 
            Servicios 100% verificados con garantía de satisfacción.
          </p>
          
          {/* Búsqueda Unificada */}
          <div className="bg-white p-6 rounded-xl shadow-2xl" ref={searchRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-lg" />
              </div>
              <input
                id="input-main-search"
                type="text"
                className="w-full pl-12 pr-14 py-4 text-lg border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Busca un electricista, plomero o tu alcaldía..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-auto"
              >
                <FontAwesomeIcon icon={faChevronDown} className="text-gray-400" />
              </button>
            </div>

            {/* Dropdown Mockup */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                <div className="p-4">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Servicios Populares</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {services.map((service, index) => (
                        <button
                          key={index}
                          onClick={() => handleServiceSelect(service)}
                          className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded transition-colors"
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Ubicaciones</h4>
                    <div className="space-y-1">
                      {locations.map((location, index) => (
                        <button
                          key={index}
                          onClick={() => handleLocationSelect(location)}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded transition-colors"
                        >
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-400" />
                          {location}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button 
              onClick={handleSearchSubmit}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center"
              disabled={isLoadingUser}
            >
              {isLoadingUser ? (
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              ) : (
                'Solicitar Servicio'
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}