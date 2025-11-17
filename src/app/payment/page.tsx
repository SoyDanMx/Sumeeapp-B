"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faCheckCircle,
  faShieldAlt,
  faClock,
  faPercent,
} from "@fortawesome/free-solid-svg-icons";

export default function PaymentPage() {
  const stripeButtonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Crear el botón de Stripe dinámicamente después de que el script se carga
  const loadStripeButton = () => {
    if (stripeButtonRef.current && stripeButtonRef.current.children.length === 0) {
      const stripeBuyButton = document.createElement("stripe-buy-button");
      stripeBuyButton.setAttribute("buy-button-id", "buy_btn_1SUbEqE2shKTNR9M6IOJSLmt");
      stripeBuyButton.setAttribute(
        "publishable-key",
        "pk_live_51P8c4AE2shKTNR9MVARQB4La2uYMMc2shlTCcpcg8EI6MqqPV1uN5uj6UbB5mpfReRKd4HL2OP1LoF17WXcYYeB000Ot1l847E"
      );
      stripeBuyButton.setAttribute("button-text", "Pagar");
      stripeButtonRef.current.appendChild(stripeBuyButton);
      console.log("✅ Stripe Buy Button creado con texto 'Pagar'");
    }
  };

  useEffect(() => {
    // Si el script ya está cargado, crear el botón inmediatamente
    if (scriptLoaded) {
      // Pequeño delay para asegurar que el script está completamente inicializado
      setTimeout(loadStripeButton, 200);
    }
  }, [scriptLoaded]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
            <FontAwesomeIcon
              icon={faCreditCard}
              className="text-white text-3xl"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tarifa de Servicio Sumee
          </h1>
          <p className="text-lg text-gray-600">
            Completa el pago de tu cuota del 10% por servicio ejecutado
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Info Section */}
            <div className="mb-8">
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                    <FontAwesomeIcon
                      icon={faPercent}
                      className="text-blue-600 text-xl"
                    />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Tarifa del 10% por Servicio Terminado
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Esta tarifa del 10% sobre el monto acordado del servicio que ejecutaste 
                    es esencial para mantener y mejorar continuamente la plataforma Sumee, 
                    garantizando que sigas recibiendo leads de calidad y herramientas 
                    profesionales para hacer crecer tu negocio.
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                      ¿En qué se invierte tu tarifa?
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>
                          <strong>Mantenimiento de la plataforma:</strong> Desarrollo continuo, 
                          seguridad, actualizaciones y mejoras tecnológicas para optimizar tu experiencia.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>
                          <strong>Inversión en publicidad y marketing:</strong> Campañas digitales 
                          que atraen clientes verificados y calificados directamente a tu perfil, 
                          aumentando tu visibilidad y oportunidades de trabajo.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>
                          <strong>Programas de beneficios para Pros:</strong> Capacitaciones, 
                          certificaciones, herramientas de gestión, soporte técnico especializado 
                          y acceso a recursos exclusivos que elevan tu competitividad.
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>
                          <strong>Sistema de matching inteligente:</strong> Tecnología de IA que 
                          conecta tus habilidades con proyectos ideales, maximizando tu tasa de 
                          éxito y satisfacción.
                        </span>
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-500 mt-4 italic">
                    Tu inversión se traduce directamente en más oportunidades de trabajo, 
                    mejores clientes y herramientas profesionales que impulsan tu crecimiento.
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="flex items-start p-4 bg-green-50 rounded-lg border border-green-200">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-600 mt-1 mr-3 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      Pago Seguro
                    </h4>
                    <p className="text-xs text-gray-600">
                      Procesado por Stripe, líder en pagos en línea
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <FontAwesomeIcon
                    icon={faShieldAlt}
                    className="text-blue-600 mt-1 mr-3 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      Protección Total
                    </h4>
                    <p className="text-xs text-gray-600">
                      Tus datos están completamente protegidos
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-purple-600 mt-1 mr-3 flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                      Proceso Rápido
                    </h4>
                    <p className="text-xs text-gray-600">
                      Completa el pago en menos de 2 minutos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-8"></div>

            {/* Payment Section */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Realiza tu Pago
              </h2>
              <p className="text-gray-600 mb-6">
                Haz clic en el botón de abajo para completar el pago de forma
                segura
              </p>

              {/* Stripe Buy Button Container */}
              <div className="flex justify-center items-center min-h-[200px] bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                <div id="stripe-buy-button-container" ref={stripeButtonRef}>
                  {/* Stripe Buy Button se renderizará aquí dinámicamente */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Nota importante:</strong> Este es un pago temporal mientras
              implementamos el cargo automático.
            </p>
            <p className="text-xs text-gray-500">
              Próximamente, el 10% se descontará automáticamente de cada
              servicio completado.
            </p>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Tienes preguntas sobre el pago?{" "}
            <a
              href="mailto:soporte@sumeeapp.com"
              className="text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              Contacta a soporte
            </a>
          </p>
        </div>
      </div>

      {/* Stripe Buy Button Script */}
      <Script
        src="https://js.stripe.com/v3/buy-button.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("✅ Stripe Buy Button script loaded");
          setScriptLoaded(true);
        }}
        onError={() => {
          console.error("❌ Error al cargar Stripe Buy Button script");
        }}
      />
    </div>
  );
}

