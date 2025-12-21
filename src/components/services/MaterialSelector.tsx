"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCheckCircle,
  faShoppingCart,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  images: string[] | null;
  sku?: string | null;
  marca?: string | null;
}

interface MaterialSelectorProps {
  searchTerm: string;
  quantity: number;
  onProductsSelected: (products: Product[]) => void;
  selectedProducts?: Product[];
  filterTruperOnly?: boolean; // Si es true, solo mostrar productos de Truper (seller_id IS NULL)
}

export default function MaterialSelector({
  searchTerm,
  quantity,
  onProductsSelected,
  selectedProducts = [],
  filterTruperOnly = false,
}: MaterialSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Generar múltiples términos de búsqueda relacionados
        const searchTerms = searchTerm.toLowerCase().trim();
        const searchVariations: string[] = [];
        
        // Si el término incluye "contacto", agregar variaciones
        if (searchTerms.includes("contacto")) {
          searchVariations.push("contacto", "contactos", "enchufe", "enchufes", "tomacorriente", "tomacorrientes", "receptaculo", "receptaculos");
        }
        
        // Si el término incluye "cable", agregar variaciones
        if (searchTerms.includes("cable")) {
          searchVariations.push("cable", "cables", "alambre", "alambres", "conductor", "conductores");
        }
        
        // Si el término incluye "caja", agregar variaciones
        if (searchTerms.includes("caja") || searchTerms.includes("chalupa")) {
          searchVariations.push("caja", "cajas", "chalupa", "chalupas", "interconexion", "interconexiones", "caja de conexion");
        }
        
        // Si no hay variaciones específicas, usar el término original
        if (searchVariations.length === 0) {
          searchVariations.push(searchTerms);
        }
        
        // Construir la consulta OR con múltiples términos
        // Nota: external_code y sku se agregarán después de ejecutar la migración
        const orConditions = searchVariations
          .map(term => `title.ilike.%${term}%,description.ilike.%${term}%`)
          .join(",");
        
        console.log("🔍 [MaterialSelector] Buscando productos con términos:", searchVariations);
        console.log("🔍 [MaterialSelector] Filtrar solo Truper:", filterTruperOnly);
        
        let query = supabase
          .from("marketplace_products")
          .select("id, title, description, price, images, status, seller_id, external_code, sku")
          .or(orConditions)
          .eq("status", "active");
          // .gt("price", 0); // ⚠️ TEMPORALMENTE DESHABILITADO
        
        // Si se requiere solo productos de Truper, filtrar por seller_id IS NULL
        // Los productos de Truper son productos oficiales de Sumee (seller_id = NULL)
        if (filterTruperOnly) {
          query = query.is("seller_id", null);
          console.log("✅ [MaterialSelector] Filtrando solo productos de Truper (seller_id IS NULL)");
        }
        
        const { data, error: fetchError } = await query
          .order("price", { ascending: true })
          .limit(20); // Aumentar límite para tener más opciones

        if (fetchError) {
          console.error("❌ [MaterialSelector] Supabase error:", fetchError);
          throw fetchError;
        }

        console.log(`✅ [MaterialSelector] Encontrados ${data?.length || 0} productos`);

        // Mapear los datos de marketplace_products al formato esperado
        let mappedProducts: Product[] = (data || []).map((product: any) => ({
          id: product.id,
          title: product.title,
          description: product.description,
          price: Number(product.price),
          images: product.images || [],
          sku: null,
          marca: null,
        }));

        // Si se requiere solo Truper, filtrar también por título/descripción que contenga "truper"
        // y excluir productos que claramente sean de Syscom
        if (filterTruperOnly) {
          mappedProducts = mappedProducts.filter((product) => {
            const titleLower = product.title.toLowerCase();
            const descLower = (product.description || "").toLowerCase();
            
            // Incluir si contiene "truper" o si no contiene términos de Syscom
            const hasTruper = titleLower.includes("truper") || descLower.includes("truper");
            const hasSyscom = titleLower.includes("syscom") || descLower.includes("syscom") ||
                             titleLower.includes("ingram") || descLower.includes("ingram");
            
            // Si tiene Truper explícitamente, incluirlo
            if (hasTruper) return true;
            
            // Si no tiene Syscom/Ingram, probablemente es Truper (productos oficiales)
            if (!hasSyscom) return true;
            
            // Excluir si tiene Syscom/Ingram
            return false;
          });
          
          console.log(`✅ [MaterialSelector] Después de filtrar Truper: ${mappedProducts.length} productos`);
        }

        // Filtrar productos duplicados por título similar
        const uniqueProducts = mappedProducts.filter((product, index, self) =>
          index === self.findIndex((p) => 
            p.title.toLowerCase().trim() === product.title.toLowerCase().trim()
          )
        );

        setProducts(uniqueProducts);
      } catch (err: any) {
        console.error("❌ [MaterialSelector] Error fetching products:", err);
        setError(err?.message || err?.error?.message || "Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };

    if (searchTerm && searchTerm.trim()) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [searchTerm]);

  const handleProductToggle = (product: Product) => {
    const isSelected = selectedProducts.some((p) => p.id === product.id);
    let newSelection: Product[];

    if (isSelected) {
      // Remover producto
      newSelection = selectedProducts.filter((p) => p.id !== product.id);
    } else {
      // Agregar producto (hasta la cantidad necesaria)
      if (selectedProducts.length < quantity) {
        newSelection = [...selectedProducts, product];
      } else {
        // Si ya se seleccionaron suficientes, reemplazar el último
        newSelection = [...selectedProducts.slice(0, quantity - 1), product];
      }
    }

    onProductsSelected(newSelection);
  };

  const getTotalPrice = () => {
    return selectedProducts.reduce((sum, p) => sum + p.price, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FontAwesomeIcon icon={faSpinner} spin className="text-purple-600 text-2xl" />
        <span className="ml-3 text-gray-600">Buscando productos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <FontAwesomeIcon icon={faShoppingCart} className="text-gray-400 text-3xl mb-2" />
        <p className="text-gray-600 text-sm">
          No encontramos productos relacionados. El técnico te cotizará los materiales necesarios.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">
            Selecciona los productos que necesitas
          </h4>
          <p className="text-sm text-gray-500 mt-1">
            Puedes seleccionar hasta {quantity} {quantity === 1 ? "producto" : "productos"}
            {selectedProducts.length > 0 && (
              <span className="text-purple-600 font-medium">
                {" "}({selectedProducts.length} seleccionado{selectedProducts.length !== 1 ? "s" : ""})
              </span>
            )}
          </p>
        </div>
        {selectedProducts.length > 0 && (
          <div className="text-right">
            <div className="text-sm text-gray-600">Total materiales:</div>
            <div className="text-lg font-bold text-purple-600">
              ${getTotalPrice().toLocaleString("es-MX")}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
        {products.map((product) => {
          const isSelected = selectedProducts.some((p) => p.id === product.id);
          const canSelect = selectedProducts.length < quantity || isSelected;

          return (
            <button
              key={product.id}
              onClick={() => canSelect && handleProductToggle(product)}
              disabled={!canSelect && !isSelected}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                isSelected
                  ? "border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md"
                  : canSelect
                  ? "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                  : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
              }`}
            >
              {/* Imagen del producto */}
              <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-100">
                {product.images && product.images.length > 0 && product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <FontAwesomeIcon icon={faImage} className="text-gray-400 text-2xl" />
                  </div>
                )}
              </div>

              {/* Información del producto */}
              <div className="text-left space-y-1">
                <h5 className="font-semibold text-xs text-gray-900 line-clamp-2 min-h-[2.5rem]">
                  {product.title}
                </h5>
                {product.marca && (
                  <p className="text-xs text-gray-500">{product.marca}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-purple-600">
                    ${product.price.toLocaleString("es-MX")}
                  </span>
                  {isSelected && (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 text-lg"
                    />
                  )}
                </div>
              </div>

              {/* Badge de seleccionado */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xs" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedProducts.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-900">
                Productos seleccionados: {selectedProducts.length} de {quantity}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Estos productos se incluirán en tu cotización
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-purple-600">
                ${getTotalPrice().toLocaleString("es-MX")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

