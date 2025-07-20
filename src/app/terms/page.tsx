// src/app/terms/page.tsx
import React from 'react';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader'; // Importamos el nuevo componente
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';

export default function TermsPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <PageHeader 
            icon={faFileAlt}
            title="Términos de Servicio"
            subtitle="Las reglas para usar nuestra plataforma."
          />
          <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg">
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>Bienvenido a Sumee App. Al utilizar nuestros servicios, aceptas estar sujeto a los siguientes términos y condiciones. Por favor, léelos cuidadosamente.</p>
              <h2 className="text-2xl font-semibold mt-6">1. Uso de la Plataforma</h2>
              <p>Sumee App es una plataforma que conecta a usuarios que buscan servicios para el hogar ("Clientes") con proveedores de servicios independientes ("Profesionales"). No somos empleadores de los Profesionales.</p>
              <h2 className="text-2xl font-semibold mt-6">2. Cuentas de Usuario</h2>
              <p>Para acceder a ciertas funcionalidades, debes registrarte y crear una cuenta. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran en tu cuenta.</p>
              {/* Agrega aquí el resto de tus términos y condiciones */}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}