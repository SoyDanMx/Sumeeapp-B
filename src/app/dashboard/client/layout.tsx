import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | Sumee App",
    description: "Gestiona tus solicitudes de servicio, comunícate con profesionales y administra tu perfil.",
};

export default function ClientDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
