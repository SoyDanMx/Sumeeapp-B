// src/components/ProfesionalLocationForm.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { geocodeAddress } from '@/lib/geocoding';

export default function ProfesionalLocationForm({ userId }: { userId: string }) {
    const [address, setAddress] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Buscando coordenadas...');

        const coords = await geocodeAddress(address);

        if (!coords) {
            setStatus('Error: Dirección no encontrada. Intenta ser más específico.');
            return;
        }

        setStatus('Guardando ubicación...');
        
        // 1. Guardar las coordenadas en la tabla profiles
        const { error } = await (supabase
            .from('profiles') as any)
            .update({ 
                ubicacion_lat: coords.lat, 
                ubicacion_lng: coords.lng 
            })
            .eq('user_id', userId); // Usar el user_id para actualizar el perfil

        if (error) {
            setStatus(`Error al guardar: ${error.message}`);
        } else {
            setStatus(`¡Ubicación actualizada a: ${coords.displayName}!`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded">
            <h3 className="font-semibold mb-2">Actualizar Ubicación Base</h3>
            <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ingresa tu dirección de servicio (ej: Colonia, Ciudad)"
                className="w-full p-2 border rounded mb-2"
                required
            />
            <button type="submit" className="bg-indigo-500 text-white p-2 rounded">
                Guardar Ubicación
            </button>
            <p className="text-sm mt-2">{status}</p>
        </form>
    );
}