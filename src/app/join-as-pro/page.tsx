// src/app/join-as-pro/page.tsx
'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { Step1_AccountInfo } from '@/components/pro-onboarding/Step1_AccountInfo';
import { Step2_ProfileDetails } from '@/components/pro-onboarding/Step2_ProfileDetails';
import { Step3_Portfolio } from '@/components/pro-onboarding/Step3_Portfolio';
import Image from 'next/image';
// ... (otros imports que puedas necesitar, como supabase, router, etc.)

export default function JoinAsProPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [workPhotos, setWorkPhotos] = useState<File[]>([]);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    console.log('Enviando todos los datos:', { formData, profilePhoto, workPhotos });
    // Aquí irá la lógica de Supabase que ya teníamos
  };

  return (
    <PageLayout>
      {/* 1. Sección del Banner (solo imagen) */}
      <section className="relative w-full h-40 md:h-100">
        <Image
          src="/images/banners/join-as-pro-worker.jpg"
          alt="Banner de registro para profesionales de Sumee"
          fill
          className="object-cover"
          priority
        />
      </section>

      {/* 2. Sección de Título (separada de la imagen) */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Únete a Nuestra Red de Profesionales</h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-gray-600">Conecta con miles de clientes en CDMX y haz crecer tu negocio.</p>
        </div>
      </section>

      {/* 3. Contenedor del formulario */}
      <div className="bg-gray-100 flex flex-col items-center justify-center pb-12 px-4">
        <div className="w-full max-w-2xl mx-auto">
          {/* Indicador de Pasos (sin cambios) */}
          <div className="mb-8 px-2 sm:px-8">
              <div className="flex items-center">
                  <div className={`w-1/3 text-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}><div className="rounded-full bg-white shadow-md w-12 h-12 flex items-center justify-center mx-auto mb-2 font-bold text-lg">1</div><p className="font-semibold text-sm sm:text-base">Cuenta</p></div>
                  <div className={`flex-1 border-t-2 transition-all duration-500 ${step >= 2 ? 'border-blue-600' : 'border-gray-300'}`}></div>
                  <div className={`w-1/3 text-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}><div className="rounded-full bg-white shadow-md w-12 h-12 flex items-center justify-center mx-auto mb-2 font-bold text-lg">2</div><p className="font-semibold text-sm sm:text-base">Perfil</p></div>
                  <div className={`flex-1 border-t-2 transition-all duration-500 ${step >= 3 ? 'border-blue-600' : 'border-gray-300'}`}></div>
                  <div className={`w-1/3 text-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}><div className="rounded-full bg-white shadow-md w-12 h-12 flex items-center justify-center mx-auto mb-2 font-bold text-lg">3</div><p className="font-semibold text-sm sm:text-base">Portafolio</p></div>
              </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            {step === 1 && (
                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }}><Step1_AccountInfo formData={formData} setFormData={setFormData} /><button type="submit" className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Siguiente</button></form>
            )}
            {step === 2 && (
                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }}><Step2_ProfileDetails formData={formData} setFormData={setFormData} /><div className="flex justify-between mt-8"><button type="button" onClick={prevStep} className="bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition">Anterior</button><button type="submit" className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition">Siguiente</button></div></form>
            )}
            {step === 3 && (
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}><Step3_Portfolio setProfilePhoto={setProfilePhoto} setWorkPhotos={setWorkPhotos} /><div className="flex justify-between mt-8"><button type="button" onClick={prevStep} className="bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-400 transition">Anterior</button><button type="submit" className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition">Finalizar Registro</button></div></form>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}