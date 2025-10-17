'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types'; // <-- Tipo Profile que probablemente define profession: string | null

// 2. IMPORTAMOS LOS COMPONENTES QUE HEMOS EXTRAÍDO
import { MembershipCTA } from '@/components/dashboard/MembershipCTA';
import { ProfessionalSearch } from '../../components/dashboard/ProfessionalSearch';
import { ProfessionalDashboard } from '@/components/dashboard/ProfessionalDashboard';


// ⚠️ CORRECCIÓN DE ERROR DE TIPADO:
// Definimos un tipo auxiliar para cuando SABEMOS que el perfil tiene una profesión.
// Esto elimina el error "Type 'null' is not assignable to type 'string'" al pasar las props.
type GuaranteedProfessionalProfile = Omit<Profile, 'profession'> & {
  profession: string;
};


export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Si no hay sesión o hubo un error al obtenerla, redirigir al login
      if (!session || sessionError) {
        router.push('/login');
        return;
      }
      
      setUser(session.user);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      // Si no se encuentra el perfil o hay un error, redirigir a login
      if (profileError || !profileData) {
        console.error('Error al obtener el perfil, cerrando sesión:', profileError?.message);
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }
      
      setProfile(profileData as Profile);
      setLoading(false);
    };
    
    fetchSessionAndProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-lg font-semibold text-gray-700">Cargando tu panel...</p>
        <p className="text-gray-500 mt-2">Un momento, por favor.</p>
      </div>
    );
  }
  
  // Estado para cuando la carga finaliza pero no hay datos
  if (!profile || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <p className="font-semibold text-red-600">Hubo un problema al cargar tus datos.</p>
          <p className="text-gray-600 mt-2">Por favor, intenta <a href="/login" className="text-blue-600 hover:underline">iniciar sesión</a> de nuevo.</p>
        </div>
      </div>
    );
  }

  // Lógica de diferenciación
  // 'isProfessional' es true si la profesión NO es null, vacío o undefined.
  const isProfessional = !!profile.profession;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mi Panel</h1>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              ¡Bienvenido de nuevo, {profile.full_name}!
            </h2>
            
            {/* El renderizado condicional */}
            {isProfessional ? (
              // ⭐️ CORRECCIÓN APLICADA AQUÍ: 
              // Usamos Type Assertion para decirle a TS: "Ya verificamos que 'profession' no es null, 
              // por lo tanto, trata 'profile' como un 'GuaranteedProfessionalProfile'".
              <ProfessionalDashboard 
                profile={profile as GuaranteedProfessionalProfile} 
                user={user} 
              />
            ) : (
              // Si es un cliente, decidimos si puede buscar o necesita pagar
              <>
                {profile.membership_status === 'basic' ? (
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