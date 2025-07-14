// src/components/FooterLinkColumn.tsx
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

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
      <h3 className="text-lg font-semibold text-white mb-4 tracking-wider">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200 group">
              <FontAwesomeIcon icon={link.icon} className="w-4 h-4 mr-3 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
              <span>{link.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};