// src/components/Hero.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Añadido faSpinner para loading
import { useRouter } from 'next/navigation'; // Importar useRouter para redirecciones
import { supabase } from '@/lib/supabaseClient'; // Importar la instancia de Supabase

// Si la imagen de readdy.ai tiene problemas, puedes comentar esta línea y usar una local o un placeholder
// import Image from 'next/image'; // Si usas next/image para el banner, impórtalo

export const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationInput, setLocationInput] = useState(''); // Renombrado para evitar conflicto con la prop 'location' del contexto
  const [isLoadingUser, setIsLoadingUser] = useState(true); // Nuevo estado para la carga del usuario
  const [user, setUser] = useState<any | null>(null); // Estado para almacenar el usuario de Supabase
  const router = useRouter();

  useEffect(() => {
    // Función para obtener el usuario y su estado de membresía
    const fetchUserAndMembership = async () => {
      setIsLoadingUser(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user); // Almacena el objeto completo del usuario
      setIsLoadingUser(false);
    };

    fetchUserAndMembership();

    // Suscribirse a cambios de autenticación para actualizar el estado del usuario
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleFindMyProClick = async () => {
    // Muestra un estado de carga mientras se decide la redirección
    setIsLoadingUser(true); 

    // Aquí no necesitamos esperar de nuevo, ya tenemos el estado del user del useEffect
    // const { data: { user } } = await supabase.auth.getUser(); // Esto sería redundante

    if (!user) {
      // Usuario no registrado: Redirigir a página de registro/login con un mensaje
      alert('Por favor, regístrate o inicia sesión para encontrar un técnico.');
      router.push('/login?redirect=/professionals'); // Puedes redirigir a /login y luego a /professionals
    } else {
      // Usuario registrado, ahora verificar estado de membresía
      // IMPORTANTE: Asegúrate de que 'membership_s' esté en user.user_metadata o en la tabla 'profiles'
      // Si está en 'profiles', necesitas una función de backend para obtenerlo de forma segura.
      // Por simplicidad y asumiendo que está en user_metadata (o que profiles está sincronizado)
      const userMembershipStatus = user.user_metadata?.membership_s || 'free'; 

      if (userMembershipStatus === 'free') {
        // Usuario registrado pero no pagado: Redirigir a página de membresía/pago
        alert('Necesitas una membresía premium para acceder a los técnicos.');
        router.push('/membresia'); // Página donde ofreces los planes de pago
      } else {
        // Usuario registrado y pagado: Redirigir a la página de profesionales
        // Aquí podrías pasar los parámetros de búsqueda si quieres:
        // router.push(`/professionals?query=${searchQuery}&location=${locationInput}`);
        router.push('/professionals');
      }
    }
    setIsLoadingUser(false); // Finaliza el estado de carga
  };

  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center bg-gray-800">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent z-10"></div>
        {/* Usando <img> tag si next/image causó problemas, o ajusta si usas Next.js Image */}
        <img 
          src="https://readdy.ai/api/search-image?query=Professional%20home%20service%20workers%20in%20Latin%20America%20working%20on%20house%20repairs%2C%20plumbing%2C%20and%20electrical%20work.%20A%20diverse%20team%20of%20skilled%20professionals%20with%20tools%2C%20helping%20homeowners.%20Clean%2C%20modern%20homes%20with%20warm%20lighting%20and%20natural%20elements.%20Professional%2C%20trustworthy%20appearance&width=1440&height=600&seq=hero1&orientation=landscape"
          alt="Profesionales de servicios para el hogar trabajando en CDMX"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-20">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Técnicos y Servicios a Domicilio en CDMX</h1>
          <p className="text-lg sm:text-xl mb-8">Encuentra plomeros, electricistas y más profesionales verificados en tu alcaldía. Reparaciones para el hogar, rápido y seguro.</p>
          
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="¿Qué servicio a domicilio necesitas?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  placeholder="Alcaldía o Colonia (ej. Coyoacán)"
                  value={locationInput} // Usar locationInput
                  onChange={(e) => setLocationInput(e.target.value)}
                />
              </div>
              
              {/* Botón "Encontrar mi técnico" */}
              <button 
                onClick={handleFindMyProClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center justify-center"
                disabled={isLoadingUser} // Deshabilitar mientras se carga el estado del usuario
              >
                {isLoadingUser ? (
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                ) : (
                  'Encontrar mi técnico'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}