'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';

interface RatingDisplayProps {
  rating: number | null;
  reviewCount: number | null;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function RatingDisplay({ 
  rating, 
  reviewCount, 
  showLabel = true, 
  size = 'md' 
}: RatingDisplayProps) {
  // Determinar si es un profesional nuevo (3 o menos reseñas)
  const isNewProfessional = !reviewCount || reviewCount <= 3;
  
  // Tamaños de iconos
  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Renderizar estrellas
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Estrellas llenas
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={i} 
          icon={faStar} 
          className={`${iconSizes[size]} text-yellow-400`} 
        />
      );
    }
    
    // Media estrella
    if (hasHalfStar) {
      stars.push(
        <FontAwesomeIcon 
          key="half" 
          icon={faStarHalfAlt} 
          className={`${iconSizes[size]} text-yellow-400`} 
        />
      );
    }
    
    // Estrellas vacías
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FontAwesomeIcon 
          key={`empty-${i}`} 
          icon={faStar} 
          className={`${iconSizes[size]} text-gray-300`} 
        />
      );
    }
    
    return stars;
  };

  if (isNewProfessional) {
    return (
      <div className="flex flex-col items-start space-y-1">
        {/* Badge para nuevo profesional */}
        <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
          Nuevo en Sumee
        </div>
        
        {showLabel && (
          <p className={`${textSizes[size]} text-gray-600 font-medium`}>
            Verificado • ¡Sé el primero en calificarlo!
          </p>
        )}
      </div>
    );
  }

  // Profesional con reseñas
  const displayRating = rating || 0;
  const displayCount = reviewCount || 0;

  return (
    <div className="flex flex-col items-start space-y-1">
      {/* Estrellas */}
      <div className="flex items-center space-x-1">
        {renderStars(displayRating)}
        <span className={`${textSizes[size]} text-gray-700 font-medium ml-1`}>
          {displayRating.toFixed(1)}
        </span>
      </div>
      
      {showLabel && (
        <p className={`${textSizes[size]} text-gray-600`}>
          ({displayCount} reseña{displayCount !== 1 ? 's' : ''})
        </p>
      )}
    </div>
  );
}
