import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verificar Profesional | Sumee App - Verificación de Técnicos',
  description:
    'Verifica la identidad y credenciales de profesionales en Sumee. Ingresa el ID del técnico o escanea su código QR para ver su perfil verificado, calificaciones, reseñas y certificaciones.',
  keywords: [
    'verificar técnico',
    'verificación profesional',
    'QR code verificación',
    'técnico verificado',
    'verificar profesional sumee',
    'código QR técnico',
    'verificación identidad',
    'profesional certificado',
  ].join(', '),
  authors: [{ name: 'Sumee App' }],
  creator: 'Sumee App',
  publisher: 'Sumee App',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Verificar Profesional | Sumee App - Verificación de Técnicos',
    description:
      'Verifica la identidad y credenciales de profesionales en Sumee. Ingresa el ID del técnico o escanea su código QR para ver su perfil verificado.',
    type: 'website',
    siteName: 'Sumee App',
    locale: 'es_MX',
    alternateLocale: ['es_ES', 'en_US'],
    url: 'https://www.sumeeapp.com/verify',
    images: [
      {
        url: 'https://www.sumeeapp.com/og-verify.png',
        width: 1200,
        height: 630,
        alt: 'Verificar Profesional en Sumee - Sistema de Verificación',
      },
      {
        url: 'https://www.sumeeapp.com/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Sumee App - Profesionales Verificados',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verificar Profesional | Sumee App',
    description:
      'Verifica la identidad y credenciales de profesionales en Sumee. Ingresa el ID del técnico o escanea su código QR.',
    images: ['https://www.sumeeapp.com/og-verify.png'],
    site: '@sumeeapp',
    creator: '@sumeeapp',
  },
  alternates: {
    canonical: 'https://www.sumeeapp.com/verify',
  },
  other: {
    'og:image:width': '1200',
    'og:image:height': '630',
  },
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
