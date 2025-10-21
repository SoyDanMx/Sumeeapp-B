// src/app/join-as-pro/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface ValidationErrors {
  fullName?: string;
  email?: string;
}

export default function JoinAsPro() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();

  // TAREA 1: Solo captura nombre y email en el Paso 1
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });

  // TAREA 1: Validaciones de frontend
  const validateFullName = (name: string): string | undefined => {
    if (!name.trim()) return 'El nombre completo es requerido';
    if (name.trim().length < 4) return 'El nombre debe tener al menos 4 caracteres';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'El correo electrónico es requerido';
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) return 'Por favor ingresa un correo electrónico válido';
    return undefined;
  };

  // Validación en tiempo real
  const handleFieldChange = (field: 'fullName' | 'email', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFieldBlur = (field: 'fullName' | 'email') => {
    const value = formData[field];
    let error: string | undefined;
    
    if (field === 'fullName') {
      error = validateFullName(value);
    } else if (field === 'email') {
      error = validateEmail(value);
    }
    
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // TAREA 1: Verificar si el formulario es válido
  const isFormValid = () => {
    return (
      validateFullName(formData.fullName) === undefined &&
      validateEmail(formData.email) === undefined &&
      termsAccepted
    );
  };

  // TAREA 3: Función mockup para captura de lead
  const handleCaptureLead = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Mockup de API call - simular delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular respuesta exitosa
      const mockResponse = {
        success: true,
        message: '¡Genial! Revisa tu correo electrónico para continuar.'
      };

      if (mockResponse.success) {
        setSuccess(mockResponse.message);
        // Opcional: redireccionar después de 3 segundos
        setTimeout(() => {
          // router.push('/join-as-pro/step-2'); // Cuando implementes el paso 2
        }, 3000);
      }
    } catch (err) {
      setError('Hubo un problema al procesar tu registro. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // TAREA 3: Nueva función de submit que usa handleCaptureLead
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar antes de enviar
    const nameError = validateFullName(formData.fullName);
    const emailError = validateEmail(formData.email);
    
    if (nameError || emailError) {
      setValidationErrors({
        fullName: nameError,
        email: emailError
      });
      return;
    }
    
    if (!termsAccepted) {
      setError('Debes aceptar los términos y condiciones para continuar.');
      return;
    }
    
    await handleCaptureLead();
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
          {/* TAREA 1: Solo Nombre Completo y Email */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              id="fullName"
              placeholder="Ej: Juan Pérez"
              value={formData.fullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              onBlur={() => handleFieldBlur('fullName')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.fullName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
              aria-describedby="fullName-help fullName-error"
            />
            <p id="fullName-help" className="mt-1 text-xs text-gray-500">
              Tu nombre completo para tu perfil profesional.
            </p>
            {validationErrors.fullName && (
              <p id="fullName-error" className="mt-1 text-xs text-red-600">
                {validationErrors.fullName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              placeholder="tu-email@ejemplo.com"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => handleFieldBlur('email')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
              aria-describedby="email-help email-error"
            />
            <p id="email-help" className="mt-1 text-xs text-gray-500">
              Para notificaciones y confirmación.
            </p>
            {validationErrors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-600">
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* TAREA 2: Checkbox de Términos y Condiciones */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              Acepto los{' '}
              <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 underline">
                Términos de Servicio
              </a>{' '}
              y la{' '}
              <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 underline">
                Política de Privacidad
              </a>{' '}
              de Sumee App.
            </label>
          </div>

          {/* TAREA 1 y 3: Botón con validación condicional y nuevo texto */}
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className={`w-full py-3 px-4 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              isFormValid() && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            aria-label="Comenzar mi Crecimiento"
          >
            {loading ? 'Procesando...' : 'Comenzar mi Crecimiento'}
          </button>
        </form>

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
        {success && <p className="mt-4 text-center text-sm text-green-600">{success}</p>}

        <div className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">Inicia sesión</a>
        </div>
      </div>
    </div>
  );
}