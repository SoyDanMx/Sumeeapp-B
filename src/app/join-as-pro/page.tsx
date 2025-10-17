// src/app/join-as-pro/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/PageLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToolbox, faCheckCircle, faArrowRight, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link';

export default function JoinAsProPage() {
  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUserExists(false);

    try {
      const functionUrl = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/pro-signup';
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` 
        },
        body: JSON.stringify({ fullName, profession, email, phone, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setUserExists(true);
        } else {
          throw new Error(result.error || 'Ocurrió un error desconocido durante el registro.');
        }
      } else {
        setSuccess(true);
        // MEJORA: Redirigir automáticamente al login después de 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          <div className="p-8 md:p-12">
            {success ? (
              <div className="text-center flex flex-col justify-center h-full">
                <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500 mb-4" />
                <h2 className="text-3xl font-bold text-gray-800">¡Registro casi completo!</h2>
                <p className="mt-2 text-gray-600">Hemos enviado un enlace de confirmación a <strong>{email}</strong>. Por favor, revisa tu correo para activar tu cuenta.</p>
                <p className="mt-4 text-sm text-gray-500">En unos segundos serás redirigido para iniciar sesión...</p>
              </div>
            ) : userExists ? (
              <div className="text-center flex flex-col justify-center h-full">
                <FontAwesomeIcon icon={faExclamationCircle} className="text-6xl text-yellow-500 mb-4" />
                <h2 className="text-3xl font-bold text-gray-800">¡Hola de nuevo!</h2>
                <p className="mt-2 text-gray-600 mb-6">Este correo o teléfono ya está registrado. Por favor, inicia sesión para continuar.</p>
                <Link href="/login" className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  Iniciar Sesión
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-800">Conviértete en Profesional Sumee</h2>
                <p className="mt-2 text-gray-600">Regístrate en 60 segundos y empieza a recibir clientes en CDMX.</p>
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                    <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="profession" className="block text-sm font-medium text-gray-700">Tu Oficio Principal</label>
                    <input type="text" id="profession" value={profession} onChange={(e) => setProfession(e.target.value)} required placeholder="Ej. Plomero, Electricista, Carpintero" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono (WhatsApp)</label>
                    <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Crea tu Contraseña</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
                    {loading ? 'Registrando...' : 'Crear mi Cuenta de Profesional'}
                    {!loading && <FontAwesomeIcon icon={faArrowRight} />}
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                    Ya tengo una cuenta de profesional
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="hidden lg:block relative">
            <Image
              src="/images/banners/join-as-pro-worker.jpg"
              alt="Profesional de Sumee trabajando"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <FontAwesomeIcon icon={faToolbox} className="text-4xl mb-4" />
              <h3 className="text-2xl font-bold">Más Clientes. Menos Complicaciones.</h3>
              <p className="mt-2">Únete a la plataforma de confianza en CDMX y dedica tu tiempo a lo que mejor sabes hacer.</p>
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}