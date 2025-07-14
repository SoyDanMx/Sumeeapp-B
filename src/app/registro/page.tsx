// src/app/registro/page.tsx --- CÓDIGO DE PRUEBA

import React from 'react';

export default function PaginaDePruebaDeRegistro() {
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', textAlign: 'center', fontSize: '18px' }}>
      <h1>Página de Registro de Prueba</h1>
      <p style={{ marginTop: '20px', color: 'green', fontWeight: 'bold' }}>
        Si puedes ver este mensaje, la ruta y el archivo funcionan perfectamente.
      </p>
      <p style={{ marginTop: '10px' }}>
        Esto significa que el problema está en el código que borramos (probablemente en la conexión a Supabase o las variables de entorno).
      </p>
      <button style={{ marginTop: '30px', padding: '15px 25px', fontSize: '16px', cursor: 'pointer', border: '2px solid black' }}>
        Este es el botón que no podías ver
      </button>
    </div>
  );
}