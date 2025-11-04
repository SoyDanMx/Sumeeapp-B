import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Endpoint para confirmar el email de un usuario
 * Requiere SUPABASE_SERVICE_ROLE_KEY para usar el Admin API
 *
 * USO:
 * POST /api/admin/confirm-user-email
 * Body: { "email": "usuario@ejemplo.com" } o { "userId": "uuid-del-usuario" }
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Configuración de Supabase faltante" },
        { status: 500 }
      );
    }

    const { email, userId } = await request.json();

    if (!email && !userId) {
      return NextResponse.json(
        { error: "Se requiere email o userId" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar el usuario por email o userId
    let user;
    if (userId) {
      // Buscar por userId
      const { data: userData, error: userError } =
        await supabaseAdmin.auth.admin.getUserById(userId);

      if (userError) {
        return NextResponse.json(
          { error: `Usuario no encontrado: ${userError.message}` },
          { status: 404 }
        );
      }

      user = userData.user;
    } else {
      // Buscar por email
      const { data: usersData, error: listError } =
        await supabaseAdmin.auth.admin.listUsers();

      if (listError) {
        return NextResponse.json(
          { error: `Error al buscar usuarios: ${listError.message}` },
          { status: 500 }
        );
      }

      user = usersData.users.find((u) => u.email === email);

      if (!user) {
        return NextResponse.json(
          { error: `Usuario con email ${email} no encontrado en auth.users` },
          { status: 404 }
        );
      }
    }

    // Verificar si el email ya está confirmado
    if (user.email_confirmed_at) {
      return NextResponse.json({
        message: "El email ya está confirmado",
        userId: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
      });
    }

    // Confirmar el email usando Admin API
    const { data: updatedUser, error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });

    if (updateError) {
      return NextResponse.json(
        { error: `Error al confirmar email: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Verificar el perfil en public.profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      success: true,
      message: "Email confirmado exitosamente",
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        email_confirmed_at: updatedUser.user.email_confirmed_at,
      },
      profile: profile || null,
      profileError: profileError ? profileError.message : null,
      nextSteps: [
        "El usuario ahora puede iniciar sesión normalmente",
        "El perfil ya existe en public.profiles",
        "El usuario puede acceder al dashboard profesional",
      ],
    });
  } catch (error: any) {
    console.error("Error en confirm-user-email:", error);
    return NextResponse.json(
      { error: `Error interno: ${error.message}` },
      { status: 500 }
    );
  }
}
