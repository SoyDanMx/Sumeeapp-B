// src/components/ClientWhatsAppWidget.tsx
// Client Component para cargar WhatsAppWidget dinámicamente
"use client";

import dynamic from "next/dynamic";

// Widget de WhatsApp cargado dinámicamente para reducir TBT
const WhatsAppWidget = dynamic(() => import("@/components/WhatsAppWidget"), {
  ssr: false, // No renderizar en servidor ya que requiere efectos del cliente
});

export default function ClientWhatsAppWidget() {
  return <WhatsAppWidget />;
}
