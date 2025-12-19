import { ImageResponse } from 'next/og';

/**
 * Apple Touch Icon para iOS
 * Tamaño: 180x180 (requerido por Apple)
 * 
 * Mejores prácticas:
 * - Sin bordes redondeados (iOS los agrega automáticamente)
 * - Fondo con gradiente de marca
 * - Alta resolución para pantallas Retina
 * - Logo visible y reconocible
 */

export const runtime = 'edge';
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
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
        {/* Logo simplificado: "S" estilizada más grande */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-2px',
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

