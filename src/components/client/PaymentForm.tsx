// src/components/client/PaymentForm.tsx
// Componente aislado para el formulario de pago con Stripe Elements

"use client";

import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCheck, faKey, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

interface PaymentFormProps {
  onSuccess: (paymentMethodId: string) => void;
  onError: (errorMessage: string) => void;
  amount?: number; // Monto a retener (default: $350 MXN)
  userEmail?: string; // Email del usuario (requerido si fields.billing_details.email es "never")
  userPhone?: string; // Teléfono del usuario (requerido si fields.billing_details.phone es "never")
}

export default function PaymentForm({
  onSuccess,
  onError,
  amount = 350,
  userEmail,
  userPhone,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      const error = "Stripe no está inicializado. Por favor, recarga la página.";
      setErrorMessage(error);
      onError(error);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Confirmar el Setup Intent (guardar tarjeta sin cobrar)
      // Esto valida la tarjeta y la guarda para uso futuro
      // IMPORTANTE: Si fields.billing_details.email/phone es "never", debemos pasar los datos aquí
      const confirmParams: any = {
        return_url: window.location.origin, // Fallback si necesita redirigir
      };

      // Si tenemos email o teléfono del usuario, pasarlos en payment_method_data
      if (userEmail || userPhone) {
        confirmParams.payment_method_data = {
          billing_details: {
            ...(userEmail && { email: userEmail }),
            ...(userPhone && { phone: userPhone }),
          },
        };
      }

      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: "if_required", // No redirigir si no es necesario
        confirmParams,
      });

      if (error) {
        // Manejar errores específicos de Stripe
        let userFriendlyMessage = error.message || "Error al validar la tarjeta";

        if (error.type === "card_error") {
          userFriendlyMessage = "Tu tarjeta fue rechazada. Verifica los datos e intenta con otra tarjeta.";
        } else if (error.type === "validation_error") {
          userFriendlyMessage = "Por favor, completa todos los campos de la tarjeta correctamente.";
        }

        setErrorMessage(userFriendlyMessage);
        onError(userFriendlyMessage);
        setIsProcessing(false);
        return;
      }

      // 2. Verificar que el SetupIntent fue exitoso
      if (setupIntent && setupIntent.status === "succeeded") {
        // setupIntent.payment_method contiene el ID del método de pago (pm_xxxx)
        const paymentMethodId = setupIntent.payment_method as string;

        if (!paymentMethodId) {
          throw new Error("No se pudo obtener el ID del método de pago");
        }

        console.log("✅ Tarjeta guardada exitosamente. Payment Method ID:", paymentMethodId);
        
        // 3. Pasar el payment_method_id al componente padre
        onSuccess(paymentMethodId);
      } else {
        throw new Error(`SetupIntent no completado. Estado: ${setupIntent?.status}`);
      }
    } catch (error: any) {
      console.error("❌ Error en PaymentForm:", error);
      const errorMsg = error.message || "Error inesperado al procesar el pago";
      setErrorMessage(errorMsg);
      onError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mensaje informativo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>💳 Retención Temporal:</strong> Se realizará una retención de{" "}
          <strong>${amount.toLocaleString("es-MX")} MXN</strong> en tu tarjeta.
          <br />
          <span className="text-xs text-blue-600 mt-1 block">
            Solo se cobrará si el servicio se concreta. Si rechazas el estimado, se cobrará únicamente la tarifa de visita.
          </span>
        </p>
      </div>

      {/* PaymentElement de Stripe */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg">
        <PaymentElement
          options={{
            layout: "tabs", // Diseño con pestañas (más compacto)
            fields: {
              billingDetails: {
                email: "never", // No pedir email (ya lo tenemos del usuario)
                phone: "never", // No pedir teléfono (ya lo tenemos)
              },
            },
          }}
        />
      </div>

      {/* Mensaje de error */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-red-600 mt-0.5 flex-shrink-0"
          />
          <p className="text-sm text-red-800 flex-1">{errorMessage}</p>
        </div>
      )}

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
      >
        {isProcessing ? (
          <>
            <FontAwesomeIcon icon={faSpinner} spin className="text-lg" />
            <span>Procesando...</span>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faCheck} className="text-lg" />
            <span>Guardar Tarjeta y Continuar</span>
          </>
        )}
      </button>

      {/* Mensaje de seguridad */}
      <p className="text-[10px] text-gray-500 text-center flex items-center justify-center gap-1">
        <FontAwesomeIcon icon={faKey} className="text-xs" />
        <span>
          Pagos seguros encriptados por Stripe. No se realizará el cobro hasta confirmar el servicio.
        </span>
      </p>
    </form>
  );
}

