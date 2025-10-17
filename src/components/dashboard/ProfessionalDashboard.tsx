// src/components/dashboard/ProfessionalDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faEdit, faSpinner, faCheckCircle, faBriefcase, faImage } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';

// Interfaz de TypeScript para un perfil de profesional
interface Profile {
  user_id: string;
  full_name: string;
  profession: string;
  bio: string | null;
  avatar_url: string | null;
  work_zones: string[] | null;
  status: 'active' | 'inactive';
  work_photos_urls: string[] | null;
}

interface ProfessionalDashboardProps {
  profile: Profile;
  user: User;
}

// Sub-componente para la barra de progreso del perfil (Gamificación)
const ProfileProgressBar = ({ profile }: { profile: Profile }) => {
  const completionSteps = [
    !!profile.avatar_url,
    !!profile.bio,
    !!(profile.work_zones && profile.work_zones.length > 0),
    !!(profile.work_photos_urls && profile.work_photos_urls.length > 0),
  ];
  const completedCount = completionSteps.filter(Boolean).length;
  const progress = (completedCount / completionSteps.length) * 100;

  return (
    <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border">
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
  
  // Sincroniza el estado si el perfil inicial cambia
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const handleStatusToggle = async () => {
    const newStatus = profile.status === 'active' ? 'inactive' : 'active';
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('user_id', profile.user_id)
      .select()
      .single();

    if (error) {
      alert('Error al actualizar el estatus.');
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
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={profile.status === 'active'} onChange={handleStatusToggle} className="sr-only peer" disabled={loading} />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-green-500">
              <div className="peer-checked:translate-x-full peer-checked:border-white absolute left-0 top-0.5 bg-white border-gray-300 border rounded-full h-5 w-5 transition-all"></div>
            </div>
          </label>
        </div>
      </div>

      <ProfileProgressBar profile={profile} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna de Perfil */}
        <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                        <Image src={profile.avatar_url || '/images/default-avatar.png'} alt="Foto de perfil" fill className="rounded-full object-cover" />
                    </div>
                    <h3 className="text-xl font-bold">{profile.full_name}</h3>
                    <p className="text-blue-600 font-semibold">{profile.profession}</p>
                    <button className="mt-4 text-sm text-blue-600 font-semibold hover:underline">Editar Perfil (Próximamente)</button>
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-700 mb-2">Biografía</h3>
                <p className="text-gray-600 text-sm">{profile.bio || 'Aún no has añadido una biografía.'}</p>
            </div>
        </div>

        {/* Columna de Leads y Portafolio */}
        <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Nuevos Prospectos (Leads)</h3>
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <FontAwesomeIcon icon={faBriefcase} className="text-4xl text-gray-400 mb-3" />
                    <p className="text-gray-500 font-semibold">Aún no tienes nuevos prospectos.</p>
                    <p className="text-sm text-gray-400">Cuando un cliente te contacte, aparecerá aquí.</p>
                </div>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Portafolio de Trabajos</h3>
                {profile.work_photos_urls && profile.work_photos_urls.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                    {profile.work_photos_urls.map((url: string) => (
                        <div key={url} className="relative aspect-square"><Image src={url} alt="Trabajo realizado" fill className="rounded-md object-cover"/></div>
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <FontAwesomeIcon icon={faImage} className="text-4xl text-gray-400 mb-3" />
                        <p className="text-gray-500 font-semibold">Tu portafolio está vacío.</p>
                        <p className="text-sm text-gray-400">Sube fotos de tus trabajos para atraer clientes.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};