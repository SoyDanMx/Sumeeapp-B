// src/app/dashboard/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faSearch, faToolbox, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ProfessionalCard } from '@/components/ProfessionalCard';
import dynamic from 'next/dynamic';

// Cargamos el componente del mapa de forma dinámica para evitar errores de SSR
const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full bg-gray-200 animate-pulse"><p>Cargando mapa...</p></div>
});

// --- Componente CTA con la solución definitiva para el botón de Stripe ---
const MembershipCTA = () => {
  const stripeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;

    script.onload = () => {
      if (stripeContainerRef.current) {
        stripeContainerRef.current.innerHTML = '';
        const stripeBuyButton = document.createElement('stripe-buy-button');
        stripeBuyButton.setAttribute('buy-button-id', 'buy_btn_1RmpzwE2shKTNR9M91kuSgKh');
        stripeBuyButton.setAttribute('publishable-key', 'pk_live_51P8c4AE2shKTNR9MVARQB4La2uYMMc2shlTCcpcg8EI6MqqPV1uN5uj6UbB5mpfReRKd4HL2OP1LoF17WXcYYeB000Ot1l847E');
        stripeContainerRef.current.appendChild(stripeBuyButton);
      }
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="text-center bg-gray-50 p-8 rounded-lg border-2 border-dashed">
      <FontAwesomeIcon icon={faCrown} className="text-5xl text-yellow-500 mb-4" />
      <h3 className="text-2xl font-bold text-gray-800">Desbloquea tu Acceso a los Mejores Profesionales</h3>
      <p className="mt-2 mb-6 text-gray-600 max-w-lg mx-auto">
        Conviértete en miembro Básico para poder buscar y contactar a nuestra red de técnicos certificados en tu zona.
      </p>
      <div ref={stripeContainerRef}></div>
    </div>
  );
};

// --- Componente para la búsqueda de profesionales (FUNCIONAL) ---
const ProfessionalSearch = () => {
  const [service, setService] = useState('');
  const [area, setArea] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const professionalsWithLocation = useMemo(() => results.map((prof) => ({
      ...prof,
      location: {
          lat: 19.4326 + (Math.random() - 0.5) * 0.1,
          lng: -99.1332 + (Math.random() - 0.5) * 0.1,
      }
  })), [results]);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setResults([]);
    let query = supabase.from('profiles').select('*').not('profession', 'is', null);
    if (service) query = query.ilike('profession', `%${service}%`);
    if (area) query = query.ilike('work_area', `%${area}%`);
    const { data, error } = await query;
    if (error) {
      console.error("Error en la búsqueda:", error);
    } else {
      setResults(data || []);
    }
    setLoading(false);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Encuentra un Profesional en CDMX</h3>
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
        <input type="text" placeholder="¿Qué servicio necesitas?" value={service} onChange={(e) => setService(e.target.value)} className="flex-grow text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50" />
        <input type="text" placeholder="¿En qué alcaldía?" value={area} onChange={(e) => setArea(e.target.value)} className="flex-grow text-gray-900 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50" />
        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:bg-blue-400">
          {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSearch} />}
          Encontrar Profesional
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[400px] lg:h-full rounded-lg overflow-hidden shadow-md">
            <MapDisplay professionals={professionalsWithLocation} />
        </div>
        <div className="max-h-[600px] overflow-y-auto pr-2">
            {loading && <p className="text-center text-gray-600">Buscando profesionales...</p>}
            {!loading && searched && results.length === 0 && (
            <p className="text-center text-gray-600 bg-gray-50 p-4 rounded-lg">No se encontraron resultados para tu búsqueda.</p>
            )}
            {!loading && results.length > 0 && (
            <div className="space-y-4">
                {results.map(profile => (
                <ProfessionalCard key={profile.id} profile={profile} />
                ))}
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- Página Principal del Panel ---
export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      const { data: profileData, error } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single();
      if (error) {
        console.error('Error al obtener el perfil:', error);
      } else {
        setProfile(profileData);
      }
      setLoading(false);
    };
    fetchSessionAndProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando tu panel...</div>;
  }

  const isProfessional = profile && profile.profession;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mi Panel</h1>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition">Cerrar Sesión</button>
        </div>
      </header>
      <main className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">¡Bienvenido de nuevo, {profile?.full_name || user?.email}!</h2>
            {isProfessional ? (
              <div className="text-center"><FontAwesomeIcon icon={faToolbox} className="text-5xl text-blue-500 mb-4" /><h3 className="text-2xl font-bold text-gray-800">Panel de Profesional</h3><p className="mt-2 text-gray-600">Aquí podrás gestionar tus servicios y ver nuevas solicitudes de clientes.</p></div>
            ) : (
              <>
                {profile?.membership_status === 'basic' ? (
                  <ProfessionalSearch />
                ) : (
                  <MembershipCTA />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}