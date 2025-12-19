#!/usr/bin/env node

/**
 * Script para generar favicons optimizados desde logo.png
 * Basado en mejores prácticas UX/UI para favicons
 * 
 * Requisitos:
 * npm install --save-dev sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

const inputPath = path.join(__dirname, '..', 'public', 'logo.png');
const outputDir = path.join(__dirname, '..', 'public');

async function generateFavicons() {
  console.log('🎨 Generando favicons optimizados desde logo.png...\n');

  // Verificar que el logo existe
  if (!fs.existsSync(inputPath)) {
    console.error('❌ Error: logo.png no encontrado en', inputPath);
    process.exit(1);
  }

  try {
    // Generar todos los tamaños PNG
    for (const { name, size } of sizes) {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 } // Fondo blanco
        })
        .png({ 
          quality: 100,
          compressionLevel: 9,
          adaptiveFiltering: true
        })
        .toFile(path.join(outputDir, name));
      console.log(`✅ Generado: ${name} (${size}x${size})`);
    }
    
    // Generar favicon.ico (combinando múltiples tamaños: 16, 32, 48)
    // Nota: sharp no soporta .ico directamente, pero podemos generar un PNG de 32x32
    // y luego usar una herramienta externa o simplemente copiar el 32x32 como favicon.ico
    await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(outputDir, 'favicon-temp-32.png'));
    
    // Para .ico real, necesitaríamos una herramienta adicional
    // Por ahora, copiamos el 32x32 como favicon.ico (Next.js lo manejará)
    fs.copyFileSync(
      path.join(outputDir, 'favicon-32x32.png'),
      path.join(outputDir, 'favicon.ico')
    );
    fs.unlinkSync(path.join(outputDir, 'favicon-temp-32.png'));
    console.log('✅ Generado: favicon.ico (desde 32x32)');
    
    console.log('\n✨ ¡Todos los favicons han sido generados exitosamente!');
    console.log('\n📋 Archivos generados en /public/:');
    sizes.forEach(({ name }) => console.log(`   - ${name}`));
    console.log('   - favicon.ico');
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Verifica que los archivos se vean correctamente');
    console.log('   2. Haz commit y push de los cambios');
    console.log('   3. Despliega en Vercel');
    console.log('   4. Espera 24-48 horas para que Google reindexe');
    
  } catch (error) {
    console.error('❌ Error generando favicons:', error);
    process.exit(1);
  }
}

generateFavicons();

