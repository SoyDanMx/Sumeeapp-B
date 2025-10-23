// src/app/registro/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

export default function RegistroPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'client' | 'profesional'>('client');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    setLoading(true);

    try {
      // Establecer cookie temporal para rastrear el tipo de registro
      document.cookie = `registration_type=${userType}; path=/; max-age=3600; SameSite=Lax`;
      console.log(`🍪 Cookie establecida: registration_type=${userType}`);

      // Crear la cuenta en Supabase Auth con el tipo de usuario
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            registration_type: userType, // Marcar el tipo de registro
          },
        },
      });

      if (error) throw error;

      const successMessage = userType === 'profesional' 
        ? '¡Registro exitoso como profesional! Revisa tu correo para confirmar tu cuenta y acceder a tu dashboard profesional.'
        : '¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.';
      
      alert(successMessage);
      router.push('/login');

    } catch (error: any) {
      setError(error.message || 'Ocurrió un error durante el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
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
          <h2 className="text-2xl font-bold text-gray-900">Crea tu cuenta en Sumee</h2>
          <p className="text-gray-600 mt-2">
            {userType === 'profesional' 
              ? 'Únete como profesional y recibe trabajos verificados en CDMX y área metropolitana.'
              : 'Encuentra los mejores servicios para el hogar con profesionales verificados.'
            }
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          {/* Selector de Tipo de Usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Usuario</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('client')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  userType === 'client'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">Cliente</div>
                  <div className="text-xs text-gray-500">Buscar servicios</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('profesional')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  userType === 'profesional'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold">Profesional</div>
                  <div className="text-xs text-gray-500">Ofrecer servicios</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading 
                ? 'Registrando...' 
                : userType === 'profesional' 
                  ? 'Registrarme como Profesional' 
                  : 'Registrarme como Cliente'
              }
            </button>
          </div>
        </form>

        {/* Información adicional para profesionales */}
        {userType === 'profesional' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Beneficios para Profesionales:</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Trabajos verificados y de calidad</li>
              <li>• Pago garantizado por Sumee</li>
              <li>• Dashboard profesional con métricas</li>
              <li>• Soporte técnico especializado</li>
            </ul>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}