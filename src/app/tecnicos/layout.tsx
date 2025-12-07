import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Encuentra Técnicos y Profesionales Verificados | Sumee App',
    description: 'Directorio de profesionales confiables para el mantenimiento de tu hogar. Plomeros, electricistas, limpieza y más en CDMX.',
    openGraph: {
        title: 'Encuentra Técnicos Expertos | Sumee App',
        description: 'Conecta con los mejores profesionales para tu hogar. Servicios verificados y seguros.',
        type: 'website',
    },
};

export default function TecnicosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
