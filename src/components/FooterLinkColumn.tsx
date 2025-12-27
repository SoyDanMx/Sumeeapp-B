// src/components/FooterLinkColumn.tsx
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

// Las interfaces de TypeScript se mantienen, ¡están perfectas!
interface FooterLink {
  href: string;
  icon: IconDefinition;
  text: string;
}

interface FooterLinkColumnProps {
  title: string;
  links: FooterLink[];
}

export const FooterLinkColumn: React.FC<FooterLinkColumnProps> = ({ title, links }) => {
  return (
    <div>
      {/* Título en verde como en la imagen de referencia - Solo mostrar si hay título */}
      {title && (
        <h3 className="text-base font-semibold text-green-600 mb-4">{title}</h3>
      )}
      
      <ul className="space-y-2">
        {links.map((link, index) => (
          <li key={`${link.text}-${link.href}-${index}`}>
            <Link href={link.href} className="flex items-center text-gray-700 hover:text-green-600 transition-colors duration-200 group">
              <FontAwesomeIcon 
                icon={link.icon} 
                className="w-3 h-3 mr-2 text-gray-500 group-hover:text-green-600 transition-colors duration-200 opacity-0 group-hover:opacity-100" 
              />
              <span className="text-sm">{link.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};