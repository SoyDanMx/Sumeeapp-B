'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faStar,
  faMapMarkerAlt,
  faShoppingCart,
  faHeart,
  faArrowLeft,
  faPlug,
  faBatteryFull,
  faWrench,
} from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase/client';
import { MarketplaceProduct } from '@/types/supabase';
import { ProductStructuredData } from '@/components/marketplace/StructuredData';
import { getCategoryById } from '@/lib/marketplace/categories';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('marketplace_products')
          .select(`
            *,
            seller:profiles!marketplace_products_seller_id_fkey(
              full_name,
              avatar_url,
              user_id
            )
          `)
          .eq('id', productId)
          .eq('status', 'active')
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          throw new Error('Producto no encontrado');
        }

        // Mapear datos del vendedor
        const productData = data as any;
        const sellerData = Array.isArray(productData.seller) && productData.seller.length > 0 
          ? productData.seller[0] 
          : productData.seller;
        const isOfficialStore = productData.contact_phone === '5636741156' || !productData.seller_id;

        const mappedProduct: MarketplaceProduct = {
          ...productData,
          seller: {
            full_name: isOfficialStore
              ? 'Sumee Oficial'
              : sellerData?.full_name || 'Usuario Sumee',
            avatar_url: isOfficialStore ? null : sellerData?.avatar_url || null,
            verified: isOfficialStore ? true : true,
            calificacion_promedio: isOfficialStore ? 5.0 : 4.9,
            review_count: isOfficialStore ? 1250 : 12,
          },
        };

        setProduct(mappedProduct);

        // Incrementar contador de vistas
        await (supabase
          .from('marketplace_products') as any)
          .update({ views_count: (productData.views_count || 0) + 1 })
          .eq('id', productId);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <p className="text-gray-600 mb-6">{error || 'El producto que buscas no existe o ha sido eliminado'}</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Volver al Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage =
    product.original_price && product.original_price > product.price
      ? Math.round((1 - product.price / product.original_price) * 100)
      : null;

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

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      nuevo: { text: 'Nuevo', color: 'bg-green-100 text-green-700' },
      usado_excelente: { text: 'Usado - Excelente', color: 'bg-blue-100 text-blue-700' },
      usado_bueno: { text: 'Usado - Bueno', color: 'bg-yellow-100 text-yellow-700' },
      usado_regular: { text: 'Usado - Regular', color: 'bg-orange-100 text-orange-700' },
      para_reparar: { text: 'Para Reparar', color: 'bg-red-100 text-red-700' },
    };
    return labels[condition] || labels.usado_bueno;
  };

  const condition = getConditionLabel(product.condition);
  const isOfficialStore = !product.seller_id || product.contact_phone === '5636741156';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Volver</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Galería de Imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImageIndex]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FontAwesomeIcon icon={faWrench} className="text-8xl text-gray-400" />
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-indigo-600'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} - Imagen ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 25vw, 12.5vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="space-y-6">
            {/* Título y badges */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {discountPercentage && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                    -{discountPercentage}%
                  </span>
                )}
                {product.condition === 'nuevo' && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                    Nuevo
                  </span>
                )}
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${condition.color}`}>
                  {condition.text}
                </span>
                {powerIcon && (
                  <div className="bg-gray-100 px-3 py-1 rounded-lg">
                    <FontAwesomeIcon
                      icon={powerIcon}
                      className={`text-sm ${
                        product.power_type?.toLowerCase() === 'electric' ||
                        product.power_type?.toLowerCase() === 'eléctrico'
                          ? 'text-yellow-500'
                          : product.power_type?.toLowerCase() === 'cordless' ||
                            product.power_type?.toLowerCase() === 'inalámbrico'
                          ? 'text-green-500'
                          : 'text-gray-500'
                      }`}
                    />
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            </div>

            {/* Precio */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-indigo-600">
                ${Number(product.price).toLocaleString('es-MX')}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xl text-gray-400 line-through decoration-red-300">
                  ${Number(product.original_price).toLocaleString('es-MX')}
                </span>
              )}
            </div>

            {/* Seller Trust Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Vendedor</h3>
              {isOfficialStore ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    S
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold text-gray-900">Sumee Oficial</h4>
                      <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Vendido y enviado por Sumee Oficial
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                        <span className="text-sm font-semibold">5.0</span>
                        <span className="text-sm text-gray-500">(1,250 reseñas)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {product.seller?.full_name?.[0] || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold text-gray-900">
                        {product.seller?.full_name || 'Usuario'}
                      </h4>
                      {product.seller?.verified && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {product.seller?.calificacion_promedio && (
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                          <span className="text-sm font-semibold">
                            {product.seller.calificacion_promedio.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({product.seller.review_count || 0} reseñas)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ubicación */}
            <div className="flex items-center gap-2 text-gray-600">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>
                {product.location_zone || product.location_city || 'CDMX'}
              </span>
            </div>

            {/* Acciones de Compra */}
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg">
                <FontAwesomeIcon icon={faShoppingCart} />
                Comprar Ahora
              </button>
              <button className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faHeart} />
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>

        {/* Descripción Técnica */}
        <div className="mt-12 bg-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción Técnica</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {product.description || 'No hay descripción disponible para este producto.'}
            </p>
          </div>
        </div>
      </div>

      {/* Structured Data para SEO */}
      {product && (
        <ProductStructuredData
          product={product}
          category={product.category_id ? getCategoryById(product.category_id) : undefined}
        />
      )}
    </div>
  );
}

