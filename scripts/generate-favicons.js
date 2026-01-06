const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Script para generar todos los favicons desde logo.png
 * Genera: favicon.ico, favicon-16x16.png, favicon-32x32.png, 
 * apple-touch-icon.png, android-chrome-192x192.png, android-chrome-512x512.png
 */

const inputPath = path.join(__dirname, '..', 'public', 'logo.png');
const outputDir = path.join(__dirname, '..', 'public');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

async function generateFavicons() {
  console.log('🎨 Generando favicons desde logo.png...\n');

  // Verificar que logo.png existe
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
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toFile(path.join(outputDir, name));
      console.log(`✅ Generado: ${name} (${size}x${size})`);
    }

    // Generar favicon.ico (combinando múltiples tamaños)
    // Nota: sharp no soporta ICO directamente, generamos un PNG de 32x32
    // y lo copiamos como favicon.ico (los navegadores modernos lo aceptan)
    await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(outputDir, 'favicon.ico'));
    console.log('✅ Generado: favicon.ico (32x32)');

    console.log('\n✨ ¡Todos los favicons han sido generados exitosamente!');
    console.log('\n📝 Archivos generados en /public/:');
    sizes.forEach(({ name }) => console.log(`   - ${name}`));
    console.log('   - favicon.ico\n');

  } catch (error) {
    console.error('❌ Error generando favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
