import { useState, useEffect, useCallback } from "react";
import { MarketplaceProduct } from "@/types/supabase";
import { supabase } from "@/lib/supabase/client";

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface UseMarketplacePaginationOptions {
  pageSize?: number;
  categoryId?: string | null;
  searchQuery?: string;
  filters?: {
    minPrice?: number | null;
    maxPrice?: number | null;
    condition?: string[];
    powerType?: string | null;
  };
}

export function useMarketplacePagination(options: UseMarketplacePaginationOptions = {}) {
  const { pageSize = 24, categoryId, searchQuery, filters } = options;

  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  const fetchProducts = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        setLoading(true);
        setError(null);

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // Construir consulta base
        let query = supabase
          .from("marketplace_products")
          .select(
            `
            *,
            seller:profiles(
              full_name,
              avatar_url
            )
          `,
            { count: "exact" }
          )
          .eq("status", "active");

        // Aplicar filtros
        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }

        if (searchQuery) {
          query = query.or(
            `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
          );
        }

        if (filters?.minPrice !== null && filters?.minPrice !== undefined) {
          query = query.gte("price", filters.minPrice);
        }

        if (filters?.maxPrice !== null && filters?.maxPrice !== undefined) {
          query = query.lte("price", filters.maxPrice);
        }

        if (filters?.condition && filters.condition.length > 0) {
          query = query.in("condition", filters.condition);
        }

        if (filters?.powerType) {
          if (filters.powerType === "electric_all") {
            query = query.or("power_type.eq.electric,power_type.eq.cordless");
          } else {
            query = query.eq("power_type", filters.powerType);
          }
        }

        // Ordenar y paginar
        const { data, error: queryError, count } = await query
          .order("created_at", { ascending: false })
          .range(from, to);

        if (queryError) {
          throw queryError;
        }

        if (data) {
          const mappedProducts: MarketplaceProduct[] = (data as any[]).map(
            (item) => {
              const sellerData = Array.isArray(item.seller)
                ? item.seller[0]
                : item.seller;

              const isOfficialStore = item.contact_phone === "5636741156";

              return {
                ...item,
                seller: {
                  full_name: isOfficialStore
                    ? "Sumee Supply"
                    : sellerData?.full_name || "Usuario Sumee",
                  avatar_url: isOfficialStore
                    ? null
                    : sellerData?.avatar_url || null,
                  verified: isOfficialStore ? true : true,
                  calificacion_promedio: isOfficialStore ? 5.0 : 4.9,
                  review_count: isOfficialStore ? 1250 : 12,
                },
              };
            }
          );

          const total = count || 0;
          const totalPages = Math.ceil(total / pageSize);
          const hasMore = page < totalPages;

          setPagination({
            page,
            pageSize,
            total,
            totalPages,
            hasMore,
          });

          if (append) {
            setProducts((prev) => [...prev, ...mappedProducts]);
          } else {
            setProducts(mappedProducts);
          }
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Error al cargar productos");
      } finally {
        setLoading(false);
      }
    },
    [pageSize, categoryId, searchQuery, filters]
  );

  const loadPage = useCallback(
    (page: number) => {
      fetchProducts(page, false);
    },
    [fetchProducts]
  );

  const loadNextPage = useCallback(() => {
    if (pagination.hasMore && !loading) {
      fetchProducts(pagination.page + 1, true);
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [pagination.hasMore, pagination.page, loading, fetchProducts]);

  const reset = useCallback(() => {
    setProducts([]);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchProducts(1, false);
  }, [fetchProducts]);

  // Cargar primera página cuando cambian los filtros
  useEffect(() => {
    reset();
  }, [categoryId, searchQuery, filters?.minPrice, filters?.maxPrice, filters?.condition, filters?.powerType]);

  return {
    products,
    loading,
    error,
    pagination,
    loadPage,
    loadNextPage,
    reset,
    refresh: () => fetchProducts(pagination.page, false),
  };
}

