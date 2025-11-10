'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';

interface RequiredWhatsAppModalProps {
  isOpen: boolean;
  userId: string;
  userEmail: string;
  userName: string;
  onSuccess: (whatsapp: string) => void;
}

export default function RequiredWhatsAppModal({
  isOpen,
  userId,
  userEmail,
  userName,
  onSuccess
}: RequiredWhatsAppModalProps) {
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Formatear número de WhatsApp mientras se escribe
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    
    // Limitar a 10 dígitos
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    
    setWhatsapp(value);
    setError('');
  };

  // Validar formato de WhatsApp
  const validateWhatsApp = (phone: string): boolean => {
    // Debe tener exactamente 10 dígitos
    if (phone.length !== 10) {
      setError('El número debe tener 10 dígitos');
      return false;
    }
    
    // Debe empezar con número válido de México (1-9, no 0)
    if (phone[0] === '0') {
      setError('El número no puede empezar con 0');
      return false;
    }
    
    return true;
  };

  // Guardar WhatsApp en la base de datos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateWhatsApp(whatsapp)) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Actualizar en profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          whatsapp: whatsapp,
          phone: whatsapp, // También actualizar phone si está vacío
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (profileError) {
        throw profileError;
      }
      
      // Actualizar también en auth.users metadata (para futuras referencias)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          whatsapp: whatsapp,
          phone: whatsapp
        }
      });
      
      if (metadataError) {
        console.warn('No se pudo actualizar metadata:', metadataError);
        // No es crítico, continuamos
      }
      
      // Éxito
      onSuccess(whatsapp);
      
    } catch (err) {
      console.error('Error al guardar WhatsApp:', err);
      setError('Error al guardar. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {}} // No se puede cerrar hasta que se complete
      className="relative z-50"
    >
      {/* Overlay oscuro */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
      
      {/* Container centrado */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header con icono */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FontAwesomeIcon 
                icon={faWhatsapp} 
                className="text-green-500 text-4xl" 
              />
            </div>
            <Dialog.Title className="text-2xl font-bold text-white">
              ¡Actualiza tu WhatsApp!
            </Dialog.Title>
          </div>
          
          {/* Contenido */}
          <div className="p-6">
            
            {/* Mensaje de advertencia */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
              <div className="flex items-start">
                <FontAwesomeIcon 
                  icon={faExclamationTriangle} 
                  className="text-yellow-600 mt-1 mr-3" 
                />
                <div>
                  <p className="text-sm text-yellow-800 font-semibold">
                    Acción Requerida
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Necesitamos tu número de WhatsApp para que los clientes puedan contactarte 
                    cuando aceptes trabajos.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Información del usuario */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Profesional:</strong> {userName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {userEmail}
              </p>
            </div>
            
            {/* Formulario */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label 
                  htmlFor="whatsapp" 
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Número de WhatsApp (10 dígitos) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm font-medium">+52</span>
                  </div>
                  <input
                    type="tel"
                    id="whatsapp"
                    value={whatsapp}
                    onChange={handleWhatsAppChange}
                    placeholder="5512345678"
                    className={`
                      block w-full pl-12 pr-4 py-3 border rounded-lg 
                      focus:ring-2 focus:ring-green-500 focus:border-green-500
                      text-lg font-medium
                      ${error ? 'border-red-500' : 'border-gray-300'}
                    `}
                    required
                    autoFocus
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
                
                {/* Preview del número formateado */}
                {whatsapp.length === 10 && (
                  <p className="mt-2 text-sm text-green-600 font-medium">
                    ✓ WhatsApp: +52 {whatsapp.slice(0, 3)} {whatsapp.slice(3, 6)} {whatsapp.slice(6)}
                  </p>
                )}
                
                {/* Error */}
                {error && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    ⚠ {error}
                  </p>
                )}
                
                {/* Ayuda */}
                <p className="mt-2 text-xs text-gray-500">
                  Ejemplo: 5512345678 (sin +52, sin espacios)
                </p>
              </div>
              
              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isSubmitting || whatsapp.length !== 10}
                className={`
                  w-full py-3 px-4 rounded-lg font-semibold text-white
                  transition-all duration-200 shadow-lg
                  ${
                    isSubmitting || whatsapp.length !== 10
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl'
                  }
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg 
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  'Guardar y Continuar'
                )}
              </button>
            </form>
            
            {/* Nota de privacidad */}
            <p className="mt-4 text-xs text-center text-gray-500">
              🔒 Tu número solo será visible para clientes que aceptes.
            </p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

