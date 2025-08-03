// src/app/contact/page.tsx
'use client';

import React, { useState, useRef } from 'react';
import { PageLayout } from '@/components/PageLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faMapMarkerAlt, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import emailjs from '@emailjs/browser';
import Image from 'next/image';

export default function ContactPage() {
  const form = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const serviceID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (form.current && serviceID && templateID && publicKey) {
      emailjs.sendForm(serviceID, templateID, form.current, publicKey)
      .then((result) => {
          setNotification({ message: '¡Mensaje enviado con éxito! Gracias por contactarnos.', type: 'success' });
          form.current?.reset();
      }, (error) => {
          setNotification({ message: 'Hubo un error al enviar el mensaje. Intenta de nuevo.', type: 'error' });
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
        setNotification({ message: 'Error de configuración. Faltan las claves de EmailJS.', type: 'error' });
        setLoading(false);
    }
  };

  return (
    <PageLayout>
      {/* Banner Visual */}
      <section className="relative w-full h-64 md:h-80">
        <Image
          // CAMBIO: Se ha actualizado la URL por una imagen más relevante.
          src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=1200&q=80"
          alt="Banner de contacto con una persona de soporte"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold">Estamos aquí para ayudarte</h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl">Tu opinión y tus preguntas son importantes para nosotros.</p>
        </div>
      </section>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Columna Izquierda: Información de Contacto y FAQ */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Información de Contacto</h2>
              <div className="space-y-4 text-gray-700">
                <div className="flex items-start gap-4">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600 text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold">Nuestra Oficina</h3>
                    <p>Atenas 1-1 Col San Alvaro, Azcapotzalco, CDMX, C.P. 02090</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FontAwesomeIcon icon={faEnvelope} className="text-blue-600 text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold">Correo Electrónico</h3>
                    <a href="mailto:sumeeapp.com@gmail.com" className="hover:underline">sumeeapp.com@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FontAwesomeIcon icon={faPhone} className="text-blue-600 text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold">Teléfono</h3>
                    <a href="tel:+525567283971" className="hover:underline">+52 55 6728 3971</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <FontAwesomeIcon icon={faWhatsapp} className="text-green-500 text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold">WhatsApp</h3>
                    <a href="https://wa.me/525636741156" target="_blank" rel="noopener noreferrer" className="hover:underline">+52 56 3674 1156</a>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">Preguntas Frecuentes</h2>
              <div className="space-y-4 text-gray-700">
                 <div className="flex items-start gap-4">
                    <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-600 text-xl mt-1" />
                    <div>
                        <h3 className="font-semibold">¿Cómo funciona la membresía?</h3>
                        <p>Tu membresía te da acceso ilimitado para buscar y contactar a todos los profesionales de nuestra red.</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Columna Derecha: Formulario */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Envíanos un Mensaje</h2>
              <form ref={form} onSubmit={sendEmail} className="space-y-6">
                <div>
                  <label htmlFor="user_name" className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input type="text" id="user_name" name="user_name" required className="text-gray-900 mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label htmlFor="user_email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                  <input type="email" id="user_email" name="user_email" required className="text-gray-900 mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label htmlFor="user_phone" className="block text-sm font-medium text-gray-700">Teléfono (Opcional)</label>
                  <input type="tel" id="user_phone" name="user_phone" className="text-gray-900 mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensaje</label>
                  <textarea id="message" name="message" required rows={5} className="text-gray-900 mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                {notification && (
                  <div className={`p-4 rounded-md text-center ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {notification.message}
                  </div>
                )}
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-400">
                  {loading ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </PageLayout>
  );
}