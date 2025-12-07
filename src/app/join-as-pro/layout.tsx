import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Únete como Profesional | Sumee App",
    description:
        "Encuentra trabajo como plomero, electricista o técnico en CDMX. Únete a la red de profesionales verificados de Sumee App y haz crecer tu negocio.",
    keywords: [
        "trabajo plomero cdmx",
        "trabajo electricista",
        "sumee app profesionales",
        "registro tecnicos",
        "servicios hogar mexico",
    ],
    openGraph: {
        title: "Únete como Profesional | Sumee App",
        description:
            "Conecta con clientes verificados y aumenta tus ingresos. Registro gratuito para técnicos y especialistas.",
        url: "https://sumeeapp.com/join-as-pro",
        siteName: "Sumee App",
        images: [
            {
                url: "/images/banners/join-as-pro-worker.jpg",
                width: 1200,
                height: 630,
                alt: "Profesionales trabajando en Sumee App",
            },
        ],
        locale: "es_MX",
        type: "website",
    },
};

export default function JoinAsProLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
