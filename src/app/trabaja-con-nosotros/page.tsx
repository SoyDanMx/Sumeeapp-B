"use client";

import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import {
    faCode,
    faMobileAlt,
    faHardHat,
    faBullhorn,
    faBriefcase,
    faArrowRight,
    faMapMarkerAlt,
    faClock
} from "@fortawesome/free-solid-svg-icons";

// Definición de vacantes
const vacantes = [
    {
        id: "ops-field",
        title: "Ingenieros de Campo (Eléctricos y Mecánicos)",
        area: "Operaciones",
        icon: faHardHat,
        color: "bg-orange-100 text-orange-600",
        description: "Buscamos ingenieros con experiencia en campo para supervisar, validar y ejecutar proyectos de mantenimiento residencial y comercial.",
        requirements: [
            "Ingeniería Eléctrica, Mecánica o afín.",
            "Experiencia en supervisión de obra o mantenimiento.",
            "Disponibilidad para desplazarse en CDMX.",
            "Capacidad de resolución de problemas técnicos.",
        ],
    },
    {
        id: "dev-fullstack",
        title: "Desarrollador Web Fullstack",
        area: "Tecnología",
        icon: faCode,
        color: "bg-blue-100 text-blue-600",
        description: "Únete a nuestro equipo tech para construir y escalar la plataforma web de Sumee usando Next.js, React y Node.",
        requirements: [
            "Experiencia sólida en React y Next.js.",
            "Conocimiento de bases de datos (SQL/NoSQL).",
            "Experiencia con integración de APIs.",
            "Pasión por escribir código limpio y escalable.",
        ],
    },
    {
        id: "dev-mobile",
        title: "Desarrollador de Apps Móviles",
        area: "Tecnología",
        icon: faMobileAlt,
        color: "bg-purple-100 text-purple-600",
        description: "Ayúdanos a mejorar nuestra experiencia móvil nativa. Buscamos expertos en desarrollo de aplicaciones iOS y Android.",
        requirements: [
            "Experiencia en desarrollo móvil (React Native o Flutter preferible).",
            "Conocimiento de publicación en App Store y Play Store.",
            "Atención al detalle en UI/UX móvil.",
        ],
    },
    {
        id: "marketing",
        title: "Especialista en Marketing",
        area: "Growth",
        icon: faBullhorn,
        color: "bg-green-100 text-green-600",
        description: "Lidera nuestras estrategias de crecimiento, gestión de redes sociales y campañas de adquisición de usuarios.",
        requirements: [
            "Experiencia en marketing digital y Growth Hacking.",
            "Manejo de campañas en Meta Ads y Google Ads.",
            "Creatividad para creación de contenido.",
            "Análisis de métricas y KPIs.",
        ],
    },
];

export default function TrabajaConNosotrosPage() {
    const whatsappNumber = "525636741156";

    const getWhatsappLink = (jobTitle: string) => {
        const message = `Hola, me interesa aplicar para la vacante de ${jobTitle} que vi en su sitio web.`;
        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-[calc(var(--header-offset,72px))]">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Únete al Equipo <span className="text-blue-400">Sumee</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
                        Estamos construyendo el futuro de los servicios en el hogar en México.
                        Buscamos personas apasionadas, talentosas y con ganas de crecer.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full text-blue-100 text-sm font-medium border border-blue-400/30">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>Ciudad de México (Híbrido)</span>
                    </div>
                </div>
            </div>

            {/* Intro Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Vacantes Disponibles</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Explora nuestras oportunidades actuales. Si crees que tienes lo que se necesita
                        pero no ves tu puesto ideal, ¡contáctanos de todas formas!
                    </p>
                </div>

                {/* Job Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {vacantes.map((job) => (
                        <div
                            key={job.id}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col"
                        >
                            <div className="p-8 flex-1">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`w-14 h-14 ${job.color} rounded-xl flex items-center justify-center text-2xl`}>
                                        <FontAwesomeIcon icon={job.icon} />
                                    </div>
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                                        {job.area}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{job.title}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {job.description}
                                </p>

                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Requisitos:</h4>
                                    <ul className="space-y-2">
                                        {job.requirements.map((req, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="text-blue-500 mt-1">•</span>
                                                <span>{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="p-8 border-t border-gray-50 bg-gray-50/50">
                                <a
                                    href={getWhatsappLink(job.title)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-6 rounded-xl text-center transition-all duration-200 transform hover:scale-[1.01] shadow-lg shadow-green-200 flex items-center justify-center gap-2 group"
                                >
                                    <FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
                                    <span>Aplicar ahora vía WhatsApp</span>
                                    <FontAwesomeIcon icon={faArrowRight} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                                </a>
                                <p className="text-center text-xs text-gray-500 mt-3">
                                    Te responderemos lo antes posible
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* General Application */}
                <div className="mt-20 bg-blue-50 rounded-2xl p-8 md:p-12 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        ¿No encuentras tu posición ideal?
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Siempre estamos buscando talento excepcional. Envíanos tu CV y cuéntanos
                        por qué te gustaría trabajar con nosotros.
                    </p>
                    <a
                        href={`https://wa.me/${whatsappNumber}?text=Hola,%20me%20gustaría%20enviar%20mi%20CV%20para%20consideración%20futura.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 hover:underline text-lg"
                    >
                        <FontAwesomeIcon icon={faBriefcase} />
                        <span>Contáctanos espontáneamente</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
