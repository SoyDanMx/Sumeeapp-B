'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlug,
  faBatteryFull,
  faWrench,
  faHeart,
  faCheckCircle,
  faMapMarkerAlt,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { MarketplaceProduct } from '@/types/supabase';

interface ProductCardProps {
  product: MarketplaceProduct;
  onClick?: (product: MarketplaceProduct) => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  // Calcular porcentaje de descuento
  const discountPercentage = product.original_price && product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null;

  // Obtener icono según power_type
  const getPowerTypeIcon = () => {
    switch (product.power_type?.toLowerCase()) {
      case 'electric':
      case 'eléctrico':
        return faPlug;
      case 'cordless':
      case 'inalámbrico':
        return faBatteryFull;
      case 'manual':
        return faWrench;
      default:
        return null;
    }
  };

  const powerIcon = getPowerTypeIcon();

  // Obtener label de condición
  const getConditionLabel = (condition: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      nuevo: { text: 'Nuevo', color: 'bg-green-100 text-green-700 border-green-300' },
      usado_excelente: { text: 'Usado - Excelente', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      usado_bueno: { text: 'Usado - Bueno', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      usado_regular: { text: 'Usado - Regular', color: 'bg-orange-100 text-orange-700 border-orange-300' },
      para_reparar: { text: 'Para Reparar', color: 'bg-red-100 text-red-700 border-red-300' },
    };
    return labels[condition] || labels.usado_bueno;
  };

  const condition = getConditionLabel(product.condition);

  // Manejar imagen fallida
  const [imageError, setImageError] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState<string | null>(
    product.images && product.images.length > 0 ? product.images[0] : null
  );

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
    >
      {/* Imagen */}
      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        {imageSrc && !imageError ? (
          <Image
            src={imageSrc}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            quality={85}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <FontAwesomeIcon icon={faWrench} className="text-6xl text-gray-400 mb-2" />
            <span className="text-gray-500 text-sm">Sin imagen</span>
          </div>
        )}

        {/* Badges superpuestos */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {/* Badge de descuento */}
          {discountPercentage && (
            <span className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
              -{discountPercentage}%
            </span>
          )}

          {/* Badge de condición "Nuevo" */}
          {product.condition === 'nuevo' && (
            <span className="bg-green-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
              <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
              Nuevo
            </span>
          )}

          {/* Badge de vendedor verificado */}
          {product.seller?.verified && (
            <span className="bg-blue-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg flex items-center gap-1">
              <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" />
              Verificado
            </span>
          )}
        </div>

        {/* Icono de power_type */}
        {powerIcon && (
          <div className="absolute top-3 right-12 bg-white/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
            <FontAwesomeIcon
              icon={powerIcon}
              className={`text-sm ${
                product.power_type?.toLowerCase() === 'electric' || product.power_type?.toLowerCase() === 'eléctrico'
                  ? 'text-yellow-500'
                  : product.power_type?.toLowerCase() === 'cordless' || product.power_type?.toLowerCase() === 'inalámbrico'
                  ? 'text-green-500'
                  : 'text-gray-500'
              }`}
            />
          </div>
        )}

        {/* Botón de favoritos */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implementar lógica de favoritos
          }}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors z-10 shadow-sm opacity-0 group-hover:opacity-100 duration-300"
        >
          <FontAwesomeIcon
            icon={faHeart}
            className="text-gray-400 hover:text-red-500 transition-colors"
          />
        </button>
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Condición (si no es "nuevo", ya que tiene badge especial) */}
        {product.condition !== 'nuevo' && (
          <div className="mb-2">
            <span
              className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${condition.color}`}
            >
              {condition.text}
            </span>
          </div>
        )}

        {/* Título */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-12 leading-tight group-hover:text-indigo-600 transition-colors">
          {product.title}
        </h3>

        {/* Precios */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-black text-indigo-600">
            ${Number(product.price).toLocaleString('es-MX')}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-gray-400 line-through decoration-red-300">
              ${Number(product.original_price).toLocaleString('es-MX')}
            </span>
          )}
        </div>

        {/* Vendedor */}
        {product.seller && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
              {product.seller.full_name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {product.seller.full_name || 'Usuario'}
                </p>
                {product.seller.verified && (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-blue-500 text-[10px] flex-shrink-0"
                  />
                )}
              </div>
              {product.seller.calificacion_promedio && (
                <div className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                  <span className="text-xs text-gray-500">
                    {product.seller.calificacion_promedio.toFixed(1)} ({product.seller.review_count || 0})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ubicación */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
            <span className="truncate max-w-[120px]">
              {product.location_zone || product.location_city || 'CDMX'}
            </span>
          </div>
          <Link
            href={`/marketplace/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-indigo-600 text-sm font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
}

