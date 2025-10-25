import React from 'react';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server-new';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';

export const metadata: Metadata = {
  title: 'Pago Exitoso | Sumee App',
  description: 'Tu pago ha sido procesado exitosamente. Ahora puedes acceder a todos los servicios de Sumee App.',
};

interface PagoExitosoPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PagoExitosoPage({ searchParams }: PagoExitosoPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id as string;
  const leadId = params.lead_id as string;

  if (!sessionId) {
    redirect('/membresia?error=no_session');
  }

  const supabase = await createSupabaseServerClient();

  try {
    // Obtener información de la sesión de Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Determinar el tipo de membresía basado en el precio
        let membershipStatus = 'free';
        if (session.amount_total === 29900) { // $299 MXN en centavos
          membershipStatus = 'basic';
        } else if (session.amount_total === 49900) { // $499 MXN en centavos
          membershipStatus = 'premium';
        }

        // Actualizar el estado de membresía del usuario
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            membership_status: membershipStatus,
            stripe_customer_id: session.customer
          })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating membership:', updateError);
        }

        // Si hay un leadId, activar la solicitud
        if (leadId) {
          const { error: leadError } = await supabase
            .from('leads')
            .update({ 
              estado: 'buscando',
              cliente_id: user.id
            })
            .eq('id', leadId);

          if (leadError) {
            console.error('Error activating lead:', leadError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing payment:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Tu membresía ha sido activada exitosamente. Ahora puedes acceder a todos los servicios de Sumee App.
        </p>

        {/* Benefits List */}
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-900 mb-3">¡Ya tienes acceso a:</h3>
          <ul className="text-sm text-green-800 space-y-2">
            <li>• Solicitudes de servicio ilimitadas</li>
            <li>• Acceso a técnicos verificados</li>
            <li>• Diagnóstico por foto/video</li>
            <li>• Seguimiento en tiempo real</li>
            <li>• Garantía Sumee de 30 días</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {leadId ? (
            <Link
              href={`/solicitudes/${leadId}`}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>Ver Estado de tu Solicitud</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          ) : (
            <Link
              href="/dashboard/client"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <span>Ir a mi Dashboard</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          )}
          
          <Link
            href="/membresia"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Ver Detalles de mi Membresía
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>¿Necesitas ayuda?</strong> Contacta a nuestro equipo de soporte si tienes alguna pregunta sobre tu membresía.
          </p>
        </div>
      </div>
    </div>
  );
}
