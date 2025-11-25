import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-pkce-flow, x-requested-with",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Inicializar Stripe
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
if (!stripeSecretKey) {
  console.error("❌ STRIPE_SECRET_KEY no está configurada en las variables de entorno de Supabase");
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })
  : null;

// Función auxiliar: Buscar o crear Customer en Stripe
async function findOrCreateStripeCustomer(
  supabase: any,
  userId: string,
  userEmail?: string
): Promise<string> {
  try {
    // 1. Buscar si el usuario ya tiene un stripe_customer_id en profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("user_id", userId)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error al buscar perfil:", profileError);
      throw profileError;
    }

    // 2. Si ya tiene customer_id, verificar que existe en Stripe
    if (profile?.stripe_customer_id) {
      try {
        const existingCustomer = await stripe!.customers.retrieve(
          profile.stripe_customer_id
        );
        if (existingCustomer && !existingCustomer.deleted) {
          console.log("✅ Customer existente encontrado:", profile.stripe_customer_id);
          return profile.stripe_customer_id;
        }
      } catch (stripeError: any) {
        // Si el customer no existe en Stripe, crear uno nuevo
        console.warn("⚠️ Customer ID en BD no existe en Stripe, creando nuevo:", stripeError.message);
      }
    }

    // 3. Crear nuevo Customer en Stripe
    if (!stripe) {
      throw new Error("Stripe no está configurado");
    }

    const customerEmail = userEmail || profile?.email || undefined;
    const newCustomer = await stripe.customers.create({
      email: customerEmail,
      metadata: {
        user_id: userId,
        source: "sumeeapp",
      },
    });

    console.log("✅ Nuevo Customer creado en Stripe:", newCustomer.id);

    // 4. Guardar customer_id en profiles
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ stripe_customer_id: newCustomer.id })
      .eq("user_id", userId);

    if (updateError) {
      console.warn("⚠️ No se pudo actualizar stripe_customer_id en profiles:", updateError);
      // No fallar, el customer ya está creado en Stripe
    }

    return newCustomer.id;
  } catch (error) {
    console.error("❌ Error en findOrCreateStripeCustomer:", error);
    throw error;
  }
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Verificar que Stripe está configurado
    if (!stripe) {
      return new Response(
        JSON.stringify({ error: "Stripe no está configurado. Verifica STRIPE_SECRET_KEY." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase URL o Service Key no configurados.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    });

    // Obtener usuario autenticado del header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No autorizado. Token de autenticación requerido." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "No autorizado. Token inválido." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, userId, paymentMethodId, amount } = body;

    console.log("🔧 stripe-service - Acción:", action, "Usuario:", user.id);

    // =========================================================================
    // ACCIÓN 1: Crear Setup Intent (Para guardar tarjeta)
    // =========================================================================
    if (action === "create-setup-intent") {
      try {
        const customerId = await findOrCreateStripeCustomer(
          supabase,
          user.id,
          user.email
        );

        const setupIntent = await stripe.setupIntents.create({
          customer: customerId,
          payment_method_types: ["card"],
        });

        console.log("✅ SetupIntent creado:", setupIntent.id);

        return new Response(
          JSON.stringify({
            success: true,
            clientSecret: setupIntent.client_secret,
            customerId: customerId,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error: any) {
        console.error("❌ Error creando SetupIntent:", error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message || "Error al crear SetupIntent",
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // =========================================================================
    // ACCIÓN 2: Autorizar Hold (Retener $350 MXN)
    // =========================================================================
    if (action === "authorize-hold") {
      try {
        if (!paymentMethodId) {
          return new Response(
            JSON.stringify({ success: false, error: "paymentMethodId es requerido" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const amountInCents = (amount || 350) * 100; // $350 MXN = 35000 centavos

        const customerId = await findOrCreateStripeCustomer(
          supabase,
          user.id,
          user.email
        );

        // Crear PaymentIntent con capture_method: 'manual' (solo retiene, no cobra)
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: "mxn",
          customer: customerId,
          payment_method: paymentMethodId,
          off_session: true, // No requiere confirmación del usuario
          confirm: true, // Confirmar inmediatamente
          capture_method: "manual", // CLAVE: Solo retiene, no cobra aún
          metadata: {
            user_id: user.id,
            user_email: user.email || "",
            service_type: "visita_tecnica",
            amount_mxn: String(amount || 350),
          },
        });

        console.log("✅ PaymentIntent creado (retención):", paymentIntent.id);
        console.log("💰 Monto retenido:", amountInCents / 100, "MXN");

        return new Response(
          JSON.stringify({
            success: true,
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            amount: amountInCents / 100,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error: any) {
        console.error("❌ Error autorizando hold:", error);

        // Manejar errores específicos de Stripe
        let errorMessage = "Error al autorizar el pago";
        if (error.type === "StripeCardError") {
          errorMessage = error.message || "Tu tarjeta fue rechazada. Verifica los datos e intenta con otra tarjeta.";
        } else if (error.type === "StripeInvalidRequestError") {
          errorMessage = "Error en la solicitud de pago. Verifica que tu tarjeta tenga fondos suficientes.";
        }

        return new Response(
          JSON.stringify({
            success: false,
            error: errorMessage,
            stripeError: error.message,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // =========================================================================
    // ACCIÓN 3: Capturar Pago (Para uso futuro cuando se confirme el servicio)
    // =========================================================================
    if (action === "capture-payment") {
      try {
        const { paymentIntentId } = body;

        if (!paymentIntentId) {
          return new Response(
            JSON.stringify({ success: false, error: "paymentIntentId es requerido" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

        console.log("✅ Pago capturado:", paymentIntent.id);

        return new Response(
          JSON.stringify({
            success: true,
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error: any) {
        console.error("❌ Error capturando pago:", error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message || "Error al capturar el pago",
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // =========================================================================
    // ACCIÓN 4: Cancelar Hold (Para uso futuro si el cliente rechaza)
    // =========================================================================
    if (action === "cancel-hold") {
      try {
        const { paymentIntentId } = body;

        if (!paymentIntentId) {
          return new Response(
            JSON.stringify({ success: false, error: "paymentIntentId es requerido" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

        console.log("✅ Hold cancelado:", paymentIntent.id);

        return new Response(
          JSON.stringify({
            success: true,
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error: any) {
        console.error("❌ Error cancelando hold:", error);
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message || "Error al cancelar el hold",
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Acción no reconocida
    return new Response(
      JSON.stringify({
        success: false,
        error: `Acción no reconocida: ${action}. Acciones válidas: create-setup-intent, authorize-hold, capture-payment, cancel-hold`,
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("❌ Error general en stripe-service:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Error inesperado en el servidor",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/* 
=========================================================================
INSTRUCCIONES PARA PROBAR LOCALMENTE
=========================================================================

1. Configurar variables de entorno en Supabase Dashboard:
   - STRIPE_SECRET_KEY: Tu clave secreta de Stripe (sk_test_... o sk_live_...)

2. Probar con curl (desde terminal):

   # Crear SetupIntent
   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-service' \
     --header 'Authorization: Bearer [TU_ANON_KEY]' \
     --header 'Content-Type: application/json' \
     --data '{
       "action": "create-setup-intent",
       "userId": "[USER_ID]"
     }'

   # Autorizar Hold ($350 MXN)
   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-service' \
     --header 'Authorization: Bearer [TU_ANON_KEY]' \
     --header 'Content-Type: application/json' \
     --data '{
       "action": "authorize-hold",
       "paymentMethodId": "pm_xxxx",
       "amount": 350
     }'

=========================================================================
*/

