import { ImageResponse } from 'next/og';

/**
 * Favicon dinámico para Next.js 13+ App Router
 * Genera un favicon optimizado con el logo de Sumee
 * 
 * Mejores prácticas UX/UI aplicadas:
 * - Tamaño óptimo: 32x32 para mejor legibilidad
 * - Fondo con gradiente de marca
 * - Alta resolución para pantallas Retina
 * - Colores de marca consistentes (#4F46E5, #7C3AED)
 */

export const runtime = 'edge';
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        }}
      >
        {/* Logo simplificado: "S" estilizada en blanco */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.5px',
          }}
        >
          S
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

