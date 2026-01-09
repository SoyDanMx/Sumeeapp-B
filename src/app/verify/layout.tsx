import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verificar Profesional | Sumee App',
  description:
    'Verifica la identidad y credenciales de profesionales en Sumee. Ingresa el ID del técnico o escanea su código QR para ver su perfil verificado.',
  keywords: 'verificar técnico, verificación profesional, QR code verificación, técnico verificado',
  openGraph: {
    title: 'Verificar Profesional | Sumee App',
    description:
      'Verifica la identidad y credenciales de profesionales en Sumee. Ingresa el ID del técnico o escanea su código QR.',
    type: 'website',
    siteName: 'Sumee App',
  },
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
