'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faSpinner, faEye, faEyeSlash, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase/client';

export default function ClientRegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('El nombre completo es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Registrar usuario con role 'client' y plan Express por defecto
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'client', // Asegurar que se registre como cliente
            plan: 'express_free' // Plan Express gratuito por defecto
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        setSuccess(true);
        // Redirigir a página de confirmación o membresía
        setTimeout(() => {
          router.push('/membresia');
        }, 2000);
      }

    } catch (error: any) {
      console.error('Error en registro:', error);
      
      let errorMessage = 'Error al crear la cuenta. ';
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'Este correo electrónico ya está registrado. ';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'El formato del correo electrónico es inválido. ';
      } else if (error.message.includes('Password')) {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres. ';
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ¡Registro Exitoso!
        </h3>
        <p className="text-gray-600 mb-4">
          Te hemos enviado un enlace de confirmación a tu correo electrónico.
        </p>
        <p className="text-sm text-gray-500">
          Redirigiendo a la página de membresía...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre Completo */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          Nombre Completo
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faUser} className="text-gray-400" />
          </div>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Tu nombre completo"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Correo Electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      {/* Contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faLock} className="text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Mínimo 6 caracteres"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FontAwesomeIcon 
              icon={showPassword ? faEyeSlash : faEye} 
              className="text-gray-400 hover:text-gray-600" 
            />
          </button>
        </div>
      </div>

      {/* Confirmar Contraseña */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirmar Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faLock} className="text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Repite tu contraseña"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FontAwesomeIcon 
              icon={showConfirmPassword ? faEyeSlash : faEye} 
              className="text-gray-400 hover:text-gray-600" 
            />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
            Creando cuenta...
          </>
        ) : (
          'Crear Cuenta de Cliente'
        )}
      </button>

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center">
        Al registrarte, aceptas nuestros{' '}
        <Link href="/terminos" className="text-blue-600 hover:text-blue-700">
          Términos de Servicio
        </Link>
        {' '}y{' '}
        <Link href="/privacidad" className="text-blue-600 hover:text-blue-700">
          Política de Privacidad
        </Link>
      </p>
    </form>
  );
}
