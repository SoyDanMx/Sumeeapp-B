'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Profesional } from '@/types/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faCheckCircle, 
  faMapMarkerAlt, 
  faPhone,
  faClock,
  faShieldAlt,
  faUsers,
  faCamera,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp as faWhatsappBrand } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';
import Image from 'next/image';

// Componente para mostrar estrellas
const StarRating = ({ rating, reviewCount }: { rating: number; reviewCount?: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center space-x-2">
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400 text-lg" />
        ))}
        {hasHalfStar && (
          <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-lg opacity-50" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FontAwesomeIcon key={i} icon={faStar} className="text-gray-300 text-lg" />
        ))}
      </div>
      <span className="text-lg font-semibold text-gray-900">
        {rating.toFixed(1)}
      </span>
      <span className="text-gray-600">
        ({reviewCount || 0} reseñas)
      </span>
    </div>
  );
};

// Componente para mostrar especialidades
const SpecialtiesSection = ({ specialties }: { specialties: string[] }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Especialidades</h3>
      <div className="flex flex-wrap gap-2">
        {specialties.map((specialty, index) => (
          <span
            key={index}
            className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium"
          >
            {specialty}
          </span>
        ))}
      </div>
    </div>
  );
};

// Componente para mostrar reseñas
const ReviewsSection = ({ reviews }: { reviews: any[] }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <FontAwesomeIcon icon={faStar} className="text-4xl text-gray-300 mb-4" />
        <p className="text-gray-600">Aún no hay reseñas para este profesional</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, index) => (
        <div key={index} className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-600">
                  {review.client_name?.charAt(0) || 'C'}
                </span>
              </div>
              <span className="font-medium text-gray-900">
                {review.client_name || 'Cliente'}
              </span>
            </div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FontAwesomeIcon
                  key={i}
                  icon={faStar}
                  className={`text-sm ${
                    i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-gray-700">{review.comment}</p>
          <p className="text-sm text-gray-500 mt-2">
            {new Date(review.created_at).toLocaleDateString('es-MX')}
          </p>
        </div>
      ))}
    </div>
  );
};

export default function TecnicoProfilePage() {
  const params = useParams();
  const [professional, setProfessional] = useState<Profesional | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        setIsLoading(true);
        // Usar el cliente de Supabase directamente
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', params.id)
          .eq('role', 'profesional')
          .single();

        if (error) {
          console.error('Error fetching professional:', error);
          return;
        }

        setProfessional(data);

        // Obtener reseñas (simulado por ahora)
        // En una implementación real, esto vendría de una tabla de reviews
        setReviews([]);
      } catch (error) {
        console.error('Error in fetchProfessional:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProfessional();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profesional no encontrado</h1>
          <p className="text-gray-600 mb-6">El profesional que buscas no existe o no está disponible.</p>
          <Link 
            href="/tecnicos"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Volver al Directorio
          </Link>
        </div>
      </div>
    );
  }

  const {
    full_name,
    profession,
    avatar_url,
    calificacion_promedio,
    areas_servicio
  } = professional;

  const rating = calificacion_promedio || 0;
  const specialties = areas_servicio || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/tecnicos"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Volver al Directorio
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Principal */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {avatar_url ? (
                      <Image
                        src={avatar_url}
                        alt={full_name || 'Profesional'}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-2xl">
                        {(full_name || 'P').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {/* {is_verified && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-white text-sm" />
                    </div>
                  )} */}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {full_name || 'Profesional'}
                    </h1>
                    {/* {is_verified && (
                      <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                        Verificado
                      </span>
                    )} */}
                  </div>
                  
                  <p className="text-lg text-gray-600 mb-4">
                    {profession || 'Técnico Especializado'}
                  </p>
                  
                  <StarRating rating={rating} reviewCount={0} />
                  
                  {/* {codigo_postal && (
                    <div className="flex items-center text-gray-600 mt-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                      <span>CP {codigo_postal}</span>
                    </div>
                  )} */}
                </div>
              </div>
            </div>

            {/* Biografía */}
            {/* {bio && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sobre Mí</h2>
                <p className="text-gray-700 leading-relaxed">{bio}</p>
              </div>
            )} */}

            {/* Especialidades */}
            {specialties.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <SpecialtiesSection specialties={specialties} />
              </div>
            )}

            {/* Reseñas */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Reseñas de Clientes</h2>
              <ReviewsSection reviews={reviews} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Principal */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ¿Necesitas este servicio?
              </h3>
              <p className="text-gray-600 mb-6">
                Contacta directamente con {full_name} para solicitar un presupuesto.
              </p>
              
              <div className="space-y-3">
                <Link
                  href="/dashboard/client"
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faUsers} />
                  <span>Solicitar Servicio</span>
                </Link>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
              
              <div className="space-y-3">
                <p className="text-gray-600">
                  Para contactar con este profesional, solicita un servicio a través de la plataforma.
                </p>
              </div>
            </div>

            {/* Garantías */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Garantías</h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <FontAwesomeIcon icon={faShieldAlt} className="mr-3 text-blue-600" />
                  <span>Garantía Sumee de 30 días</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-3 text-green-600" />
                  <span>Profesional verificado</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <FontAwesomeIcon icon={faClock} className="mr-3 text-orange-600" />
                  <span>Respuesta en menos de 2 horas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
