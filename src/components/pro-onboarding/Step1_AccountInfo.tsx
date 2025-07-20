// src/components/pro-onboarding/Step1_AccountInfo.tsx
'use client';
import React from 'react';

interface Step1Props {
  formData: any;
  setFormData: (data: any) => void;
}

export const Step1_AccountInfo: React.FC<Step1Props> = ({ formData, setFormData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Paso 1: Información de tu Cuenta</h2>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nombre Completo *</label>
        <input type="text" name="fullName" id="fullName" value={formData.fullName || ''} onChange={handleChange} required className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500" placeholder="Ej. Juan Rodríguez" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico *</label>
        <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} required className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500" placeholder="tu@correo.com" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña *</label>
        <input type="password" name="password" id="password" value={formData.password || ''} onChange={handleChange} required minLength={8} className="text-gray-900 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500" placeholder="Mínimo 8 caracteres" />
      </div>
    </div>
  );
};