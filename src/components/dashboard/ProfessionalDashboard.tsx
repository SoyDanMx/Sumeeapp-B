'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSpinner, faBriefcase, faImage } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';

// ✅ CORRECCIÓN 1: Importamos el tipo Profile desde la fuente centralizada para evitar
// el error de tipos duplicados. Asumimos que esta importación existe en tu proyecto.
import type { Profile } from '@/types'; 


// ⚠️ NOTA: El componente padre (dashboard/page.tsx) garantiza que la propiedad 'profession'
// no es null cuando llama a ProfessionalDashboard, usando el tipo 'GuaranteedProfessionalProfile'.
// Por lo tanto, podemos definir las props asumiendo un Profile válido.
interface ProfessionalDashboardProps {
  profile: Profile;
  user: User;
}

// Sub-componente para la barra de progreso del perfil (Gamificación)
const ProfileProgressBar = ({ profile }: { profile: Profile }) => {
  // Aseguramos que 'work_zones' y 'work_photos_urls' son arrays para usar .length
  const workZonesLength = profile.work_zones?.length || 0;
  const workPhotosLength = profile.work_photos_urls?.length || 0;
    
  const completionSteps = [
    !!profile.avatar_url,
    !!profile.bio,
    workZonesLength > 0,
    workPhotosLength > 0,
  ];
  const completedCount = completionSteps.filter(Boolean).length;
  const progress = (completedCount / completionSteps.length) * 100;

  return (
    <div className="mb-8 p-4 bg-white rounded-xl shadow-md border">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-lg font-semibold text-gray-700">Progreso de tu Perfil</h3>
        <span className="text-lg font-bold text-blue-600">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        {progress < 100 ? '¡Completa tu perfil para atraer a más clientes!' : '¡Excelente! Tu perfil está completo.'}
      </p>
    </div>
  );
};

export const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ profile: initialProfile, user }) => {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [loading, setLoading] = useState(false);
  
  // Sincroniza el estado si el perfil inicial cambia (necesario si el padre actualiza el perfil)
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const handleStatusToggle = async () => {
    // Evita el doble click si ya está cargando
    if (loading) return; 

    const newStatus = profile.status === 'active' ? 'inactive' : 'active';
    setLoading(true);
    
    const { data, error } = await (supabase
      .from('profiles') as any)
      .update({ status: newStatus })
      .eq('user_id', profile.user_id)
      .select()
      .single();

    if (error) {
      // ✅ CORRECCIÓN 2: Reemplazamos alert() con console.error() para una mejor UX.
      console.error('Error al actualizar el estatus:', error.message);
      // Opcional: podrías mostrar un toast o un modal de error aquí.
    } else if (data) {
      setProfile(data as Profile);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Panel de Profesional</h2>
          <p className="text-gray-600 mt-1">Gestiona tu perfil y encuentra nuevas oportunidades.</p>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <span className="font-semibold text-gray-700">Disponibilidad:</span>
          {/* Toggle de Estatus */}
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={profile.status === 'active'} 
              onChange={handleStatusToggle} 
              className="sr-only peer" 
              disabled={loading} 
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-green-500 transition-colors duration-300">
              <div className={`absolute left-0 top-0.5 bg-white border-gray-300 border rounded-full h-5 w-5 transition-transform duration-300 ${profile.status === 'active' ? 'translate-x-full border-white' : ''}`}>
              </div>
            </div>
            {loading && <FontAwesomeIcon icon={faSpinner} spin className="ml-2 text-blue-500" />}
          </label>
        </div>
      </div>

      <ProfileProgressBar profile={profile} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna de Perfil (Detalle) */}
        <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                        {/* ⚠️ CORRECCIÓN: Usar una ruta local para el fallback del avatar. */}
                        {/* DEBES colocar un archivo 'default-avatar.png' en tu carpeta /public/images. */}
                        <Image 
                          src={profile.avatar_url || '/images/default-avatar.png'} 
                          alt="Foto de perfil" 
                          fill 
                          className="rounded-full object-cover border-4 border-blue-100" 
                        />
                    </div>
                    <h3 className="text-xl font-bold">{profile.full_name}</h3>
                    <p className="text-blue-600 font-semibold">{profile.profession}</p>
                    <button className="mt-4 text-sm text-blue-600 font-semibold hover:underline flex items-center justify-center mx-auto">
                      <FontAwesomeIcon icon={faEdit} className="mr-2 text-xs" />
                      Editar Perfil (Próximamente)
                    </button>
                </div>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="font-semibold text-gray-700 mb-2">Biografía</h3>
                <p className="text-gray-600 text-sm">{profile.bio || 'Aún no has añadido una biografía.'}</p>
                <h3 className="font-semibold text-gray-700 mt-4 mb-2">Zonas de Trabajo</h3>
                <p className="text-gray-600 text-sm">
                  {profile.work_zones?.length ? profile.work_zones.join(', ') : 'No has definido zonas de trabajo.'}
                </p>
            </div>
        </div>

        {/* Columna de Leads y Portafolio */}
        <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Nuevos Prospectos (Leads)</h3>
                <div className="text-center py-10 border-2 border-dashed rounded-lg bg-gray-50/50">
                    <FontAwesomeIcon icon={faBriefcase} className="text-4xl text-gray-400 mb-3" />
                    <p className="text-gray-500 font-semibold">Aún no tienes nuevos prospectos.</p>
                    <p className="text-sm text-gray-400">Cuando un cliente te contacte, aparecerá aquí.</p>
                </div>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Portafolio de Trabajos</h3>
                {profile.work_photos_urls && profile.work_photos_urls.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {profile.work_photos_urls.map((url: string) => (
                        <div key={url} className="relative aspect-square overflow-hidden">
                          <Image 
                            src={url} 
                            alt="Trabajo realizado" 
                            fill 
                            className="rounded-md object-cover hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                          />
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg bg-gray-50/50">
                        <FontAwesomeIcon icon={faImage} className="text-4xl text-gray-400 mb-3" />
                        <p className="text-gray-500 font-semibold">Tu portafolio está vacío.</p>
                        <p className="text-sm text-gray-400">Sube fotos de tus trabajos para atraer clientes.</p>
                        <button className="mt-4 text-sm text-blue-600 font-semibold hover:underline flex items-center justify-center mx-auto">
                          <FontAwesomeIcon icon={faEdit} className="mr-2 text-xs" />
                          Añadir Fotos (Próximamente)
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
