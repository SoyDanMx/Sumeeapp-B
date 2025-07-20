// src/components/pro-onboarding/Step3_Portfolio.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash } from '@fortawesome/free-solid-svg-icons';

// Definimos los props que este componente recibirá
interface Step3Props {
  setProfilePhoto: (file: File | null) => void;
  setWorkPhotos: (files: File[]) => void;
}

export const Step3_Portfolio: React.FC<Step3Props> = ({ setProfilePhoto, setWorkPhotos }) => {
  // Estados locales para manejar las vistas previas de las imágenes
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [workPhotosPreview, setWorkPhotosPreview] = useState<string[]>([]);

  // Manejador para la foto de perfil (un solo archivo)
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
    }
  };

  // Manejador para las fotos de trabajos (múltiples archivos)
  const handleWorkPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setWorkPhotos(files);
      const previewUrls = files.map(file => URL.createObjectURL(file));
      setWorkPhotosPreview(previewUrls);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2 text-gray-800">Paso 3: Muestra tu Trabajo</h2>
      <p className="text-gray-600 mb-6">Una buena foto de perfil y fotos de tus trabajos anteriores aumentan la confianza del cliente.</p>

      {/* Input para la Foto de Perfil */}
      <div className="space-y-2 mb-8">
        <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700">Tu Foto de Perfil (Opcional)</label>
        <input id="profilePhoto" name="profilePhoto" type="file" accept="image/*" onChange={handleProfilePhotoChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
        {profilePhotoPreview && (
          <div className="mt-4">
            <Image src={profilePhotoPreview} alt="Vista previa de perfil" width={100} height={100} className="rounded-full object-cover" />
          </div>
        )}
      </div>

      {/* Input para las Fotos de Trabajos */}
      <div className="space-y-2">
        <label htmlFor="workPhotos" className="block text-sm font-medium text-gray-700">Portafolio de Trabajos (Opcional)</label>
        <input id="workPhotos" name="workPhotos" type="file" accept="image/*" multiple onChange={handleWorkPhotosChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
        {workPhotosPreview.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {workPhotosPreview.map((url, index) => (
              <Image key={index} src={url} alt={`Vista previa trabajo ${index + 1}`} width={150} height={150} className="rounded-md object-cover" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};