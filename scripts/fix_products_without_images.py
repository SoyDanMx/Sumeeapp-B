"""
Script para identificar y resolver productos sin imágenes.
Intenta encontrar y asignar imágenes a productos que no las tienen.
"""

import os
import sys
import re
import requests
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
import time

load_dotenv('.env.local')

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

LOCAL_IMAGES_DIR = Path('public/images/marketplace/truper')
LOCAL_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

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
                    
                    return f"/images/marketplace/truper/{filename}"
        except:
            continue
    
    return None

def main():
    dry_run = '--execute' not in sys.argv
    
    print("=" * 60)
    print("🔍 IDENTIFICAR Y RESOLVER PRODUCTOS SIN IMÁGENES")
    print("=" * 60)
    
    if dry_run:
        print("\n⚠️  MODO DRY RUN - No se realizarán cambios\n")
    else:
        print("\n⚠️  MODO EJECUCIÓN - Se realizarán cambios\n")
    
    # Obtener todos los productos activos
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
        
        if len(batch) < page_size:
            break
    
    print(f"✅ {len(all_products)} productos encontrados\n")
    
    # Identificar productos sin imágenes
    products_without_images = []
    
    for product in all_products:
        images = product.get('images') or []
        
        # Verificar si tiene imágenes válidas
        valid_images = []
        for img in images:
            if img and img.strip():
                img = img.strip()
                # Verificar si es URL válida o ruta local existente
                if img.startswith('http'):
                    valid_images.append(img)
                elif img.startswith('/images/'):
                    local_path = Path('public') / img.lstrip('/')
                    if local_path.exists():
                        valid_images.append(img)
        
        if not valid_images:
            products_without_images.append(product)
    
    print(f"❌ Productos sin imágenes válidas: {len(products_without_images)}\n")
    
    if not products_without_images:
        print("✅ Todos los productos tienen imágenes válidas!")
        return
    
    # Intentar encontrar imágenes para estos productos
    print("🔍 Intentando encontrar imágenes...\n")
    
    products_to_update = []
    stats = {
        'found_by_code': 0,
        'not_found': 0,
        'already_local': 0,
    }
    
    for i, product in enumerate(products_without_images, 1):
        if i % 100 == 0:
            print(f"   Procesados {i}/{len(products_without_images)}...")
        
        title = product.get('title', '')
        description = product.get('description', '')
        code = get_product_code(title, description)
        
        if code:
            if not dry_run:
                # Intentar descargar
                local_path = download_image_from_truper(code)
                if local_path:
                    products_to_update.append({
                        'id': product['id'],
                        'title': title[:60],
                        'code': code,
                        'image': local_path,
                    })
                    stats['found_by_code'] += 1
                else:
                    stats['not_found'] += 1
            else:
                # Dry run - simular
                potential_path = f"/images/marketplace/truper/{code.upper()}.jpg"
                filepath = LOCAL_IMAGES_DIR / f"{code.upper()}.jpg"
                
                if filepath.exists():
                    stats['already_local'] += 1
                    products_to_update.append({
                        'id': product['id'],
                        'title': title[:60],
                        'code': code,
                        'image': potential_path,
                    })
                else:
                    print(f"   [DRY RUN] Intentaría descargar: {code} -> {potential_path}")
                    stats['found_by_code'] += 1
                    products_to_update.append({
                        'id': product['id'],
                        'title': title[:60],
                        'code': code,
                        'image': potential_path,
                    })
        else:
            stats['not_found'] += 1
    
    # Mostrar estadísticas
    print("\n" + "=" * 60)
    print("📊 ESTADÍSTICAS")
    print("=" * 60)
    print(f"\nTotal productos sin imágenes: {len(products_without_images)}")
    print(f"Imágenes encontradas por código: {stats['found_by_code']}")
    print(f"Ya existían localmente: {stats['already_local']}")
    print(f"No se encontró código/imagen: {stats['not_found']}")
    print(f"Productos a actualizar: {len(products_to_update)}")
    
    # Mostrar ejemplos
    if products_to_update:
        print("\n📋 EJEMPLOS DE PRODUCTOS A ACTUALIZAR (primeros 20):")
        for i, item in enumerate(products_to_update[:20], 1):
            print(f"{i}. {item['title']}...")
            print(f"   Código: {item['code']}")
            print(f"   Imagen: {item['image']}")
    
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
                        'images': [item['image']]
                    }).eq('id', item['id']).execute()
                    
                    if response.data:
                        updated_count += 1
                        if updated_count % 50 == 0:
                            print(f"   ✅ {updated_count} productos actualizados...")
                    else:
                        error_count += 1
                except Exception as e:
                    error_count += 1
                    print(f"   ❌ Error actualizando {item['id']}: {e}")
            
            print(f"\n✅ Actualización completada:")
            print(f"   Productos actualizados: {updated_count}")
            print(f"   Errores: {error_count}")
        else:
            print("\n❌ Operación cancelada")
    elif products_to_update and dry_run:
        print("\n💡 Para aplicar los cambios, ejecuta:")
        print("   python3 scripts/fix_products_without_images.py --execute --yes")
    
    print("\n" + "=" * 60)
    print("✅ PROCESO COMPLETADO")
    print("=" * 60)

if __name__ == "__main__":
    main()

