// src/app/blog/[slug]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faCalendarAlt, 
  faClock, 
  faArrowLeft,
  faShare,
  faEye,
  faHashtag
} from '@fortawesome/free-solid-svg-icons';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  publishDate: string;
  readTime: string;
  category: string;
  image: string;
  slug: string;
  views?: number;
  tags: string[];
}

// Datos de ejemplo - En producción vendrían de CMS/API
const blogPosts: Record<string, BlogPost> = {
  'consejos-mantener-hogar-excelente-estado': {
    id: '1',
    title: '10 Consejos para Mantener tu Hogar en Excelente Estado',
    content: `
      <p>Mantener tu hogar en excelente estado no es solo cuestión de estética, es una inversión en tu calidad de vida y en el valor de tu propiedad. Aquí te presentamos 10 consejos profesionales que puedes implementar de manera sencilla:</p>
      
      <h3>1. Limpieza Regular y Profunda</h3>
      <p>Establece una rutina de limpieza que incluya tanto tareas diarias como semanales. La limpieza regular previene la acumulación de suciedad y hace que las tareas de mantenimiento sean más sencillas.</p>
      
      <h3>2. Revisión de Sistemas Eléctricos</h3>
      <p>Realiza inspecciones mensuales de tus tomas eléctricas, verifica que no haya cables desgastados y mantén actualizado tu sistema eléctrico. Esto previene accidentes y garantiza el funcionamiento correcto.</p>
      
      <h3>3. Mantenimiento de Plomería</h3>
      <p>Revisa regularmente grifos, tuberías y desagües. Un pequeño problema de plomería puede convertirse en una gran complicación si no se atiende a tiempo.</p>
      
      <h3>4. Ventilación Adecuada</h3>
      <p>Mantén una buena ventilación en todos los espacios para prevenir humedad, moho y problemas de salud. Esto es especialmente importante en baños, cocinas y sótanos.</p>
      
      <h3>5. Revisión de Pintura y Paredes</h3>
      <p>Las paredes requieren atención periódica. Revisa grietas, humedad y el estado de la pintura. Una mano de pintura fresca puede renovar completamente cualquier espacio.</p>
      
      <p>Implementar estos consejos de manera regular te ayudará a mantener tu hogar en excelente estado, creando un ambiente más saludable y agradable para toda tu familia.</p>
    `,
    author: 'Equipo Sumee',
    publishDate: '2024-01-15',
    readTime: '5 min',
    category: 'Mantenimiento',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop',
    slug: 'consejos-mantener-hogar-excelente-estado',
    views: 1250,
    tags: ['mantenimiento', 'hogar', 'consejos', 'limpieza']
  }
  // Más posts se agregarían aquí...
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = blogPosts[slug];

  if (!post) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Artículo no encontrado</h1>
            <p className="text-gray-600 mb-8">El artículo que buscas no existe o ha sido movido.</p>
            <a 
              href="/blog" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Volver al Blog
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-24">
        {/* Hero del artículo */}
        <article className="pb-16">
          <div className="container mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
              <a href="/" className="hover:text-indigo-600">Inicio</a>
              <span>/</span>
              <a href="/blog" className="hover:text-indigo-600">Blog</a>
              <span>/</span>
              <span className="text-gray-900">{post.title}</span>
            </nav>

            {/* Imagen principal */}
            <div className="relative h-64 md:h-96 mb-8 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Categoría */}
              <div className="absolute top-6 left-6">
                <span className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold">
                  <FontAwesomeIcon icon={faHashtag} className="mr-2 text-xs" />
                  {post.category}
                </span>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="max-w-4xl mx-auto">
              {/* Header del artículo */}
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>
                
                {/* Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-t border-b border-gray-200">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faUser} className="text-gray-500" />
                      <span className="text-gray-700">{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500" />
                      <span className="text-gray-700">{formatDate(post.publishDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faClock} className="text-gray-500" />
                      <span className="text-gray-700">{post.readTime} de lectura</span>
                    </div>
                    {post.views && (
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faEye} className="text-gray-500" />
                        <span className="text-gray-700">{post.views.toLocaleString()} vistas</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Botón compartir */}
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200">
                    <FontAwesomeIcon icon={faShare} />
                    <span>Compartir</span>
                  </button>
                </div>
              </header>

              {/* Contenido del artículo */}
              <div 
                className="prose prose-lg max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="border-t border-gray-200 pt-8 mb-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Etiquetas:</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200 cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
