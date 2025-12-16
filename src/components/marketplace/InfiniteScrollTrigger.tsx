"use client";

import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
}

export function InfiniteScrollTrigger({
  onLoadMore,
  hasMore,
  loading,
  threshold = 200,
}: InfiniteScrollTriggerProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Solo crear observer si hay más contenido y no está cargando
    if (!hasMore || loading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, onLoadMore, threshold]);

  if (!hasMore) {
    return (
      <div className="py-8 text-center text-gray-500 text-sm">
        No hay más productos para mostrar
      </div>
    );
  }

  return (
    <div ref={observerTarget} className="py-8 text-center">
      {loading && (
        <div className="flex flex-col items-center gap-3">
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-2xl text-indigo-600 animate-spin"
          />
          <span className="text-sm text-gray-600">Cargando más productos...</span>
        </div>
      )}
    </div>
  );
}

