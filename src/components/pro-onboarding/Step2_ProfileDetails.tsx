// src/components/pro-onboarding/Step2_ProfileDetails.tsx
'use client';

import React from 'react';

interface Step2Props {
  formData: any;
  setFormData: (data: any) => void;
}

const professions = [
  'Plomería', 'Electricidad', 'Carpintería', 'Pintura', 'Albañilería',
  'Jardinería', 'Limpieza', 'Aire Acondicionado', 'Cerrajería', 'Remodelación', 'Otro'
];

export const Step2_ProfileDetails: React.FC<Step2Props> = ({ formData, setFormData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Paso 2: Detalles de tu Perfil</h2>
      
      <div>
        <label htmlFor="profession" className="block text-sm font-medium text-gray-700">Profesión Principal *</label>
        <select
          name="profession"
          id="profession"
          value={formData.profession || ''}
          onChange={handleChange}
          required
          className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
        >
          <option value="" disabled>Selecciona tu oficio...</option>
          {professions.map(prof => <option key={prof} value={prof}>{prof}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Años de Experiencia *</label>
        <input
          type="number"
          name="experience"
          id="experience"
          value={formData.experience || ''}
          onChange={handleChange}
          required
          min="0"
          className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
          placeholder="Ej. 5"
        />
      </div>

      <div>
        {/* TEXTO ACTUALIZADO PARA CDMX */}
        <label htmlFor="workArea" className="block text-sm font-medium text-gray-700">Alcaldía Principal de Trabajo *</label>
        <input
          type="text"
          name="workArea"
          id="workArea"
          value={formData.workArea || ''}
          onChange={handleChange}
          required
          className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
          placeholder="Ej. Cuauhtémoc, CDMX" // Placeholder actualizado
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Pequeña Biografía (Opcional)</label>
        <textarea
          name="bio"
          id="bio"
          value={formData.bio || ''}
          onChange={handleChange}
          rows={4}
          className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
          placeholder="Preséntate brevemente a tus futuros clientes. Habla de tu especialidad y tu compromiso."
        />
      </div>
    </div>
  );
};