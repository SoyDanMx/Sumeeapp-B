"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faMapMarkerAlt,
  faStar,
  faHeart,
  faShoppingCart,
  faCheckCircle,
  faTools,
  faHammer,
  faBolt,
  faWrench,
  faPaintRoller,
  faTruck,
  faShieldAlt,
  faRocket,
  faUsers,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
// Using solid icon for heart (regular not available)
import Link from "next/link";
import Image from "next/image";

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Categorías principales
  const categories = [
    {
      id: "herramientas-electricas",
      name: "Herramientas Eléctricas",
      icon: faBolt,
      color: "from-yellow-500 to-orange-500",
      count: 234,
    },
    {
      id: "herramientas-manuales",
      name: "Herramientas Manuales",
      icon: faHammer,
      color: "from-blue-500 to-indigo-500",
      count: 189,
    },
    {
      id: "equipos-pesados",
      name: "Equipos Pesados",
      icon: faTruck,
      color: "from-gray-600 to-gray-800",
      count: 45,
    },
    {
      id: "suministros",
      name: "Suministros",
      icon: faShoppingCart,
      color: "from-green-500 to-emerald-500",
      count: 567,
    },
    {
      id: "seguridad",
      name: "Seguridad",
      icon: faShieldAlt,
      color: "from-red-500 to-pink-500",
      count: 123,
    },
    {
      id: "tecnologia",
      name: "Tecnología",
      icon: faRocket,
      color: "from-purple-500 to-indigo-500",
      count: 67,
    },
  ];

  // Productos destacados (mock data - será reemplazado con datos reales)
  const featuredProducts = [
    {
      id: "1",
      title: "Taladro Inalámbrico Bosch Professional",
      price: 3500,
      originalPrice: 4500,
      condition: "usado_excelente",
      location: "CDMX, Benito Juárez",
      distance: "2.3 km",
      seller: {
        name: "Carlos Méndez",
        verified: true,
        rating: 4.8,
        reviews: 23,
      },
      image: "/placeholder-tool.jpg",
      favorite: false,
      verified: true,
    },
    {
      id: "2",
      title: "Generador Honda 5500W - Excelente Estado",
      price: 12000,
      condition: "usado_bueno",
      location: "CDMX, Coyoacán",
      distance: "5.1 km",
      seller: {
        name: "María González",
        verified: true,
        rating: 4.9,
        reviews: 45,
      },
      image: "/placeholder-tool.jpg",
      favorite: true,
      verified: true,
    },
    {
      id: "3",
      title: "Kit Completo de Herramientas Eléctricas",
      price: 8500,
      originalPrice: 12000,
      condition: "nuevo",
      location: "CDMX, Miguel Hidalgo",
      distance: "3.7 km",
      seller: {
        name: "Roberto Sánchez",
        verified: true,
        rating: 4.7,
        reviews: 12,
      },
      image: "/placeholder-tool.jpg",
      favorite: false,
      verified: true,
    },
  ];

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      nuevo: { text: "Nuevo", color: "bg-green-100 text-green-700" },
      usado_excelente: {
        text: "Usado - Excelente",
        color: "bg-blue-100 text-blue-700",
      },
      usado_bueno: { text: "Usado - Bueno", color: "bg-yellow-100 text-yellow-700" },
      usado_regular: {
        text: "Usado - Regular",
        color: "bg-orange-100 text-orange-700",
      },
      para_reparar: {
        text: "Para Reparar",
        color: "bg-red-100 text-red-700",
      },
    };
    return labels[condition] || labels.usado_bueno;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white py-12 md:py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <FontAwesomeIcon icon={faRocket} className="text-sm" />
              <span className="text-sm font-semibold">Marketplace Exclusivo para Profesionales</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight">
              Marketplace de
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Herramientas y Equipos
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Compra y vende herramientas, equipos y suministros de construcción entre profesionales verificados. 
              Red social de técnicos confiables.
            </p>

            {/* Búsqueda Principal */}
            <div className="bg-white rounded-2xl shadow-2xl p-2 md:p-3 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto">
              <div className="flex-1 relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Busca herramientas, equipos, suministros..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>
              <button className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faSearch} />
                <span className="hidden sm:inline">Buscar</span>
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 md:px-6 py-3 md:py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                <FontAwesomeIcon icon={faFilter} />
                <span className="hidden sm:inline">Filtros</span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faChartLine} className="text-yellow-300" />
                <span className="font-semibold">1,234+</span>
                <span className="text-blue-100">Productos</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUsers} className="text-yellow-300" />
                <span className="font-semibold">456+</span>
                <span className="text-blue-100">Vendedores Verificados</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCheckCircle} className="text-yellow-300" />
                <span className="font-semibold">98%</span>
                <span className="text-blue-100">Satisfacción</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Explora por Categoría
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encuentra exactamente lo que necesitas para tu próximo proyecto
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`group relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  selectedCategory === category.id
                    ? "ring-4 ring-indigo-500 ring-offset-2"
                    : ""
                }`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 group-hover:opacity-100 transition-opacity`}
                />
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-3 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={category.icon}
                      className="text-2xl text-white"
                    />
                  </div>
                  <h3 className="font-bold text-white text-sm md:text-base mb-1">
                    {category.name}
                  </h3>
                  <p className="text-white/80 text-xs">
                    {category.count} productos
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Productos Destacados
              </h2>
              <p className="text-gray-600">
                Seleccionados por nuestros profesionales verificados
              </p>
            </div>
            <Link
              href="/marketplace/all"
              className="hidden md:flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Ver todos
              <FontAwesomeIcon icon={faSearch} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => {
              const condition = getConditionLabel(product.condition);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Imagen */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faTools}
                        className="text-6xl text-gray-400"
                      />
                    </div>
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.verified && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                          Verificado
                        </span>
                      )}
                      {product.originalPrice && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </span>
                      )}
                    </div>
                    <button className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <FontAwesomeIcon
                        icon={faHeart}
                        className={`${
                          product.favorite ? "text-red-500" : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Contenido */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {product.title}
                    </h3>

                    {/* Precio */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-black text-indigo-600">
                        ${product.price.toLocaleString("es-MX")}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ${product.originalPrice.toLocaleString("es-MX")}
                        </span>
                      )}
                    </div>

                    {/* Condición */}
                    <span
                      className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold mb-3 ${condition.color}`}
                    >
                      {condition.text}
                    </span>

                    {/* Vendedor */}
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {product.seller.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {product.seller.name}
                          </p>
                          {product.seller.verified && (
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="text-green-500 text-xs"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon
                            icon={faStar}
                            className="text-yellow-400 text-xs"
                          />
                          <span className="text-xs text-gray-600">
                            {product.seller.rating} ({product.seller.reviews})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ubicación */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs" />
                        <span>{product.distance}</span>
                      </div>
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Eres Profesional Verificado?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a nuestra red y comienza a vender tus herramientas y equipos a otros profesionales de confianza
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/join-as-pro"
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faRocket} />
              Únete como Profesional
            </Link>
            <Link
              href="/marketplace/sell"
              className="bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-800 transition-all border-2 border-white/20 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faShoppingCart} />
              Publicar Producto
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

