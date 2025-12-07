import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Trabaja con Nosotros | Vacantes en Sumee App',
    description: 'Únete al equipo de Sumee App. Buscamos talento en operaciones, desarrollo de software y marketing para revolucionar los servicios en el hogar.',
    openGraph: {
        title: 'Buscamos Talento | Sumee App',
        description: '¿Buscas nuevos retos? Revisa nuestras vacantes disponibles y únete a la startup que está cambiando los servicios en México.',
        type: 'website',
    },
};

export default function TrabajaConNosotrosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
