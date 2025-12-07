import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faQuoteLeft } from "@fortawesome/free-solid-svg-icons";

const TESTIMONIALS = [
    {
        id: 1,
        name: "Carlos Mendoza",
        profession: "Electricista Certificado",
        image: "/images/testimonials/pro-1.jpg",
        quote: "Desde que me uní a Sumee, mi agenda está siempre llena. Lo mejor es que los clientes ya están verificados, así que voy a lo seguro.",
        rating: 5,
        earnings: "+$18,000/mes",
    },
    {
        id: 2,
        name: "Ana Torres",
        profession: "Especialista en Limpieza",
        image: "/images/testimonials/pro-2.jpg",
        quote: "Me encanta la flexibilidad. Yo decido cuándo trabajar y en qué zonas. Los pagos son puntuales y la plataforma es muy fácil de usar.",
        rating: 5,
        earnings: "+$12,500/mes",
    },
    {
        id: 3,
        name: "Roberto Gil",
        profession: "Plomero",
        image: "/images/testimonials/pro-3.jpg",
        quote: "Antes batallaba para cobrar. Con Sumee, todo es transparente. He duplicado mis ingresos en solo 3 meses.",
        rating: 5,
        earnings: "+$22,000/mes",
    },
];

export default function ProTestimonials() {
    return (
        <div className="py-12 bg-white rounded-2xl shadow-sm border border-gray-100 my-8">
            <div className="text-center mb-10 px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Lo que dicen nuestros profesionales
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Únete a miles de técnicos que ya están haciendo crecer su negocio con Sumee App.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-7xl mx-auto">
                {TESTIMONIALS.map((testimonial) => (
                    <div
                        key={testimonial.id}
                        className="flex flex-col bg-gray-50 rounded-xl p-6 relative hover:shadow-md transition-shadow"
                    >
                        <FontAwesomeIcon
                            icon={faQuoteLeft}
                            className="text-indigo-100 text-4xl absolute top-6 left-6 -z-0"
                        />

                        <div className="flex items-center gap-4 mb-4 z-10">
                            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-gray-200">
                                {/* Fallback image if source doesn't exist, using generic avatars or Initials */}
                                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-xl">
                                    {testimonial.name.charAt(0)}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                                <p className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                                    {testimonial.profession}
                                </p>
                            </div>
                        </div>

                        <div className="flex mb-3">
                            {[...Array(5)].map((_, i) => (
                                <FontAwesomeIcon
                                    key={i}
                                    icon={faStar}
                                    className="text-yellow-400 text-sm"
                                />
                            ))}
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow italic z-10">
                            "{testimonial.quote}"
                        </p>

                        <div className="pt-4 border-t border-gray-200 mt-auto">
                            <p className="text-sm font-medium text-gray-500">
                                Ganancias promedio: <span className="text-green-600 font-bold">{testimonial.earnings}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
