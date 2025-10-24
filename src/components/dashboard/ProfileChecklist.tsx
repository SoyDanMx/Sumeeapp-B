'use client';

import React from 'react';
import { Profesional } from '@/types/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faWhatsapp, faUser, faCamera, faEdit, faPhone } from '@fortawesome/free-solid-svg-icons';

interface ProfileChecklistProps {
  profesional: Profesional;
  onEditClick: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  icon: any;
  isCompleted: boolean;
  description: string;
  actionText: string;
}

export default function ProfileChecklist({ profesional, onEditClick }: ProfileChecklistProps) {
  // Función para determinar si un campo está completo
  const isFieldComplete = (value: any): boolean => {
    return value && value !== 'N/A' && value !== '' && value !== null && value !== undefined;
  };

  // Definir los elementos del checklist
  const checklistItems: ChecklistItem[] = [
    {
      id: 'whatsapp',
      label: 'Número de WhatsApp',
      icon: faWhatsapp,
      isCompleted: isFieldComplete(profesional.whatsapp),
      description: 'Los clientes te contactarán por WhatsApp',
      actionText: 'Agregar WhatsApp'
    },
    {
      id: 'biography',
      label: 'Biografía profesional',
      icon: faUser,
      isCompleted: isFieldComplete(profesional.biografia),
      description: 'Cuéntanos sobre tu experiencia',
      actionText: 'Escribir biografía'
    },
    {
      id: 'specialties',
      label: 'Especialidades definidas',
      icon: faEdit,
      isCompleted: profesional.areas_servicio && profesional.areas_servicio.length > 0 && profesional.areas_servicio[0] !== 'Sin definir',
      description: 'Define tus áreas de especialidad',
      actionText: 'Definir especialidades'
    },
    {
      id: 'photos',
      label: 'Fotos del portafolio',
      icon: faCamera,
      isCompleted: profesional.fotos_portafolio && profesional.fotos_portafolio.length > 0,
      description: 'Muestra tu trabajo con fotos',
      actionText: 'Subir fotos'
    },
    {
      id: 'phone',
      label: 'Teléfono de contacto',
      icon: faPhone,
      isCompleted: isFieldComplete(profesional.telefono),
      description: 'Teléfono alternativo de contacto',
      actionText: 'Agregar teléfono'
    }
  ];

  // Calcular el progreso
  const completedItems = checklistItems.filter(item => item.isCompleted).length;
  const totalItems = checklistItems.length;
  const progressPercentage = Math.round((completedItems / totalItems) * 100);

  // Determinar el mensaje motivacional
  const getMotivationalMessage = () => {
    if (progressPercentage === 100) {
      return {
        title: "¡Perfil completo! 🎉",
        subtitle: "Tu perfil está optimizado para recibir más trabajos",
        color: "text-green-600"
      };
    } else if (progressPercentage >= 80) {
      return {
        title: "¡Casi listo! 🚀",
        subtitle: "Solo faltan algunos detalles para completar tu perfil",
        color: "text-blue-600"
      };
    } else if (progressPercentage >= 50) {
      return {
        title: "¡Buen progreso! 💪",
        subtitle: "Los perfiles completos reciben 3x más trabajos",
        color: "text-yellow-600"
      };
    } else {
      return {
        title: "¡Completa tu perfil! 📝",
        subtitle: "Los perfiles completos tienen 80% más probabilidades de ser contratados",
        color: "text-orange-600"
      };
    }
  };

  const motivationalMessage = getMotivationalMessage();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header con progreso */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Completar Perfil</h3>
          <span className="text-sm font-medium text-gray-500">
            {completedItems}/{totalItems}
          </span>
        </div>
        
        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Mensaje motivacional */}
        <div className="text-center">
          <h4 className={`font-semibold ${motivationalMessage.color}`}>
            {motivationalMessage.title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {motivationalMessage.subtitle}
          </p>
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="space-y-3">
        {checklistItems.map((item) => (
          <div 
            key={item.id}
            className={`flex items-center p-3 rounded-lg border transition-all duration-200 ${
              item.isCompleted 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200'
            }`}
          >
            {/* Icono de estado */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
              item.isCompleted ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <FontAwesomeIcon 
                icon={item.isCompleted ? faCheck : faTimes}
                className={`text-sm ${
                  item.isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              />
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <FontAwesomeIcon 
                  icon={item.icon} 
                  className="text-gray-500 mr-2 text-sm"
                />
                <span className={`font-medium ${
                  item.isCompleted ? 'text-green-800' : 'text-gray-700'
                }`}>
                  {item.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {item.description}
              </p>
            </div>

            {/* Botón de acción */}
            {!item.isCompleted && (
              <button
                onClick={onEditClick}
                className="ml-3 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              >
                {item.actionText}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Botón principal de edición */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onEditClick}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          {progressPercentage === 100 ? 'Actualizar Perfil' : 'Completar Perfil'}
        </button>
      </div>
    </div>
  );
}
