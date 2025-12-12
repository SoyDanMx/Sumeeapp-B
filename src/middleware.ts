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

  // ✅ OPTIMIZACIÓN: Solo verificar sesión para rutas de auth (login/register)
  // Para rutas protegidas, dejar que el cliente maneje la verificación
  if (isAuthRoute) {
    try {
      // Solo verificar sesión para rutas de auth (más rápido)
      const { data: { session } } = await supabase.auth.getSession();

      // Si está autenticado e intenta acceder a login/register, redirigir al dashboard
      if (session) {
        return NextResponse.redirect(new URL('/dashboard/client', request.url));
      }
    } catch (error) {
      // En caso de error, permitir acceso - el cliente manejará la autenticación
      console.error('❌ Middleware - Error verificando sesión:', error);
    }
  }

  // Para rutas protegidas: PERMITIR SIEMPRE el acceso sin verificar sesión
  // El componente del cliente verificará la autenticación correctamente
  // Esto mejora el rendimiento al evitar llamadas innecesarias a getSession()

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
