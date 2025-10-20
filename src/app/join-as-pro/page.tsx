// src/app/join-as-pro/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Tu cliente Supabase configurado con .env

export default function JoinAsPro() {
  const [loading, setLoading] = useState(false);
  // MEJORA: Usar `null` para el estado inicial del error es más explícito.
  const [error, setError] = useState<string | null>(null);
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
    setError(null); // Limpiamos el error al iniciar un nuevo envío

    try {
      // La lógica de llamada a la Edge Function es correcta y se mantiene.
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/pro-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Edge Function error:', data);
        if (response.status === 409) {
          alert(data.message || 'Correo ya registrado. Revisa tu inbox para el enlace de activación.');
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Error de registro. Prueba con Google para mayor rapidez.');
      }

      alert(data.message || '¡Registrado! Confirma tu correo para activar tu perfil profesional en Sumee App.');
      router.push('/login');
    
    // --- SECCIÓN CORREGIDA ---
    } catch (err) {
      console.error('Frontend error:', err);
      
      let errorMessage = 'Error interno. Por favor, contacta a soporte.';
      // Implementamos el type guard para manejar 'err' de forma segura.
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    // --- FIN DE LA SECCIÓN CORREGIDA ---

    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // La lógica de redirección dinámica para dev/prod es excelente.
          redirectTo: process.env.NODE_ENV === 'development' 
            ? `${window.location.origin}/auth/callback` 
            : 'https://sumeeapp.com/auth/callback',
        },
      });
      if (authError) {
        // El objeto de error de Supabase sí es un `Error` estándar, así que podemos lanzarlo.
        throw authError;
      }
    
    // --- SECCIÓN CORREGIDA ---
    } catch (err) {
      console.error('Error con Google Signup:', err);

      let errorMessage = 'Error con Google. Intenta registrarte con tu email.';
      // Usamos el mismo patrón seguro aquí.
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    // --- FIN DE LA SECCIÓN CORREGIDA ---

    } finally {
      setLoading(false);
    }
  };

  // El JSX se mantiene igual, ya que está bien estructurado y es funcional.
  return (
    <div className="join-as-pro min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Regístrate como Profesional</h1>
          <p className="text-gray-600">Únete a Sumee App y recibe trabajos verificados en CDMX y área metropolitana. ¡Soluciones rápidas y confiables!</p>
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 mb-4 flex items-center justify-center space-x-2 transition-colors"
          aria-label="Regístrate con Google"
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="h-5 w-5" />
          <span>Regístrate con Google (1 Clic, Sin Contraseña)</span>
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O usa email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            aria-label="Registrarse como Profesional"
          >
            {loading ? 'Registrando...' : 'Registrarse como Profesional'}
          </button>
        </form>

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

        <div className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Inicia sesión</a>
        </div>
      </div>
    </div>
  );
}