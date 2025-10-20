'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Tu cliente Supabase configurado con .env

export default function JoinAsPro() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    profession: '',
    phone: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/pro-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Edge Function error:', data);
        if (response.status === 409) {
          // Duplicado: Reenvió de confirmación
          alert(data.message || 'Correo ya registrado. Revisa tu inbox para el enlace de activación.');
          router.push('/login'); // Redirige a login
          return;
        }
        throw new Error(data.error || 'Error de registro. Prueba con Google para mayor rapidez.');
      }

      // Éxito: Usuario registrado, espera confirmación por correo
      alert(data.message || '¡Registrado! Confirma tu correo para activar tu perfil profesional en Sumee App.');
      router.push('/login'); // O a dashboard si confirmado
    } catch (err) {
      console.error('Frontend error:', err);
      // FIX: Type guard para err (resuelve "err is unknown")
      if (err instanceof Error) {
        setError(err.message || 'Error interno. Contacta soporte.');
      } else {
        setError('Error desconocido. Contacta soporte.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.NODE_ENV === 'development' 
            ? `${window.location.origin}/auth/callback` 
            : 'https://sumeeapp.com/auth/callback', // Callback dinámico para dev/prod
        },
      });
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      // FIX: Type guard aquí también
      if (err instanceof Error) {
        setError(err.message || 'Error con Google. Intenta con email.');
      } else {
        setError('Error con Google. Intenta con email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-as-pro min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Regístrate como Profesional</h1>
          <p className="text-gray-600">Únete a Sumee App y recibe trabajos verificados en CDMX y área metropolitana. ¡Soluciones rápidas y confiables!</p>
        </div>

        {/* Google 1-Click (Sin Fricción) */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 mb-4 flex items-center justify-center space-x-2"
          aria-label="Regístrate con Google"
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="h-5 w-5" />
          <span>Regístrate con Google (1 Clic, Sin Contraseña)</span>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O usa email</span>
          </div>
        </div>

        {/* Formulario Email */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              id="fullName"
              placeholder="Ej: Juan Pérez"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              minLength={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-describedby="fullName-help"
            />
            <p id="fullName-help" className="mt-1 text-xs text-gray-500">Tu nombre completo para tu perfil profesional.</p>
          </div>

          <div>
            <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">Profesión</label>
            <input
              type="text"
              id="profession"
              placeholder="Ej: Plomero, Electricista"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              required
              minLength={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-describedby="profession-help"
            />
            <p id="profession-help" className="mt-1 text-xs text-gray-500">Tu especialidad (e.g., A/C, CCTV).</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono (+52)</label>
            <input
              type="tel"
              id="phone"
              placeholder="+521234567890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              minLength={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-describedby="phone-help"
            />
            <p id="phone-help" className="mt-1 text-xs text-gray-500">Para citas rápidas con usuarios.</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              placeholder="tu-email@ejemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-describedby="email-help"
            />
            <p id="email-help" className="mt-1 text-xs text-gray-500">Para notificaciones y confirmación.</p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña (mín. 8 caracteres)</label>
            <input
              type="password"
              id="password"
              placeholder="Contraseña segura"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-describedby="password-help"
            />
            <p id="password-help" className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres para seguridad.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            aria-label="Registrarse como Profesional"
          >
            {loading ? 'Registrando...' : 'Registrarse como Profesional'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={() => setError('')} 
              className="mt-2 text-sm text-red-600 underline"
            >
              Cerrar
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Inicia sesión</a>
        </div>
      </div>
    </div>
  );
}