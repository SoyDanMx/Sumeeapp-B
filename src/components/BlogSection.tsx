// src/components/BlogSection.tsx
'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPen, 
  faCalendarAlt, 
  faUser, 
  faArrowRight,
  faClock,
  faHashtag,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

// 🎯 Tipos para las entradas de blog
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
  views?: number;
  featured?: boolean;
}

// 🎯 Datos de ejemplo - En producción vendrían de CMS/API
const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Consejos para Mantener tu Hogar en Excelente Estado',
    excerpt: 'Descubre las mejores prácticas y consejos profesionales para mantener tu hogar en perfecto estado durante todo el año.',
    author: 'Equipo Sumee',
    publishDate: '2024-01-15',
    readTime: '5 min',
    category: 'Mantenimiento',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=250&fit=crop',
    slug: 'consejos-mantener-hogar-excelente-estado',
    views: 1250,
    featured: true
  },
  {
    id: '2',
    title: 'Cómo Elegir el Profesional Perfecto para tu Proyecto',
    excerpt: 'Aprende a identificar las cualidades clave que debes buscar al contratar un profesional para tu hogar.',
    author: 'María González',
    publishDate: '2024-01-10',
    readTime: '4 min',
    category: 'Consejos',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=250&fit=crop',
    slug: 'elegir-profesional-perfecto-proyecto',
    views: 892,
    featured: false
  },
  {
    id: '3',
    title: 'Actualizaciones de Seguridad en el Hogar 2024',
    excerpt: 'Las últimas tendencias y tecnologías para mantener tu hogar seguro y protegido este año.',
    author: 'Carlos Mendoza',
    publishDate: '2024-01-08',
    readTime: '6 min',
    category: 'Seguridad',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    slug: 'actualizaciones-seguridad-hogar-2024',
    views: 2103,
    featured: true
  },
  {
    id: '4',
    title: 'Instalación de Bomba de Agua en CDMX: Solución al Suministro Irregular',
    excerpt: 'Descubre cómo una bomba de agua puede solucionar los problemas de suministro irregular en la Ciudad de México y qué debes considerar antes de instalarla.',
    author: 'Ing. Luis Rodríguez',
    publishDate: '2024-01-20',
    readTime: '7 min',
    category: 'Plomería',
    image: 'https://images.pexels.com/photos/259239/pexels-photo-259239.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    slug: 'instalacion-bomba-agua-cdmx',
    views: 1567,
    featured: true
  },
  {
    id: '5',
    title: 'Instalaciones Eléctricas Fuera de Norma: Peligros Mortales que Debes Conocer',
    excerpt: 'Conoce los riesgos mortales de las instalaciones eléctricas improvisadas y por qué es crucial contratar electricistas certificados para proteger tu hogar.',
    author: 'Ing. Ana Herrera',
    publishDate: '2024-01-22',
    readTime: '8 min',
    category: 'Electricidad',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=250&fit=crop',
    slug: 'instalaciones-electricas-riesgos-cdmx',
    views: 1823,
    featured: false
  }
];

const categories = ['Todos', 'Mantenimiento', 'Consejos', 'Seguridad', 'Tecnología', 'Plomería', 'Electricidad'];

interface BlogSectionProps {
  showAllPosts?: boolean;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ showAllPosts = false }) => {
  const displayedPosts = showAllPosts ? blogPosts : blogPosts.slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50" id="blog">
      <div className="container mx-auto px-4">
        {/* 🎯 Header de la sección */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <FontAwesomeIcon icon={faPen} className="text-indigo-600 text-xl" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Blog Sumee</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Consejos, tendencias y guías expertas para mantener tu hogar en perfecto estado
          </p>
        </div>

        {/* 🎯 Filtros de categorías */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-gray-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-gray-700 hover:text-indigo-700"
            >
              <FontAwesomeIcon icon={faHashtag} className="mr-2 text-xs" />
              {category}
            </button>
          ))}
        </div>

        {/* 🎯 Grid de posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayedPosts.map((post, index) => (
            <article 
              key={post.id} 
              className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 ${
                post.featured ? 'ring-2 ring-indigo-200' : ''
              } ${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              {/* 🎯 Imagen del post */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {post.featured && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Destacado
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* 🎯 Contenido del post */}
              <div className="p-6">
                {/* Categoría y metadata */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    {post.category}
                  </span>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      {post.readTime}
                    </span>
                    {post.views && (
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faEye} className="mr-1" />
                        {post.views.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Título */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
                  {post.title}
                </h3>

                {/* Extracto */}
                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Metadata del autor */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-gray-600 text-sm" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.author}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                        {formatDate(post.publishDate)}
                      </p>
                    </div>
                  </div>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors duration-200"
                  >
                    Leer más
                    <FontAwesomeIcon icon={faArrowRight} className="ml-1 text-xs group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 🎯 CTA para ver más posts */}
        {!showAllPosts && (
          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faPen} className="mr-3" />
              Ver Todos los Artículos
              <FontAwesomeIcon icon={faArrowRight} className="ml-3" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
