// src/components/blog/BlogPostContent.tsx
"use client";

import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCalendarAlt,
  faClock,
  faArrowLeft,
  faShare,
  faEye,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";

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

interface BlogPostContentProps {
  post: BlogPost;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.replace(/<[^>]*>/g, "").substring(0, 100),
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado al portapapeles");
    }
  };

  // Structured data para breadcrumb
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://www.sumeeapp.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://www.sumeeapp.com/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://www.sumeeapp.com/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <main className="flex-grow pt-24">
        {/* Hero del artículo */}
        <article className="pb-16">
          <div className="container mx-auto px-4">
            {/* Breadcrumb con structured data */}
            <nav
              className="flex items-center space-x-2 text-sm text-gray-600 mb-8"
              aria-label="Breadcrumb"
            >
              <ol className="flex items-center space-x-2">
                <li>
                  <a href="/" className="hover:text-indigo-600">
                    Inicio
                  </a>
                </li>
                <li>
                  <span>/</span>
                </li>
                <li>
                  <a href="/blog" className="hover:text-indigo-600">
                    Blog
                  </a>
                </li>
                <li>
                  <span>/</span>
                </li>
                <li>
                  <span className="text-gray-900" aria-current="page">
                    {post.title}
                  </span>
                </li>
              </ol>
            </nav>

            {/* Imagen principal */}
            <div className="relative h-64 md:h-96 mb-8 rounded-2xl overflow-hidden shadow-lg">
              {post.image ? (
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized={post.image.startsWith('http')}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">Sin imagen</span>
                </div>
              )}
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
                      <FontAwesomeIcon
                        icon={faCalendarAlt}
                        className="text-gray-500"
                      />
                      <time dateTime={post.publishDate} className="text-gray-700">
                        {formatDate(post.publishDate)}
                      </time>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faClock} className="text-gray-500" />
                      <span className="text-gray-700">
                        {post.readTime} de lectura
                      </span>
                    </div>
                    {post.views && (
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faEye} className="text-gray-500" />
                        <span className="text-gray-700">
                          {post.views.toLocaleString()} vistas
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botón compartir */}
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                    aria-label="Compartir artículo"
                  >
                    <FontAwesomeIcon icon={faShare} className="mr-2" />
                    Compartir
                  </button>
                </div>
              </header>

              {/* Contenido del artículo */}
              <div
                className="prose prose-lg max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* CTAs específicos según el slug */}
              {post.slug === "elegir-profesional-perfecto-proyecto" && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    ¡Conviértete en Miembro y Encuentra a tu Próximo Pro!
                  </h2>
                  <p className="text-xl text-green-100 mb-8 leading-relaxed">
                    Solicita tu proyecto hoy mismo y recibe cotizaciones de
                    profesionales que cumplen con todos estos estándares.
                  </p>

                  <a
                    href="/pago-de-servicios"
                    className="inline-flex items-center bg-white text-green-600 hover:text-green-700 font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    ¡Quiero un Técnico Verificado Ahora Mismo!
                  </a>

                  <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-green-100">
                    <span className="flex items-center text-sm">
                      ✅ Verificados
                    </span>
                    <span className="flex items-center text-sm">
                      ✅ Certificados
                    </span>
                    <span className="flex items-center text-sm">
                      ✅ Asegurados
                    </span>
                  </div>
                </div>
              )}

              {post.slug === "actualizaciones-seguridad-hogar-2024" && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    ��️ ¡Protege tu Hogar con los Mejores Profesionales!
                  </h2>
                  <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                    No dejes la seguridad de tu hogar al azar. Conecta con
                    técnicos especializados en instalación de sistemas de
                    seguridad y automatización del hogar.
                  </p>

                  <a
                    href="/pago-de-servicios"
                    className="inline-flex items-center bg-white text-blue-600 hover:text-blue-700 font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    ¡Instalar Sistema de Seguridad Ahora!
                  </a>

                  <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-blue-100">
                    <span className="flex items-center text-sm">
                      ✅ Sistemas Inteligentes
                    </span>
                    <span className="flex items-center text-sm">
                      ✅ Instalación Profesional
                    </span>
                    <span className="flex items-center text-sm">
                      ✅ Soporte 24/7
                    </span>
                  </div>
                </div>
              )}

              {post.slug === "instalacion-bomba-agua-cdmx" && (
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-8 text-white shadow-2xl text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    💧 ¡Soluciona tu Problema de Agua con Profesionales!
                  </h2>
                  <p className="text-xl text-cyan-100 mb-8 leading-relaxed">
                    No más cortes de agua ni baja presión. Conecta con plomeros
                    certificados especializados en instalación de bombas de agua
                    para CDMX.
                  </p>

                  <a
                    href="/pago-de-servicios"
                    className="inline-flex items-center bg-white text-cyan-600 hover:text-cyan-700 font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    ¡Instalar Bomba de Agua Ahora!
                  </a>

                  <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-cyan-100">
                    <span className="flex items-center text-sm">
                      ✅ Certificados
                    </span>
                    <span className="flex items-center text-sm">✅ Garantía</span>
                    <span className="flex items-center text-sm">
                      ✅ Mantenimiento
                    </span>
                  </div>
                </div>
              )}

              {post.slug === "instalaciones-electricas-riesgos-cdmx" && (
                <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl p-8 text-white shadow-2xl text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    ⚡ ¡Salva tu Hogar: Contrata Solo Electricistas Certificados!
                  </h2>
                  <p className="text-xl text-red-100 mb-8 leading-relaxed">
                    Tu familia está en riesgo. No esperes más. Conecta con
                    electricistas certificados por CFE que instalan según las
                    normas de seguridad más estrictas.
                  </p>

                  <a
                    href="/pago-de-servicios"
                    className="inline-flex items-center bg-white text-red-600 hover:text-red-700 font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    ¡Revisar Instalación Eléctrica Ya!
                  </a>

                  <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-red-100">
                    <span className="flex items-center text-sm">
                      ✅ CFE Certificados
                    </span>
                    <span className="flex items-center text-sm">✅ Seguros</span>
                    <span className="flex items-center text-sm">✅ Garantía</span>
                  </div>
                </div>
              )}

              {/* CTA específico para el artículo de Nvidia */}
              {post.slug ===
                "millonarios-sin-titulo-universitario-profecia-nvidia" && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-2xl text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    🛠️ ¡Convierte tu Oficio en tu Mayor Activo!
                  </h2>
                  <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
                    ¿Eres Electricista, Fontanero o Albañil? La demanda de tus
                    habilidades está en auge. No te quedes atrás.
                  </p>

                  <a
                    href="/join-as-pro"
                    className="inline-flex items-center bg-white text-indigo-600 hover:text-indigo-700 font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Regístrate como Profesional en Sumee App
                  </a>

                  <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-indigo-100">
                    <span className="flex items-center text-sm">
                      ✅ Verificados
                    </span>
                    <span className="flex items-center text-sm">
                      ✅ Oportunidades
                    </span>
                    <span className="flex items-center text-sm">
                      ✅ Crecimiento
                    </span>
                  </div>
                </div>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="border-t border-gray-200 pt-8 mb-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Etiquetas:
                  </h3>
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

              {/* Navegación */}
              <div className="border-t border-gray-200 pt-8">
                <a
                  href="/blog"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                  Volver al Blog
                </a>
              </div>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
