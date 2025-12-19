import { Metadata } from "next";
import Link from "next/link";

// Forzar regeneración de la página para asegurar que los cambios se reflejen
export const revalidate = 0; // Regenerar en cada request (solo para desarrollo, cambiar a 3600 en producción)
export const dynamic = 'force-dynamic'; // Forzar renderizado dinámico

export const metadata: Metadata = {
  title: "Política de Devoluciones y Reembolsos | Sumee Marketplace",
  description: "Política de devoluciones y reembolsos de Sumee Marketplace. Conoce nuestros términos y condiciones para devoluciones de productos.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://sumeeapp.com/politica-devoluciones",
  },
};

export default function PoliticaDevolucionesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8 mb-8 text-center shadow-lg">
          <h1 className="text-4xl font-bold mb-4">Política de Devoluciones y Reembolsos</h1>
          <p className="text-lg opacity-90">Sumee Marketplace</p>
        </header>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Última actualización:</strong> 17 de diciembre de 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              1. Información General
            </h2>
            <p className="mb-4">
              Sumee Marketplace es una plataforma que conecta profesionales verificados para la compra y venta de herramientas, equipos y suministros. Esta política de devoluciones aplica a todas las transacciones realizadas a través de nuestra plataforma.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Datos de contacto:</h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Sitio web:</strong> <a href="https://sumeeapp.com/marketplace" className="text-blue-600 hover:underline">https://sumeeapp.com/marketplace</a></li>
                <li><strong>Email:</strong> <a href="mailto:soporte@sumeeapp.com" className="text-blue-600 hover:underline">soporte@sumeeapp.com</a></li>
                <li><strong>Teléfono:</strong> <a href="tel:+525636741156" className="text-blue-600 hover:underline">+52 55 3674 1156</a></li>
                <li><strong>Horario de atención:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM (Hora de México)</li>
              </ul>
            </div>
            
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">📍 Dirección para Envío de Devoluciones:</h3>
              <div className="space-y-1 text-gray-800">
                <p className="font-semibold">NUO INTEGRACIONES Y SERVICIOS</p>
                <p>Atenas 1-1, Col. San Alvaro</p>
                <p>Azcapotzalco, Ciudad de México</p>
                <p>C.P. 02090</p>
                <p className="mt-2">
                  <strong>Email:</strong> <a href="mailto:proyectos@seguridad-avanzada.com" className="text-indigo-600 hover:underline">proyectos@seguridad-avanzada.com</a>
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              2. Plazo para Devoluciones
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Productos Nuevos</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Plazo:</strong> 15 días calendario desde la fecha de recepción del producto</li>
                  <li><strong>Condición:</strong> El producto debe estar en su estado original, sin usar, con todos los accesorios y empaque original</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Productos Usados/Seminuevos</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Plazo:</strong> 7 días calendario desde la fecha de recepción del producto</li>
                  <li><strong>Condición:</strong> El producto debe estar en el mismo estado en que fue recibido, sin daños adicionales</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Productos de Sistemas e Informática (Syscom)</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>Plazo:</strong> 15 días calendario desde la fecha de recepción</li>
                  <li><strong>Condición:</strong> Producto sin usar, con empaque original y todos los accesorios incluidos</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              3. Condiciones para Devoluciones
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3">✅ Productos Elegibles</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Productos defectuosos o que no funcionan correctamente</li>
                  <li>Productos que no corresponden a la descripción publicada</li>
                  <li>Productos dañados durante el envío (debe reportarse dentro de 48 horas)</li>
                  <li>Productos enviados por error (diferente al solicitado)</li>
                </ul>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-red-900 mb-3">❌ Productos NO Elegibles</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Productos personalizados o hechos a medida</li>
                  <li>Productos de higiene personal o consumibles abiertos</li>
                  <li>Productos descargables o servicios digitales</li>
                  <li>Productos dañados por mal uso del comprador</li>
                  <li>Productos sin empaque original o accesorios faltantes</li>
                  <li>Productos devueltos después del plazo establecido</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              4. Proceso de Devolución
            </h2>

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Paso 1: Solicitud de Devolución</h3>
                <p className="text-gray-700 mb-2">El comprador debe contactar al vendedor a través de:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 mb-3">
                  <li>Mensaje interno en la plataforma Sumee</li>
                  <li>WhatsApp del vendedor (si está disponible)</li>
                  <li>Email a <a href="mailto:soporte@sumeeapp.com" className="text-blue-600 hover:underline">soporte@sumeeapp.com</a> con el número de pedido</li>
                </ul>
                <p className="text-gray-700"><strong>Información requerida:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Número de pedido o ID de transacción</li>
                  <li>Motivo de la devolución</li>
                  <li>Fotos del producto (si aplica)</li>
                  <li>Descripción detallada del problema</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Paso 2: Autorización</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>El vendedor tiene <strong>48 horas</strong> para responder a la solicitud</li>
                  <li>Si el vendedor no responde, Sumee intervendrá como mediador</li>
                  <li>Una vez autorizada, se proporcionará una etiqueta de envío o instrucciones</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Paso 3: Envío de Devolución</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                  <li>El comprador es responsable del costo de envío de devolución, <strong>EXCEPTO:</strong>
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Productos defectuosos</li>
                      <li>Productos incorrectos enviados por el vendedor</li>
                      <li>Productos dañados durante el envío inicial</li>
                    </ul>
                  </li>
                  <li>El producto debe enviarse al vendedor en el mismo empaque original cuando sea posible</li>
                  <li>Se recomienda usar un servicio de envío con rastreo</li>
                </ul>
                
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6 mt-4">
                  <h4 className="text-lg font-semibold text-indigo-900 mb-3">📍 Dirección para Envío de Devoluciones</h4>
                  <div className="space-y-2 text-gray-800">
                    <p className="font-semibold">NUO INTEGRACIONES Y SERVICIOS</p>
                    <p>Atenas 1-1, Col. San Alvaro</p>
                    <p>Azcapotzalco, Ciudad de México</p>
                    <p>C.P. 02090</p>
                    <p className="mt-3">
                      <strong>Email:</strong> <a href="mailto:proyectos@seguridad-avanzada.com" className="text-indigo-600 hover:underline">proyectos@seguridad-avanzada.com</a>
                    </p>
                    <p className="text-sm text-gray-600 mt-3 italic">
                      Nota: Esta dirección aplica para productos vendidos directamente por Sumee Marketplace. Para productos de vendedores individuales, se proporcionará la dirección específica del vendedor al autorizar la devolución.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Paso 4: Inspección y Reembolso</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>El vendedor tiene <strong>5 días hábiles</strong> para inspeccionar el producto recibido</li>
                  <li>Una vez confirmada la devolución, el reembolso se procesará dentro de <strong>3-5 días hábiles</strong></li>
                  <li>El reembolso se realizará al método de pago original</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              5. Reembolsos
            </h2>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-4">
              <p className="text-gray-800 mb-4">
                <strong>Importante:</strong> Los reembolsos se procesan automáticamente una vez aprobada la devolución. Si no recibes tu reembolso dentro del plazo establecido, contacta a <a href="mailto:soporte@sumeeapp.com" className="text-blue-600 hover:underline">soporte@sumeeapp.com</a>
              </p>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">Métodos de Reembolso</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li><strong>Tarjeta de crédito/débito:</strong> 3-5 días hábiles después de la aprobación</li>
              <li><strong>Transferencia bancaria:</strong> 5-7 días hábiles después de la aprobación</li>
              <li><strong>PayPal:</strong> 1-3 días hábiles después de la aprobación</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">Monto del Reembolso</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Reembolso completo:</strong> Producto defectuoso, incorrecto o no recibido</li>
              <li><strong>Reembolso parcial:</strong> Producto usado más allá de inspección razonable (a discreción del vendedor)</li>
              <li><strong>Costo de envío:</strong> No reembolsable excepto en casos de error del vendedor</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              6. Cambios
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Los cambios están sujetos a disponibilidad del producto</li>
              <li>Debe solicitarse dentro del mismo plazo que las devoluciones</li>
              <li>El comprador es responsable del costo de envío del cambio</li>
              <li>Los cambios solo aplican para productos del mismo vendedor</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              7. Productos Defectuosos o Dañados
            </h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Reporte Inmediato</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Debe reportarse dentro de <strong>48 horas</strong> de recibir el producto</li>
                <li>Incluir fotografías claras del daño o defecto</li>
                <li>No usar el producto si está defectuoso</li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">Resolución</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Reemplazo inmediato (si hay stock disponible)</li>
              <li>Reembolso completo si no hay reemplazo disponible</li>
              <li>El vendedor cubre todos los costos de envío en estos casos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              8. Disputas y Mediación
            </h2>
            <p className="text-gray-700 mb-4">Si el comprador y vendedor no pueden llegar a un acuerdo:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Contactar a <a href="mailto:soporte@sumeeapp.com" className="text-blue-600 hover:underline">soporte@sumeeapp.com</a> con el número de pedido</li>
              <li>Sumee revisará el caso dentro de 3-5 días hábiles</li>
              <li>Se solicitará evidencia de ambas partes</li>
              <li>Sumee emitirá una decisión final basada en esta política</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              9. Productos de Terceros (Syscom, Truper, etc.)
            </h2>
            <p className="text-gray-700 mb-4">
              Los productos de proveedores como Syscom, Truper y otros siguen las políticas de devolución de sus respectivos proveedores. Sumee actúa como intermediario y facilitará la comunicación entre partes.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Productos Syscom:</strong> Siguen la política de devoluciones de Syscom (15 días). Los reembolsos pueden tardar hasta 10 días hábiles.</li>
              <li><strong>Productos Truper y Otros Proveedores:</strong> Siguen las políticas del proveedor original. Los tiempos pueden variar según el proveedor.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              10. Garantías
            </h2>
            <p className="text-gray-700 mb-4">
              Los productos nuevos incluyen garantía del fabricante. El comprador debe contactar directamente al fabricante para reclamar garantía. Sumee puede ayudar a facilitar el proceso.
            </p>
            <p className="text-gray-700">
              Los vendedores pueden ofrecer garantías adicionales. Estas deben estar claramente especificadas en la publicación. Sumee no es responsable de garantías adicionales del vendedor.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              11. Excepciones Especiales
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Productos de Construcción y Herramientas Pesadas</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Plazo reducido a 7 días debido a la naturaleza del uso</li>
                  <li>Deben estar sin usar y con empaque original</li>
                  <li>Inspección más rigurosa debido al uso potencial</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Productos Eléctricos y Electrónicos</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Deben probarse dentro de 48 horas de recepción</li>
                  <li>Cualquier defecto debe reportarse inmediatamente</li>
                  <li>No se aceptan devoluciones por incompatibilidad si no se consultó antes de comprar</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              12. Protección al Comprador
            </h2>
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Programa de Protección Sumee</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Sumee puede intervenir en disputas entre compradores y vendedores</li>
                <li>Evaluación caso por caso</li>
                <li>Reembolsos garantizados en casos de fraude comprobado</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              13. Contacto y Soporte
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
              <p className="text-gray-800 mb-4">Para cualquier pregunta sobre devoluciones o reembolsos:</p>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Email:</strong> <a href="mailto:soporte@sumeeapp.com" className="text-blue-600 hover:underline">soporte@sumeeapp.com</a></li>
                <li><strong>Teléfono:</strong> <a href="tel:+525636741156" className="text-blue-600 hover:underline">+52 55 3674 1156</a></li>
                <li><strong>WhatsApp:</strong> <a href="https://wa.me/525636741156" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">+52 55 3674 1156</a></li>
                <li><strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM (Hora de México)</li>
                <li><strong>Sitio web:</strong> <a href="https://sumeeapp.com/marketplace" className="text-blue-600 hover:underline">https://sumeeapp.com/marketplace</a></li>
              </ul>
            </div>
            
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-indigo-900 mb-4">📍 Dirección para Envío de Devoluciones</h3>
              <div className="space-y-2 text-gray-800">
                <p className="font-semibold text-lg">NUO INTEGRACIONES Y SERVICIOS</p>
                <p>Atenas 1-1, Col. San Alvaro</p>
                <p>Azcapotzalco, Ciudad de México</p>
                <p>C.P. 02090</p>
                <p className="mt-3">
                  <strong>Email:</strong> <a href="mailto:proyectos@seguridad-avanzada.com" className="text-indigo-600 hover:underline">proyectos@seguridad-avanzada.com</a>
                </p>
                <p className="text-sm text-gray-600 mt-4 italic border-t border-indigo-200 pt-4">
                  <strong>Nota importante:</strong> Esta dirección aplica para productos vendidos directamente por Sumee Marketplace. Para productos de vendedores individuales, se proporcionará la dirección específica del vendedor al autorizar la devolución.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              14. Cambios a esta Política
            </h2>
            <p className="text-gray-700">
              Sumee se reserva el derecho de modificar esta política en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web. Se recomienda revisar esta política periódicamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4 border-b-2 border-indigo-600 pb-2">
              15. Jurisdicción y Ley Aplicable
            </h2>
            <p className="text-gray-700">
              Esta política se rige por las leyes de los Estados Unidos Mexicanos. Cualquier disputa será resuelta en los tribunales competentes de la Ciudad de México.
            </p>
          </section>

          {/* Footer */}
          <footer className="border-t border-gray-200 pt-8 mt-12 text-center">
            <p className="text-gray-600 mb-2"><strong>Sumee Marketplace</strong></p>
            <p className="text-gray-500 text-sm mb-4">Política de Devoluciones y Reembolsos</p>
            <p className="text-gray-400 text-xs mb-6">Última actualización: 17 de diciembre de 2024</p>
            <Link 
              href="/marketplace" 
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              ← Volver al Marketplace
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}

