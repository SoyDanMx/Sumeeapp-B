"""
Script para implementar solución híbrida de imágenes:
- Mantiene URLs externas funcionales (Truper, Syscom)
- Descarga y usa imágenes locales para productos sin URLs válidas
"""

import os
import sys
import re
import requests
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
from collections import defaultdict
import time

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Directorio local para imágenes
LOCAL_IMAGES_DIR = Path('public/images/marketplace/truper')
LOCAL_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def is_valid_external_url(url: str) -> bool:
    """Verifica si una URL externa es válida y accesible."""
    if not url or not url.startswith('http'):
        return False
    
    try:
        response = requests.head(url, headers=HEADERS, timeout=3, allow_redirects=True)
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '').lower()
            return 'image' in content_type
        return False
    except:
        return False

def get_product_code(title: str, description: str = '') -> str:
    """Extrae el código del producto del título o descripción."""
    text = title + ' ' + description
    
    # Buscar código al inicio del título (formato: "CODIGO-123 - Descripción")
    code_match = re.search(r'^([A-Z]{2,6}-?\d{1,4}[A-Z]?)\s*-', text)
    if code_match:
        return code_match.group(1).replace('-', '')
    
    # Buscar código alfanumérico
    code_match = re.search(r'\b([A-Z]{2,6}-?\d{1,4}[A-Z]?)\b', text)
    if code_match:
        return code_match.group(1).replace('-', '')
    
    # Buscar código numérico
    code_match = re.search(r'\b(\d{5,6})\b', text)
    if code_match:
        return code_match.group(1)
    
    return None

def download_image_from_truper(code: str) -> str:
    """Intenta descargar imagen de Truper usando el código del producto."""
    if not code:
        return None
    
    # Normalizar código
    code_upper = code.upper()
    filename = f"{code_upper}.jpg"
    filepath = LOCAL_IMAGES_DIR / filename
    
    # Si ya existe localmente, retornar la ruta
    if filepath.exists():
        return f"/images/marketplace/truper/{filename}"
    
    # Intentar diferentes formatos de URL
    urls_to_try = [
        f"https://www.truper.com/media/import/imagenes/{code_upper}.jpg",
        f"https://www.truper.com/media/import/imagenes/{code}.jpg",
        f"https://www.truper.com/media/import/imagenes/{code.lower()}.jpg",
    ]
    
    for url in urls_to_try:
        try:
            response = requests.get(url, headers=HEADERS, timeout=5, stream=True)
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '').lower()
                if 'image' in content_type:
                    # Guardar imagen localmente
                    with open(filepath, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    
                    # Retornar ruta relativa para usar en la BD
                    return f"/images/marketplace/truper/{filename}"
        except Exception as e:
            continue
    
    return None

def process_products(limit: int = None, dry_run: bool = True):
    """Procesa productos y aplica solución híbrida."""
    print("=" * 60)
    print("🔄 SOLUCIÓN HÍBRIDA DE IMÁGENES")
    print("=" * 60)
    
    if dry_run:
        print("\n⚠️  MODO DRY RUN - No se realizarán cambios")
        print("   Usa --execute para aplicar los cambios\n")
    else:
        print("\n⚠️  MODO EJECUCIÓN - Se realizarán cambios\n")
    
    # Obtener productos
    print("🔍 Obteniendo productos...")
    all_products = []
    offset = 0
    page_size = 1000
    
    while True:
        response = supabase.table('marketplace_products').select(
            'id, title, description, images'
        ).eq('status', 'active').range(offset, offset + page_size - 1).execute()
        
        batch = response.data
        if not batch:
            break
        
        all_products.extend(batch)
        offset += page_size
        
        if limit and len(all_products) >= limit:
            all_products = all_products[:limit]
            break
        
        if len(batch) < page_size:
            break
    
    print(f"✅ {len(all_products)} productos encontrados\n")
    
    # Analizar y procesar
    stats = {
        'total': len(all_products),
        'with_valid_external': 0,
        'with_local_paths': 0,
        'needs_download': 0,
        'downloaded': 0,
        'failed_download': 0,
        'updated': 0,
    }
    
    products_to_update = []
    
    print("🔍 Analizando productos...\n")
    
    for i, product in enumerate(all_products, 1):
        if i % 100 == 0:
            print(f"   Procesados {i}/{len(all_products)}...")
        
        images = product.get('images') or []
        if not images:
            continue
        
        # Verificar si tiene URLs externas válidas
        valid_external_urls = []
        local_paths = []
        invalid_urls = []
        
        for img_url in images:
            img_url = img_url.strip() if img_url else ''
            if not img_url:
                continue
            
            if img_url.startswith('http'):
                # URL externa - mantener si es de dominio conocido (Truper, Syscom)
                # No verificamos cada una para evitar timeouts, confiamos en el formato
                if 'truper.com' in img_url or 'syscom.mx' in img_url or 'supabase.co' in img_url:
                    valid_external_urls.append(img_url)
                else:
                    # URL externa desconocida - verificar
                    if is_valid_external_url(img_url):
                        valid_external_urls.append(img_url)
                    else:
                        invalid_urls.append(img_url)
            elif img_url.startswith('/images/'):
                # Ruta local - verificar si existe
                local_path = Path('public') / img_url.lstrip('/')
                if local_path.exists():
                    local_paths.append(img_url)
                else:
                    invalid_urls.append(img_url)
            else:
                invalid_urls.append(img_url)
        
        # Decidir qué hacer
        final_images = []
        needs_update = False
        
        # 1. PRIORIDAD: Mantener URLs externas válidas (Truper, Syscom)
        if valid_external_urls:
            final_images.extend(valid_external_urls)
            stats['with_valid_external'] += 1
        
        # 2. Si NO hay URLs externas válidas, usar rutas locales existentes
        elif local_paths:
            final_images.extend(local_paths)
            stats['with_local_paths'] += 1
        
        # 3. Si no hay imágenes válidas, intentar descargar y usar local
        if not final_images and invalid_urls:
            stats['needs_download'] += 1
            
            # Intentar obtener código del producto
            title = product.get('title', '')
            description = product.get('description', '')
            code = get_product_code(title, description)
            
            if code and not dry_run:
                # Intentar descargar imagen
                local_path = download_image_from_truper(code)
                if local_path:
                    final_images.append(local_path)
                    stats['downloaded'] += 1
                    needs_update = True
                else:
                    stats['failed_download'] += 1
            elif code and dry_run:
                # En dry run, solo simular
                potential_path = f"/images/marketplace/truper/{code.upper()}.jpg"
                print(f"   [DRY RUN] Descargaría: {code} -> {potential_path}")
                # Simular que se agregaría
                final_images.append(potential_path)
                stats['downloaded'] += 1
                needs_update = True
        
        # Si las imágenes cambiaron, marcar para actualizar
        original_set = set(img.strip() for img in images if img and img.strip())
        final_set = set(final_images)
        
        if original_set != final_set:
            needs_update = True
        
        if needs_update and final_images:
            products_to_update.append({
                'id': product['id'],
                'title': title[:60],
                'original_images': images,
                'new_images': final_images,
            })
    
    # Mostrar estadísticas
    print("\n" + "=" * 60)
    print("📊 ESTADÍSTICAS")
    print("=" * 60)
    print(f"\nTotal productos: {stats['total']}")
    print(f"Con URLs externas válidas: {stats['with_valid_external']}")
    print(f"Con rutas locales existentes: {stats['with_local_paths']}")
    print(f"Necesitan descarga: {stats['needs_download']}")
    print(f"Imágenes descargadas: {stats['downloaded']}")
    print(f"Fallos en descarga: {stats['failed_download']}")
    print(f"Productos a actualizar: {len(products_to_update)}")
    
    # Mostrar ejemplos
    if products_to_update:
        print("\n📋 EJEMPLOS DE PRODUCTOS A ACTUALIZAR (primeros 10):")
        for i, item in enumerate(products_to_update[:10], 1):
            print(f"\n{i}. {item['title']}...")
            print(f"   Antes: {item['original_images']}")
            print(f"   Después: {item['new_images']}")
    
    # Aplicar cambios
    if products_to_update and not dry_run:
        auto_confirm = '--yes' in sys.argv or '-y' in sys.argv
        if not auto_confirm:
            confirmation = input(f"\n¿Deseas actualizar {len(products_to_update)} productos? (s/N): ").lower()
        else:
            confirmation = 's'
        
        if confirmation == 's':
            print("\n🔄 Actualizando productos...\n")
            updated_count = 0
            error_count = 0
            
            for item in products_to_update:
                try:
                    response = supabase.table('marketplace_products').update({
                        'images': item['new_images']
                    }).eq('id', item['id']).execute()
                    
                    if response.data:
                        updated_count += 1
                        if updated_count % 100 == 0:
                            print(f"   ✅ {updated_count} productos actualizados...")
                    else:
                        error_count += 1
                except Exception as e:
                    error_count += 1
                    print(f"   ❌ Error: {e}")
            
            print(f"\n✅ Actualización completada:")
            print(f"   Productos actualizados: {updated_count}")
            print(f"   Errores: {error_count}")
        else:
            print("\n❌ Operación cancelada")
    elif products_to_update and dry_run:
        print("\n💡 Para aplicar los cambios, ejecuta:")
        print("   python3 scripts/hybrid_image_solution.py --execute --yes")
    
    print("\n" + "=" * 60)
    print("✅ PROCESO COMPLETADO")
    print("=" * 60)

def main():
    dry_run = '--execute' not in sys.argv
    limit = None
    
    if '--limit' in sys.argv:
        try:
            limit_idx = sys.argv.index('--limit')
            limit = int(sys.argv[limit_idx + 1])
        except (ValueError, IndexError):
            print("❌ Error: --limit requiere un valor numérico")
            return
    
    process_products(limit=limit, dry_run=dry_run)

if __name__ == "__main__":
    main()

