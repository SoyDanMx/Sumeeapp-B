'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase/client';
import { MarketplaceProduct } from '@/types/supabase';
import Link from 'next/link';
import { ProductPrice } from './ProductPrice';

interface SmartSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SmartSearch({ 
  onSearch, 
  placeholder = 'Busca herramientas, equipos, suministros...',
  className = '' 
}: SmartSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MarketplaceProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce de 300ms para búsqueda
  useEffect(() => {
    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Si el query está vacío, limpiar sugerencias
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    // Mostrar loading después de 100ms
    const loadingTimer = setTimeout(() => {
      setIsLoading(true);
    }, 100);

    // Búsqueda con debounce de 300ms
    debounceTimerRef.current = setTimeout(async () => {
      try {
        // Usar función de búsqueda optimizada si existe, sino usar ILIKE
        // Nota: external_code y sku se agregarán después de ejecutar la migración
        const { data, error } = await supabase
          .from('marketplace_products')
          .select('id, title, price, images, category_id, external_code, sku')
          .eq('status', 'active')
          .gt('price', 0) // ✅ Excluir productos con precio 0
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .order('views_count', { ascending: false })
          .order('likes_count', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error en búsqueda:', error);
          setSuggestions([]);
        } else {
          setSuggestions(data || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Error en búsqueda:', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
        clearTimeout(loadingTimer);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      clearTimeout(loadingTimer);
    };
  }, [query]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Navegar a página de resultados
      router.push(`/marketplace/all?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      searchInputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FontAwesomeIcon icon={faSearch} />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Panel de Sugerencias */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              Buscando...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No se encontraron resultados para &quot;{query}&quot;
            </div>
          ) : (
            <>
              <div className="p-2">
                {suggestions.map((product) => (
                  <Link
                    key={product.id}
                    href={`/marketplace/${product.id}`}
                    onClick={() => {
                      setShowSuggestions(false);
                      setQuery(product.title);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    {/* Imagen del producto */}
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                        {product.title}
                      </h4>
                      <div className="text-sm">
                        <ProductPrice 
                          product={product} 
                          exchangeRate={exchangeRate} 
                          size="sm" 
                          className="font-bold text-indigo-600"
                        />
                      </div>
                    </div>

                    {/* Icono de búsqueda */}
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                ))}
              </div>

              {/* Ver todos los resultados */}
              <div className="border-t border-gray-200 p-2">
                <button
                  onClick={() => handleSearch()}
                  className="w-full text-left px-3 py-2 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Ver todos los resultados para &quot;{query}&quot;
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}


