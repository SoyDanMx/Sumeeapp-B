// src/components/PageLayout.tsx
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface PageLayoutProps {
  children: React.ReactNode;
}

// Este componente envuelve el contenido de nuestras páginas estáticas
// para asegurar que siempre tengan un header y un footer.
export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20 bg-gray-50">
        {children}
      </main>
      <Footer />
    </div>
  );
};