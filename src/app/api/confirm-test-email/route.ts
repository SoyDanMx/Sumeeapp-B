import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Esta función solo está disponible en desarrollo' }, { status: 403 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
    }

    // Verificar que sea un email de prueba
    const testEmails = ['cliente@sumeeapp.com', 'test@sumeeapp.com', 'demo@sumeeapp.com'];
    if (!testEmails.includes(email)) {
      return NextResponse.json({ error: 'Solo se pueden confirmar emails de prueba' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuración de Supabase faltante' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar el usuario por email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      return NextResponse.json({ error: 'Error al buscar usuarios' }, { status: 500 });
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({ message: 'Email ya está confirmado' }, { status: 200 });
    }

    // Confirmar email admin
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirm: true
    });

    if (confirmError) {
      return NextResponse.json({ error: 'Error al confirmar email' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Email confirmado exitosamente',
      user_id: user.id 
    }, { status: 200 });

  } catch (error) {
    console.error('Error confirming test email:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
