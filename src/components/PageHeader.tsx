// src/components/PageHeader.tsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface PageHeaderProps {
  icon: IconDefinition;
  title: string;
  subtitle: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ icon, title, subtitle }) => {
  return (
    <div className="text-center mb-12">
      <div className="inline-block bg-blue-100 p-4 rounded-full mb-4">
        <FontAwesomeIcon icon={icon} className="text-4xl text-blue-600" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{title}</h1>
      <p className="text-md text-gray-500 mt-2">{subtitle}</p>
    </div>
  );
};