// src/context/LocationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SelectedLocation } from '../components/LocationSelectorModal'; // Asegúrate de la ruta correcta aquí

interface LocationContextType {
  location: SelectedLocation | undefined;
  setLocation: (loc: SelectedLocation | undefined) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocationState] = useState<SelectedLocation | undefined>(undefined);

  useEffect(() => {
    // Cargar ubicación de localStorage al inicio
    const storedLocation = localStorage.getItem('sumee_selected_location');
    if (storedLocation) {
      setLocationState(JSON.parse(storedLocation));
    }
  }, []);

  const setLocation = (loc: SelectedLocation | undefined) => {
    setLocationState(loc);
    if (loc) {
      localStorage.setItem('sumee_selected_location', JSON.stringify(loc));
    } else {
      localStorage.removeItem('sumee_selected_location');
    }
  };

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};