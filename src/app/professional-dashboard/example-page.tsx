'use client';

import { useProfesionalData } from '@/hooks/useProfesionalData';

export default function ProfessionalDashboardPage() {
  const { profesional, leads, isLoading, error, refetchData } = useProfesionalData();

  // Guarda de carga: Muestra un spinner mientras los datos se están cargando.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  // Guarda de error: Si hay un error, lo mostramos.
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error al Cargar Datos</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Intentar de Nuevo
          </button>
        </div>
      </div>
    );
  }

  // Guarda de perfil: Si no hay perfil, mostramos el mensaje de "Perfil no encontrado".
  if (!profesional) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Perfil no encontrado</h1>
          <p className="text-gray-600 mb-6">
            No se encontraron datos del profesional asociados a tu cuenta.
          </p>
          <button
            onClick={refetchData}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Completar Perfil
          </button>
        </div>
      </div>
    );
  }

  // Si todo va bien, renderiza el dashboard completo.
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido, {profesional.full_name}
          </h1>
          <p className="text-gray-600">
            {profesional.profession} • {profesional.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjeta de Información del Profesional */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Información del Perfil
            </h2>
            <div className="space-y-2">
              <p><strong>Nombre:</strong> {profesional.full_name}</p>
              <p><strong>Email:</strong> {profesional.email}</p>
              <p><strong>Profesión:</strong> {profesional.profession}</p>
              <p><strong>Rol:</strong> {profesional.role}</p>
              <p><strong>Estado:</strong> {profesional.status}</p>
            </div>
          </div>

          {/* Tarjeta de Leads */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Leads Asignados
            </h2>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-600">{leads.length}</p>
              <p className="text-gray-600">Leads disponibles</p>
            </div>
          </div>

          {/* Tarjeta de Acciones Rápidas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Acciones Rápidas
            </h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Ver Leads
              </button>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Actualizar Perfil
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Leads */}
        {leads.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Leads Recientes</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proyecto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leads.map((lead) => (
                      <tr key={lead.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {lead.nombre_cliente}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lead.descripcion_proyecto}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(lead.fecha_creacion).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {lead.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
