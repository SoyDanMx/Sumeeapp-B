// src/app/blog/page.tsx
'use client';

import React, { useState } from 'react';
import { BlogSection } from '@/components/BlogSection';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faSort,
  faHashtag,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent');

  const categories = ['Todos', 'Mantenimiento', 'Consejos', 'Seguridad', 'Tecnología', 'Plomería', 'Electricidad'];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-24">
        {/* Hero Section del Blog */}
        <section className="bg-gradient-to-r from-indigo-600 to-blue-700 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Blog Sumee
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Descubre consejos expertos, tendencias del sector y guías prácticas para mantener tu hogar en perfecto estado
            </p>
            
            {/* Barra de búsqueda */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Buscar artículos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-0 shadow-lg text-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filtros y ordenamiento */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Filtros por categoría */}
              <div className="flex flex-wrap gap-2">
                <FontAwesomeIcon icon={faFilter} className="text-gray-500 mt-2 mr-2" />
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                  >
                    <FontAwesomeIcon icon={faHashtag} className="mr-1 text-xs" />
                    {category}
                  </button>
                ))}
              </div>

              {/* Ordenamiento */}
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faSort} className="text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                >
                  <option value="recent">Más recientes</option>
                  <option value="popular">Más populares</option>
                  <option value="views">Más vistos</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Contenido principal del blog */}
        <BlogSection showAllPosts={true} />

        {/* Newsletter Subscription */}
        <section className="py-16 bg-gradient-to-r from-indigo-600 to-blue-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Mantente Actualizado
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Recibe nuestros mejores consejos y artículos directamente en tu correo
            </p>
            <div className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-3 rounded-lg border-0 shadow-lg focus:ring-2 focus:ring-indigo-300 focus:outline-none"
              />
              <button className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200">
                Suscribirse
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
