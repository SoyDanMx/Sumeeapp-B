import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Proceso de Verificación - Sumee App | Técnicos Verificados",
  description:
    "Conoce nuestro riguroso proceso de 4 capas para garantizar que solo los mejores profesionales entren a tu hogar. Verificación de identidad, certificaciones, background check y evaluación continua. Verifica la identidad de cualquier técnico con su ID o código QR.",
  keywords: [
    "verificación técnicos",
    "proceso verificación",
    "técnicos verificados",
    "garantía sumee",
    "background check",
    "verificar profesional",
    "QR code verificación",
    "técnicos certificados",
    "verificación identidad",
    "profesionales verificados",
    "sumee app",
    "servicios verificados",
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
    title: "Proceso de Verificación - Sumee App | Técnicos Verificados",
    description:
      "Conoce nuestro riguroso proceso de 4 capas para garantizar que solo los mejores profesionales entren a tu hogar. Verificación de identidad, certificaciones, background check y evaluación continua.",
    type: "website",
    siteName: "Sumee App",
    locale: 'es_MX',
    alternateLocale: ['es_ES', 'en_US'],
    url: 'https://www.sumeeapp.com/verificacion',
    images: [
      {
        url: 'https://www.sumeeapp.com/og-verificacion.png',
        width: 1200,
        height: 630,
        alt: 'Proceso de Verificación Sumee - 4 Pilares de Seguridad',
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
    title: "Proceso de Verificación - Sumee App | Técnicos Verificados",
    description:
      "Conoce nuestro riguroso proceso de 4 capas para garantizar que solo los mejores profesionales entren a tu hogar.",
    images: ['https://www.sumeeapp.com/og-verificacion.png'],
    site: '@sumeeapp',
    creator: '@sumeeapp',
  },
  alternates: {
    canonical: 'https://www.sumeeapp.com/verificacion',
  },
  other: {
    'og:image:width': '1200',
    'og:image:height': '630',
  },
};

export default function VerificacionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
