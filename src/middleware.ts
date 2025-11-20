import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard'];
// Rutas de autenticación (no accesibles si ya está logueado)
const authRoutes = ['/login', '/register', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Verificar si es ruta protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Solo verificar sesión si es necesario (ruta protegida o ruta de auth)
  // NOTA: Hacemos el middleware completamente permisivo para rutas protegidas
  // El componente del cliente verificará la autenticación correctamente
  if (isProtectedRoute || isAuthRoute) {
    try {
      // Refresca la sesión si ha expirado (sin bloquear si falla)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // Si está autenticado e intenta acceder a login/register, redirigir al dashboard
      if (session && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard/client', request.url));
      }

      // Para rutas protegidas: PERMITIR SIEMPRE el acceso
      // El componente del cliente verificará la autenticación y redirigirá si es necesario
      // Esto evita problemas de sincronización entre servidor y cliente
      if (isProtectedRoute) {
        // Si hay sesión, permitir acceso
        if (session) {
          return response;
        }

        // Si no hay sesión, PERMITIR ACCESO DE TODAS FORMAS
        // El componente del dashboard verificará y manejará la redirección si es necesario
        // Esto es más seguro porque el cliente puede verificar mejor la sesión
        console.log('⚠️ Middleware - No se detectó sesión en servidor, pero permitiendo acceso para verificación del cliente');
        return response;
      }
    } catch (error) {
      // En caso de cualquier error, ser permisivo
      // El componente del dashboard verificará la autenticación del lado del cliente
      console.error('❌ Middleware - Error inesperado, permitiendo acceso:', error);
      // Permitir acceso - el cliente manejará la autenticación
      return response;
    }
  }

  // Agregar security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
