import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import ClientRegistrationForm from '@/components/auth/ClientRegistrationForm';

export const metadata: Metadata = {
  title: 'Registro de Cliente - Únete a Sumee App | Sumee App',
  description: 'Regístrate como cliente y accede a los mejores técnicos de Ciudad de México. Servicios verificados con garantía total.',
  keywords: ['registro cliente', 'técnicos CDMX', 'servicios hogar', 'Ciudad de México'],
};

export default function RegistroClientePage() {
  const benefits = [
    'Acceso a técnicos verificados',
    'Garantía total en todos los trabajos',
    'Respuesta en menos de 2 horas',
    'Múltiples cotizaciones',
    'Soporte 24/7'
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-6xl w-full mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Registration Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-center mb-8">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Logo de Sumee"
                  width={150}
                  height={40}
                  className="mx-auto mb-4"
                />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Regístrate como Cliente
              </h1>
              <p className="text-gray-600">
                Accede a los mejores técnicos de CDMX
              </p>
            </div>

            <ClientRegistrationForm />

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Inicia Sesión
                </Link>
              </p>
            </div>
          </div>

          {/* Right Side - Benefits */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-6">
              ¿Por qué registrarte en Sumee App?
            </h2>
            
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">
                Testimonio de Cliente
              </h3>
              <p className="text-blue-100 mb-3">
                "Encontré el mejor plomero de mi zona en menos de 2 horas. 
                El trabajo fue perfecto y la garantía me dio mucha tranquilidad."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center mr-3">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div>
                  <p className="font-semibold">María González</p>
                  <p className="text-blue-200 text-sm">Colonia Roma Norte</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
