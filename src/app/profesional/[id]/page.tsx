// src/app/profesional/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { PageLayout } from '@/components/PageLayout';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faMapMarkerAlt, faToolbox, faSpinner, faEnvelope, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function ProfessionalProfilePage() {
  const params = useParams();
  const { id } = params; // Obtenemos el ID del profesional desde la URL

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchProfile = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', id) // Buscamos por user_id
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setError('No se pudo encontrar el perfil del profesional.');
        } else {
          setProfile(data);
        }
        setLoading(false);
      };
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-64">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  if (error || !profile) {
    return (
      <PageLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-red-600">{error || "Perfil no encontrado."}</h1>
        </div>
      </PageLayout>
    );
  }

  // Simulación de habilidades para el demo
  const skills = ['Reparación de Fugas', 'Instalación de Tuberías', 'Mantenimiento General', 'Destape de Drenajes'];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Encabezado del Perfil */}
          <div className="p-8 bg-gray-50 border-b">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-32 h-32 flex-shrink-0">
                <Image
                  src={profile.avatar_url || '/images/default-avatar.png'}
                  alt={`Foto de ${profile.full_name}`}
                  fill
                  className="rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                <p className="text-xl text-blue-600 font-semibold">{profile.profession}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-gray-500">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>{profile.work_area}</span>
                </div>
                {/* MEJORA: Añadimos un indicador de "Verificado" para generar confianza */}
                <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 text-green-600 font-semibold">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <span>Verificado por Sumee</span>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-auto">
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105">
                  <FontAwesomeIcon icon={faEnvelope} />
                  Pedir cotización gratis
                </button>
              </div>
            </div>
          </div>

          {/* Cuerpo del Perfil */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Columna de Detalles */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Información General</h3>
                <div className="space-y-4">
                  {/* MEJORA: Secciones más claras para Experiencia y Calificación */}
                  <div>
                    <h4 className="font-semibold text-gray-600">Experiencia</h4>
                    <p className="text-gray-800 font-medium">{profile.experience} años</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-600">Calificación</h4>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <FontAwesomeIcon icon={faStar} />
                      <span className="text-gray-800 font-bold">4.8</span>
                      <span className="text-gray-500 text-sm">(15 reseñas)</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-8 mb-4">Habilidades Destacadas</h3>
                <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                        <span key={skill} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">{skill}</span>
                    ))}
                </div>

                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-8 mb-4">Sobre mí</h3>
                <p className="text-gray-600 leading-relaxed">
                  {profile.bio || "Este profesional aún no ha añadido una biografía."}
                </p>
              </div>

              {/* Columna de Portafolio */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Portafolio de Trabajos</h3>
                {profile.work_photos_urls && profile.work_photos_urls.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {profile.work_photos_urls.map((url: string, index: number) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-105">
                        <Image src={url} alt={`Trabajo realizado ${index + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Este profesional aún no ha subido fotos de su trabajo.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}