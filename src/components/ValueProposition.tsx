// src/components/ValueProposition.tsx
"use client";

import React from "react";
import { ScrollReveal } from "./ScrollReveal";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCheck,
  faShieldAlt,
  faThumbsUp,
  faCheckCircle,
  faIdCard,
  faAward,
  faCertificate,
  faLock,
  faCreditCard,
  faHandshake,
  faClock,
  faUserTie,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

// Estructura de datos enriquecida para cada pilar de valor
const valuePillars = [
  {
    icon: faUserCheck,
    title: "Profesionales Verificados",
    description:
      "Todos nuestros profesionales pasan por un riguroso proceso de verificación de 4 capas que garantiza tu seguridad y tranquilidad.",
    features: [
      {
        icon: faIdCard,
        text: "Verificación de INE/RFC con reconocimiento facial",
      },
      {
        icon: faShieldAlt,
        text: "Background check completo (antecedentes penales)",
      },
      {
        icon: faCertificate,
        text: "Certificaciones validadas con DC-3 y Red Conocer",
      },
      {
        icon: faUserTie,
        text: "Entrevista técnica y validación de experiencia",
      },
      { icon: faClock, text: "Evaluación continua y monitoreo 24/7" },
    ],
    hasCTA: true,
    ctaText: "Conoce nuestro Proceso de Verificación",
    ctaHref: "/verificacion",
  },
  {
    icon: faShieldAlt,
    title: "Pagos Seguros",
    description:
      "Las transacciones se manejan fuera de la plataforma para máxima seguridad del cliente. Trabajamos con Stripe, el estándar mundial en pagos seguros.",
    features: [
      { icon: faLock, text: "Encriptación de Nivel Bancario (SSL/TLS)" },
      {
        icon: faCreditCard,
        text: "Tarifas claras y transparentes sin sorpresas",
      },
      {
        icon: faHandshake,
        text: "Liberación de pago solo al confirmar satisfacción",
      },
      { icon: faShieldAlt, text: "Protección contra fraudes y disputas" },
      { icon: faCheckCircle, text: "Múltiples métodos de pago disponibles" },
    ],
    showStripeLogo: true,
  },
  {
    icon: faThumbsUp,
    title: "Garantía Total Sumee",
    description:
      "Sumee respalda cada trabajo con garantía financiera. Si algo sale mal, nosotros nos hacemos cargo sin preguntas ni complicaciones.",
    features: [
      {
        icon: faClock,
        text: "Garantía de 30 días (Estándar) o 90 días (Premium)",
      },
      { icon: faShieldAlt, text: "Supervisión de Calidad Sumee disponible" },
      { icon: faHandshake, text: "Mediación de Disputas gratuita" },
      { icon: faCheckCircle, text: "Cubre materiales y mano de obra" },
      { icon: faAward, text: "Reparación o reembolso garantizado" },
    ],
  },
];

export const ValueProposition = () => {
  return (
    <ScrollReveal variant="slide-up">
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Título de la sección */}
          <ScrollReveal variant="fade" delay={0}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                ¿Por qué elegir Sumee?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Ofrecemos la mejor experiencia para encontrar profesionales de
                confianza, respaldada por garantías concretas y procesos
                verificables
              </p>
            </div>
          </ScrollReveal>

          {/* Grilla de Beneficios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valuePillars.map((pillar, index) => (
              <ScrollReveal key={index} variant="slide-up" delay={index * 100}>
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-md hover:shadow-lg transition-smooth card-transition flex flex-col">
                  {/* Icono */}
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FontAwesomeIcon
                      icon={pillar.icon}
                      className="text-2xl text-blue-600"
                    />
                  </div>

                  {/* Título */}
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 text-center">
                    {pillar.title}
                  </h3>

                  {/* Descripción */}
                  <p className="text-gray-600 mb-6 text-center leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Lista de características/beneficios */}
                  <div className="flex-1 mb-6">
                    <ul className="space-y-3">
                      {pillar.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start text-left"
                        >
                          <FontAwesomeIcon
                            icon={feature.icon}
                            className="text-green-600 mr-3 mt-0.5 flex-shrink-0 text-sm"
                          />
                          <span className="text-sm text-gray-700 leading-relaxed">
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Logo de Stripe (solo para Pagos Seguros) */}
                  {pillar.showStripeLogo && (
                    <div className="mt-4 mb-4 pt-4 border-t border-gray-200 flex items-center justify-center">
                      <div className="flex flex-col items-center space-y-2">
                        <span className="text-xs text-gray-500 font-medium">
                          Powered by
                        </span>
                        {/* Logo de Stripe - usando el logo oficial como texto estilizado */}
                        <div className="flex items-center">
                          <span
                            className="text-2xl font-bold tracking-tight"
                            style={{
                              background:
                                "linear-gradient(135deg, #635BFF 0%, #0A2540 100%)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }}
                          >
                            Stripe
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Pago seguro certificado
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CTA para Verificación */}
                  {pillar.hasCTA && (
                    <div className="mt-auto pt-4 border-t border-gray-200">
                      <Link
                        href={pillar.ctaHref}
                        className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                      >
                        <span className="mr-2">{pillar.ctaText}</span>
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="text-sm"
                        />
                      </Link>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
};
