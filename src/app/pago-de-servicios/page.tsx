"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faCheckCircle,
  faShieldAlt,
  faClock,
  faArrowRight,
  faLock,
  faUserCheck,
  faTools,
  faFileInvoiceDollar,
  faHandshake,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function PagoDeServiciosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <FontAwesomeIcon icon={faCreditCard} className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Pago de Servicios
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transparencia, seguridad y confianza en cada paso del proceso
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          {/* How It Works Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FontAwesomeIcon icon={faClock} className="text-blue-600" />
              ¿Cómo Funciona?
            </h2>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Solicita tu Servicio
                  </h3>
                  <p className="text-gray-600">
                    Completa el formulario con los detalles de tu necesidad. Nuestro sistema
                    te pedirá guardar una tarjeta de forma segura para realizar una retención
                    de $350.00 MXN que garantiza el pago de la visita técnica.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Visita de Inspección
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Un profesional verificado acude a tu domicilio para evaluar el problema
                    y proporcionar un presupuesto detallado.
                  </p>
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-green-800 font-semibold mb-1">
                      Retención de $350.00 MXN
                    </p>
                    <p className="text-green-700 text-sm">
                      Al confirmar el acuerdo con el técnico, se realiza una retención de $350.00 MXN
                      por la visita técnica. Este monto se retiene de tu tarjeta de forma segura y se
                      cobra cuando el técnico confirma el acuerdo de visita.
                    </p>
                    <p className="text-green-700 text-sm mt-2 font-semibold">
                      ⚠️ Importante: Los $350.00 MXN de la visita técnica no son reembolsables.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Autorización del Estimado Final
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Si autorizas el estimado final de reparación propuesto por el técnico, el servicio
                    se ejecuta y el pago se procesa de forma segura.
                  </p>
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                    <p className="text-purple-800 font-semibold mb-1">
                      Descuento Automático
                    </p>
                    <p className="text-purple-700 text-sm">
                      Los $350.00 MXN de la visita técnica (ya cobrados) se toman a cuenta automáticamente
                      del costo total de la reparación. Solo pagas la diferencia entre el costo total
                      y los $350.00 MXN ya pagados.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Servicio Completado
                  </h3>
                  <p className="text-gray-600">
                    Una vez finalizado el trabajo, recibes tu factura y garantía. El pago
                    se procesa de forma segura y transparente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Key Features */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600" />
              Beneficios del Sistema
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4 p-4 bg-blue-50 rounded-lg">
                <FontAwesomeIcon icon={faLock} className="text-blue-600 text-2xl mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Pago Seguro</h3>
                  <p className="text-gray-600 text-sm">
                    Tus datos de tarjeta están protegidos con encriptación de nivel bancario.
                    No almacenamos información sensible.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-green-50 rounded-lg">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-2xl mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Transparencia Total</h3>
                  <p className="text-gray-600 text-sm">
                    Conoces todos los costos desde el inicio. Sin sorpresas ni cargos ocultos.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-purple-50 rounded-lg">
                <FontAwesomeIcon icon={faUserCheck} className="text-purple-600 text-2xl mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Protección al Cliente</h3>
                  <p className="text-gray-600 text-sm">
                    El pago solo se procesa cuando aceptas el presupuesto y se completa el servicio.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-indigo-50 rounded-lg">
                <FontAwesomeIcon icon={faHandshake} className="text-indigo-600 text-2xl mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Garantía de Satisfacción</h3>
                  <p className="text-gray-600 text-sm">
                    Si no estás satisfecho, trabajamos contigo para resolver cualquier problema.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Pricing Details */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-blue-600" />
              Detalles de Precios
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-600">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Retención por Visita Técnica
                    </h3>
                    <p className="text-gray-700">
                      $350.00 MXN por visita técnica y evaluación del problema. Este monto se retiene
                      de tu tarjeta al confirmar el acuerdo con el técnico.
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    $350
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-sm text-gray-600">
                      <strong>Importante:</strong> Este monto se retiene y se cobra cuando el técnico
                      confirma el acuerdo de visita técnica. Los $350.00 MXN de la visita técnica no son
                      reembolsables, independientemente de si autorizas o no el estimado final de reparación.
                    </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-l-4 border-green-600">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Descuento en la Reparación Final
                </h3>
                <p className="text-gray-700 mb-3">
                  Los $350.00 MXN de la visita técnica se toman a cuenta automáticamente del costo total
                  de la reparación cuando autorizas el estimado final.
                </p>
                <div className="bg-white p-4 rounded mt-3">
                  <p className="text-sm text-gray-600">
                    <strong>Ejemplo:</strong> Si la reparación cuesta $2,000 MXN y ya pagaste
                    $350 MXN por la visita técnica, solo pagarás $1,650 MXN adicionales al completar
                    el trabajo. Los $350 MXN ya pagados se descuentan automáticamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Preguntas Frecuentes
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Cuándo se cobra la retención de $350.00 MXN?
              </h3>
              <p className="text-gray-600">
                La retención de $350.00 MXN se realiza cuando el técnico confirma el acuerdo de visita técnica.
                Este monto se retiene de tu tarjeta de forma segura y se cobra inmediatamente después
                de la confirmación del técnico.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Qué pasa si no autorizo el estimado final de reparación?
              </h3>
              <p className="text-gray-600 mb-2">
                Si decides no proceder con la reparación después de la visita técnica, se confirma el
                cobro de los $350.00 MXN de la visita técnica. Este monto no es reembolsable, ya que
                cubre el costo de la visita del técnico y la evaluación del problema.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded mt-2">
                <p className="text-yellow-800 text-sm">
                  <strong>Nota:</strong> Los $350.00 MXN de la visita técnica son un cargo independiente
                  que se aplica por la visita y evaluación profesional, independientemente de si
                  decides continuar con la reparación o no.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Cómo se toman a cuenta los $350.00 MXN del costo final?
              </h3>
              <p className="text-gray-600">
                Cuando autorizas el estimado final de reparación, los $350.00 MXN ya cobrados por la
                visita técnica se toman a cuenta automáticamente. Solo pagas la diferencia entre el costo
                total de la reparación y los $350.00 MXN de la visita técnica.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mt-2">
                <p className="text-blue-800 text-sm">
                  <strong>Ejemplo:</strong> Si la reparación cuesta $2,000 MXN y ya pagaste $350 MXN
                  por la visita técnica, solo pagarás $1,650 MXN adicionales al completar el trabajo.
                  Los $350 MXN ya pagados se descuentan automáticamente.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Es seguro guardar mi tarjeta?
              </h3>
              <p className="text-gray-600">
                Sí, utilizamos Stripe, una plataforma de pagos certificada PCI-DSS nivel 1,
                el mismo estándar que usan los bancos. Nunca almacenamos los datos completos
                de tu tarjeta en nuestros servidores.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Puedo cambiar mi tarjeta después de guardarla?
              </h3>
              <p className="text-gray-600">
                Sí, puedes actualizar tu método de pago en cualquier momento desde tu perfil
                en el dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para Solicitar tu Servicio?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Comienza ahora y disfruta de un proceso transparente y seguro
          </p>
          <Link
            href="/dashboard/client"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            <span>Solicitar Servicio</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">
            ¿Tienes más preguntas sobre el sistema de pago?
          </p>
          <a
            href="mailto:contacto@sumeeapp.com"
            className="text-blue-600 hover:text-blue-700 font-semibold underline"
          >
            Contáctanos
          </a>
          <span className="text-gray-400 mx-2">|</span>
          <a
            href="tel:+525636741156"
            className="text-blue-600 hover:text-blue-700 font-semibold underline"
          >
            +52 56 3674 1156
          </a>
        </div>
      </div>
    </div>
  );
}

